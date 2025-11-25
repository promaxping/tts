
import React from 'react';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { PlayIcon } from './icons/PlayIcon';
import { StopIcon } from './icons/StopIcon';


interface GenerateButtonProps {
  isLoading: boolean;
  onClick: () => void;
  onStop?: () => void;
  disabled?: boolean;
}

export const GenerateButton: React.FC<GenerateButtonProps> = ({ isLoading, onClick, onStop, disabled }) => {
    const buttonText = disabled && !isLoading ? 'Vui lòng nhập API Key' : 'Tạo giọng nói';

    if (isLoading && onStop) {
        return (
            <button
                onClick={onStop}
                className="w-full flex items-center justify-center gap-3 bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-red-500/50 shadow-lg shadow-red-600/20 hover:shadow-red-500/30 animate-pulse"
            >
                <StopIcon className="h-5 w-5" />
                <span>Dừng lại</span>
            </button>
        );
    }

    return (
        <button
            onClick={onClick}
            disabled={isLoading || disabled}
            className="w-full flex items-center justify-center gap-3 bg-orange-600 hover:bg-orange-500 disabled:bg-orange-800/50 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-orange-500/50 shadow-lg shadow-orange-600/20 hover:shadow-orange-500/30"
        >
            {isLoading ? (
            <>
                <SpinnerIcon className="animate-spin h-5 w-5 text-white" />
                <span>Đang tạo...</span>
            </>
            ) : (
            <>
                <PlayIcon className="h-5 w-5" />
                <span>{buttonText}</span>
            </>
            )}
        </button>
    );
};
