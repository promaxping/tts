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
      setError(null);
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
