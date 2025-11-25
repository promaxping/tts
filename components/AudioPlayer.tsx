import React, { useEffect, useState, useRef } from 'react';
import { SpeakerIcon } from './icons/SpeakerIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { ClockIcon } from './icons/ClockIcon';
import { WaveformIcon } from './icons/WaveformIcon';
import { PlayIcon } from './icons/PlayIcon';
import { PauseIcon } from './icons/PauseIcon';
import { ReplayIcon } from './icons/ReplayIcon';
import { ControlSlider } from './ControlSlider';
import { ErrorDisplay } from './ErrorDisplay';
import { decode, pcmToWavBlob, decodeAudioData, concatAudioBuffers, concatUint8Arrays } from '../utils/audioUtils';

interface AudioPlayerProps {
    base64AudioChunks: string[];
    generationTime: number | null;
    defaultFileName: string;
}

const AudioContext = window.AudioContext || (window as any).webkitAudioContext;

const formatDuration = (seconds: number | null): string => {
    if (seconds === null || isNaN(seconds)) {
      return '0:00';
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ base64AudioChunks, generationTime, defaultFileName }) => {
    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
    const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
    const [duration, setDuration] = useState<number | null>(null);
    const [playbackRate, setPlaybackRate] = useState<number>(1);
    const [error, setError] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string>(defaultFileName);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [isFinished, setIsFinished] = useState<boolean>(true);

    const audioContextRef = useRef<AudioContext | null>(null);
    const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

    useEffect(() => {
        setFileName(defaultFileName);
    }, [defaultFileName]);

    const startPlayback = (buffer: AudioBuffer) => {
        if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
            audioContextRef.current = new AudioContext({ sampleRate: 24000 });
        }
        
        if (audioSourceRef.current) {
            audioSourceRef.current.onended = null;
            try { audioSourceRef.current.stop(); } catch(e) {}
        }
        
        const source = audioContextRef.current.createBufferSource();
        source.buffer = buffer;
        source.playbackRate.value = playbackRate;
        source.connect(audioContextRef.current.destination);
        
        source.onended = () => {
            if (audioContextRef.current?.state === 'running') {
                setIsPlaying(false);
                setIsFinished(true);
            }
        };
        
        source.start();
        audioSourceRef.current = source;
        setIsPlaying(true);
        setIsFinished(false);
    };

    useEffect(() => {
        let isMounted = true;
        let objectUrl: string | null = null;
        
        const setupAndPlay = async () => {
            setError(null);
            setIsFinished(false);
            try {
                if (audioContextRef.current) {
                    await audioContextRef.current.close();
                }
                audioContextRef.current = new AudioContext({ sampleRate: 24000 });
                
                const pcmDataChunks = base64AudioChunks.map(b64 => decode(b64));
                
                const fullPcmData = concatUint8Arrays(pcmDataChunks);
                const wavBlob = pcmToWavBlob(fullPcmData, 24000, 1, 16);
                objectUrl = URL.createObjectURL(wavBlob);
                if (isMounted) setDownloadUrl(objectUrl);

                const audioBufferPromises = pcmDataChunks.map(pcmChunk => 
                    decodeAudioData(pcmChunk, audioContextRef.current!, 24000, 1)
                );
                const audioBufferChunks = await Promise.all(audioBufferPromises);

                const concatenatedBuffer = concatAudioBuffers(audioBufferChunks, audioContextRef.current!);

                if (isMounted) {
                    setAudioBuffer(concatenatedBuffer);
                    setDuration(concatenatedBuffer.duration);
                    startPlayback(concatenatedBuffer);
                }
            } catch (e) {
                console.error('Error processing audio:', e);
                if (isMounted) setError('Không thể xử lý và phát âm thanh.');
            }
        };

        if (base64AudioChunks && base64AudioChunks.length > 0) {
            setupAndPlay();
        }
        
        return () => {
            isMounted = false;
            if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
                 audioContextRef.current.close();
            }
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }
        };
    }, [base64AudioChunks]);
    
    useEffect(() => {
        if (audioSourceRef.current) {
            audioSourceRef.current.playbackRate.value = playbackRate;
        }
    }, [playbackRate]);

    const handleTogglePlayPause = () => {
        if (!audioContextRef.current || !audioBuffer) return;

        if (isFinished) {
            startPlayback(audioBuffer);
        } else if (isPlaying) {
            audioContextRef.current.suspend().then(() => setIsPlaying(false));
        } else {
            audioContextRef.current.resume().then(() => setIsPlaying(true));
        }
    };
    
    const renderPlayButton = () => {
        let icon: React.ReactNode;
        let text: string;

        if (isFinished) {
            icon = <ReplayIcon className="w-5 h-5" />;
            text = 'Phát lại';
        } else if (isPlaying) {
            icon = <PauseIcon className="w-5 h-5" />;
            text = 'Tạm dừng';
        } else {
            icon = <PlayIcon className="w-5 h-5" />;
            text = 'Phát tiếp';
        }

        return (
            <button
                onClick={handleTogglePlayPause}
                disabled={!audioBuffer}
                className="flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-500 text-slate-200 font-semibold py-2 px-4 rounded-lg transition-colors duration-200 flex-1 sm:flex-grow-0 disabled:bg-gray-700/50 disabled:text-slate-400 disabled:cursor-not-allowed"
            >
                {icon}
                <span>{text}</span>
            </button>
        );
    };

    return (
      <div className="mt-6 p-4 sm:p-6 bg-gray-700/50 rounded-lg space-y-4 animate-fade-in">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 bg-orange-500/20 p-3 rounded-full">
                      <SpeakerIcon className="w-6 h-6 text-orange-400" />
                  </div>
                  <div>
                      <p className="font-medium text-slate-200">Âm thanh đã sẵn sàng</p>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 text-sm text-slate-400 mt-1">
                          {generationTime !== null && (
                              <span className="flex items-center gap-1.5" title="Thời gian tạo giọng nói">
                                  <ClockIcon className="w-4 h-4" />
                                  <span>Tạo trong: <strong>{(generationTime / 1000).toFixed(2)}s</strong></span>
                              </span>
                          )}
                          {duration !== null && (
                              <span className="flex items-center gap-1.5" title="Độ dài file âm thanh">
                                  <WaveformIcon className="w-4 h-4" />
                                  <span>Độ dài: <strong>{formatDuration(duration)}</strong></span>
                              </span>
                          )}
                      </div>
                  </div>
              </div>
              <div className="flex w-full sm:w-auto items-center gap-2 flex-shrink-0">
                  {renderPlayButton()}
                  {downloadUrl && (
                      <a
                          href={downloadUrl}
                          download={`${fileName.trim() || defaultFileName}.wav`}
                          className="flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-500 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 flex-1 sm:flex-grow-0"
                          title="Tải về tệp .wav"
                      >
                          <DownloadIcon className="w-5 h-5" />
                          <span>Tải về</span>
                      </a>
                  )}
              </div>
          </div>
          
          {audioBuffer && (
            <div className="border-t border-gray-600/50 pt-4 space-y-4">
                <div>
                    <label htmlFor="filename-input" className="block text-sm font-medium text-slate-300 mb-2">
                        Tên tệp tải về
                    </label>
                    <div className="relative">
                        <input
                            id="filename-input"
                            type="text"
                            value={fileName}
                            onChange={(e) => setFileName(e.target.value)}
                            className="w-full bg-gray-900/50 border border-gray-700 rounded-lg p-2.5 pr-12 text-slate-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors duration-200"
                            placeholder={defaultFileName}
                        />
                        <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 pointer-events-none">
                            .wav
                        </span>
                    </div>
                </div>
                <div>
                  <ControlSlider
                      label="Tốc độ phát"
                      value={playbackRate}
                      min={0.5}
                      max={2.0}
                      step={0.1}
                      onChange={(e) => setPlaybackRate(parseFloat(e.target.value))}
                      displayValue={`${playbackRate.toFixed(1)}x`}
                  />
                </div>
            </div>
          )}

          {error && <ErrorDisplay message={error} />}
      </div>
    );
};