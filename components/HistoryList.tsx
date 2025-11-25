
import React, { useState } from 'react';
import { HistoryItem } from '../types';
import { HistoryIcon } from './icons/HistoryIcon';
import { PlayIcon } from './icons/PlayIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { decode, concatUint8Arrays, pcmToWavBlob } from '../utils/audioUtils';

interface HistoryListProps {
  history: HistoryItem[];
  onPlay: (item: HistoryItem) => void;
}

export const HistoryList: React.FC<HistoryListProps> = ({ history, onPlay }) => {
  if (history.length === 0) {
    return null;
  }

  const handleDownload = (item: HistoryItem) => {
    try {
      // Decode base64 chunks to raw PCM
      const pcmDataChunks = item.audioData.map(b64 => decode(b64));
      // Concatenate chunks
      const fullPcmData = concatUint8Arrays(pcmDataChunks);
      // Convert to WAV Blob (assuming 24000Hz, 1 channel, 16 bit from Gemini)
      const wavBlob = pcmToWavBlob(fullPcmData, 24000, 1, 16);
      
      // Create download link
      const url = URL.createObjectURL(wavBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${item.fileName}.wav`;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading file from history:", error);
      alert("Có lỗi xảy ra khi chuẩn bị file tải về.");
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  return (
    <div className="mt-8 bg-gray-800/30 backdrop-blur-sm p-6 rounded-2xl border border-gray-700/50 animate-fade-in">
      <div className="flex items-center gap-3 mb-4">
        <HistoryIcon className="w-6 h-6 text-orange-400" />
        <h2 className="text-xl font-bold text-slate-200">Lịch sử tạo</h2>
      </div>
      
      <div className="space-y-3">
        {history.map((item) => (
          <div 
            key={item.id} 
            className="flex flex-col sm:flex-row sm:items-center justify-between bg-gray-900/40 p-4 rounded-lg border border-gray-700/30 hover:border-orange-500/30 transition-colors duration-200"
          >
            <div className="mb-3 sm:mb-0 overflow-hidden">
                <div className="flex items-center gap-2 text-xs text-orange-400 mb-1">
                    <span className="bg-gray-800 px-1.5 py-0.5 rounded">{formatTime(item.timestamp)}</span>
                    <span className="bg-gray-800 px-1.5 py-0.5 rounded">{item.voiceName}</span>
                </div>
                <p className="text-slate-300 text-sm font-medium truncate max-w-md" title={item.textPreview}>
                    {item.textPreview}
                </p>
                <p className="text-xs text-gray-500 mt-1">{item.fileName}.wav</p>
            </div>

            <div className="flex items-center gap-2 sm:ml-4">
              <button
                onClick={() => onPlay(item)}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-gray-700 hover:bg-gray-600 text-slate-200 text-sm font-medium py-2 px-3 rounded-lg transition-colors"
                title="Tải vào trình phát chính"
              >
                <PlayIcon className="w-4 h-4" />
                <span>Phát</span>
              </button>
              <button
                onClick={() => handleDownload(item)}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-orange-600/10 hover:bg-orange-600/20 border border-orange-600/20 hover:border-orange-600/40 text-orange-400 hover:text-orange-300 text-sm font-medium py-2 px-3 rounded-lg transition-all"
                title="Tải xuống ngay"
              >
                <DownloadIcon className="w-4 h-4" />
                <span>Tải về</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
