
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { generateSpeech } from './services/geminiService';
import { VOICE_OPTIONS, TONE_OPTIONS } from './constants';
import { Header } from './components/Header';
import { TextArea } from './components/TextArea';
import { ControlSlider } from './components/ControlSlider';
import { VoiceSelector } from './components/VoiceSelector';
import { ToneInput } from './components/ToneInput';
import { GenerateButton } from './components/GenerateButton';
import { ErrorDisplay } from './components/ErrorDisplay';
import { AudioPlayer } from './components/AudioPlayer';
import { LoadingIndicator } from './components/LoadingIndicator';
import { ApiKeyInput } from './components/ApiKeyInput';
import { HistoryList } from './components/HistoryList';
import { HistoryItem } from './types';

const App: React.FC = () => {
  const [apiKey, setApiKey] = useState<string>(() => localStorage.getItem('gemini_api_key') || '');
  const [isKeySaved, setIsKeySaved] = useState<boolean>(() => !!localStorage.getItem('gemini_api_key'));
  const [text, setText] = useState<string>('Xin chào! Đây là bản trình diễn giọng nói được tạo bởi Anh Ngọc trên Gemini, hãy sáng tạo đi nhé, hẹ hẹ');
  const [selectedVoice, setSelectedVoice] = useState<string>(VOICE_OPTIONS[0].options[0].value);
  const [tone, setTone] = useState<string>('');
  const [customTone, setCustomTone] = useState<string>('');
  const [speakingRate, setSpeakingRate] = useState<number>(1);
  const [pitch, setPitch] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [audioData, setAudioData] = useState<string[] | null>(null);
  const [generationTime, setGenerationTime] = useState<number | null>(null);
  const [progress, setProgress] = useState<{ current: number, total: number } | null>(null);
  const [defaultFileName, setDefaultFileName] = useState<string>('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const downloadCounter = useRef(1);
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleSaveKey = () => {
    if (apiKey.trim()) {
      localStorage.setItem('gemini_api_key', apiKey.trim());
      setIsKeySaved(true);
      setError(null); // Clear previous errors when a new key is saved
    }
  };

  const handleClearKey = () => {
    localStorage.removeItem('gemini_api_key');
    setApiKey('');
    setIsKeySaved(false);
  };

  const handleFileContent = (content: string) => {
    setText(content);
    setError(null);
  };

  const handleFileError = (errorMessage: string) => {
    setError(errorMessage);
  };

  const handleStopGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsLoading(false);
      setError('Đã dừng tạo giọng nói.');
      setProgress(null);
    }
  }, []);

  const handleGenerateSpeech = useCallback(async () => {
    if (!isKeySaved || !apiKey.trim()) {
      setError('Vui lòng nhập và lưu API key của bạn để tiếp tục.');
      return;
    }
    if (!text.trim()) {
      setError('Vui lòng nhập văn bản để tạo giọng nói.');
      return;
    }
    
    // Setup AbortController
    if (abortControllerRef.current) {
        abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setIsLoading(true);
    setError(null);
    setAudioData(null);
    setGenerationTime(null);
    setProgress(null);

    const startTime = performance.now();
    const finalTone = tone === 'custom' ? customTone : tone;

    try {
      const handleProgress = (current: number, total: number) => {
        setProgress({ current, total });
      };

      const base64AudioChunks = await generateSpeech(
        apiKey, 
        text, 
        selectedVoice, 
        speakingRate, 
        pitch, 
        finalTone, 
        handleProgress,
        abortControllerRef.current.signal
      );
      
      const endTime = performance.now();
      
      const fileName = `ngoc.pro-${downloadCounter.current}`;
      setDefaultFileName(fileName);
      downloadCounter.current++;
      setGenerationTime(endTime - startTime);
      setAudioData(base64AudioChunks);

      // Add to history
      const voiceLabel = VOICE_OPTIONS.flatMap(c => c.options).find(v => v.value === selectedVoice)?.label.split(':')[0] || selectedVoice;
      
      const newHistoryItem: HistoryItem = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        textPreview: text.length > 60 ? text.substring(0, 60) + '...' : text,
        voiceName: voiceLabel,
        audioData: base64AudioChunks,
        fileName: fileName,
      };

      setHistory(prev => [newHistoryItem, ...prev]);

    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
         // Ignore abort errors as they are user initiated
         console.log('Generation aborted by user');
         return;
      }

      console.error('Error generating speech:', err);
      const errorMessage = err instanceof Error ? err.message : 'Đã xảy ra lỗi không xác định. Vui lòng thử lại.';
       if (errorMessage.includes('API key not valid')) {
          setError('API key không hợp lệ. Vui lòng kiểm tra lại hoặc tạo một key mới. Đừng quên kích hoạt "AI Platform" trong Google Cloud project của bạn.');
          setIsKeySaved(false); // Force user to re-enter key
      } else {
          setError(errorMessage);
      }
    } finally {
      // Only set loading to false if we haven't been aborted (or if aborted, we handled it)
      if (abortControllerRef.current?.signal.aborted) {
          // logic handled in handleStopGeneration usually, but ensuring cleanup
      } else {
          setIsLoading(false);
      }
      abortControllerRef.current = null;
    }
  }, [apiKey, isKeySaved, text, selectedVoice, speakingRate, pitch, tone, customTone]);

  const handleToneChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = event.target.value;
    setTone(selectedValue);

    const selectedOption = TONE_OPTIONS.find(option => option.value === selectedValue);
    
    setSpeakingRate(selectedOption?.defaultRate ?? 1);
  };

  const handleHistoryPlay = (item: HistoryItem) => {
      setAudioData(item.audioData);
      setDefaultFileName(item.fileName);
      setGenerationTime(null); // Clear time since we aren't regenerating
      window.scrollTo({ top: 400, behavior: 'smooth' }); // Scroll near player
  };
  

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-2xl flex-grow">
        <Header />
        <main className="mt-8 bg-gray-800/30 backdrop-blur-sm p-6 sm:p-8 rounded-2xl shadow-2xl border border-orange-900/50">
          <ApiKeyInput
            isKeySaved={isKeySaved}
            apiKey={apiKey}
            setApiKey={setApiKey}
            onSave={handleSaveKey}
            onClear={handleClearKey}
          />
          <div className={`space-y-6 transition-opacity duration-500 ${!isKeySaved ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
            <TextArea
              value={text}
              onChange={e => setText(e.target.value)}
              onFileContent={handleFileContent}
              onFileError={handleFileError}
            />
            <VoiceSelector
              selectedVoice={selectedVoice}
              onVoiceChange={e => setSelectedVoice(e.target.value)}
            />
            <ToneInput 
              value={tone} 
              onChange={handleToneChange}
              customValue={customTone}
              onCustomChange={e => setCustomTone(e.target.value)}
            />
            <ControlSlider
              label="Tốc độ"
              value={speakingRate}
              min={0.25}
              max={2.0}
              step={0.05}
              onChange={e => setSpeakingRate(parseFloat(e.target.value))}
              displayValue={speakingRate.toFixed(2)}
            />
            <ControlSlider
              label="Cao độ"
              value={pitch}
              min={-10.0}
              max={10.0}
              step={0.5}
              onChange={e => setPitch(parseFloat(e.target.value))}
              displayValue={pitch.toFixed(1)}
            />
          </div>
          <div className="mt-8">
            <GenerateButton 
              isLoading={isLoading} 
              onClick={handleGenerateSpeech}
              onStop={handleStopGeneration}
              disabled={!isKeySaved}
            />
          </div>
          {isLoading && <LoadingIndicator progress={progress} />}
          {error && <ErrorDisplay message={error} />}
          {audioData && !isLoading && <AudioPlayer base64AudioChunks={audioData} generationTime={generationTime} defaultFileName={defaultFileName} />}
        </main>
        
        {/* History Section */}
        {history.length > 0 && (
            <HistoryList history={history} onPlay={handleHistoryPlay} />
        )}
      </div>

      <footer className="w-full max-w-2xl mt-16 pt-8 border-t border-gray-800/50 text-center pb-8 animate-fade-in">
        <div className="flex flex-col items-center justify-center gap-3">
            <div className="text-2xl font-bold bg-gradient-to-r from-orange-600 via-amber-500 to-orange-400 text-transparent bg-clip-text drop-shadow-sm tracking-wide">
                NGOC.PRO
            </div>
            <p className="text-gray-500 text-sm font-medium tracking-wide">
                Hệ thống chuyển đổi văn bản thành giọng nói chất lượng cao
            </p>
            <div className="mt-2 text-xs text-gray-600 flex items-center gap-2">
                 <span>&copy; {new Date().getFullYear()} All rights reserved.</span>
                 <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
                 <span>Powered by Gemini AI</span>
            </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
