
import React from 'react';
import { SpeakerIcon } from './icons/SpeakerIcon';

export const Header: React.FC = () => (
  <header className="text-center">
    <div className="inline-flex items-center gap-3">
        <SpeakerIcon className="w-8 h-8 text-orange-400" />
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-r from-amber-400 to-orange-500 text-transparent bg-clip-text">
            NGOC.PRO Text-to-Speech free
        </h1>
    </div>
    <p className="mt-3 text-lg text-slate-400 max-w-md mx-auto">
        Chuyển đổi văn bản của bạn thành giọng nói tự nhiên với nhiều tùy chọn giọng đọc.
    </p>
  </header>
);
