
import React from 'react';

interface LoadingIndicatorProps {
  progress: { current: number; total: number } | null;
}

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ progress }) => {
  const percent = progress && progress.total > 0 ? (progress.current / progress.total) * 100 : 0;
  const progressText = progress && progress.total > 1 
    ? `Đang xử lý đoạn ${progress.current} / ${progress.total}...` 
    : 'Đang tạo giọng nói...';

  return (
    <div className="mt-6 p-4 sm:p-6 bg-gray-700/50 rounded-lg space-y-3 animate-fade-in">
      <p className="text-center text-slate-300">{progressText}</p>
      <div className="w-full bg-gray-600/50 rounded-full h-2.5 overflow-hidden">
        <div 
          className="bg-orange-500 h-2.5 rounded-full transition-all duration-300 ease-in-out"
          style={{ width: `${percent}%` }}
        ></div>
      </div>
    </div>
  );
};
