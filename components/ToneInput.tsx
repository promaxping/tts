
import React from 'react';
import { TONE_OPTIONS } from '../constants';

interface ToneInputProps {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  customValue: string;
  onCustomChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const ToneInput: React.FC<ToneInputProps> = ({ value, onChange, customValue, onCustomChange }) => (
  <div>
    <label htmlFor="tone-select" className="block text-sm font-medium text-slate-300 mb-2">
      Tông giọng
    </label>
    <select
      id="tone-select"
      value={value}
      onChange={onChange}
      className="w-full bg-gray-900/50 border border-gray-700 rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors duration-200"
    >
      {TONE_OPTIONS.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
    {value === 'custom' && (
      <div className="mt-4 animate-fade-in">
        <input
          type="text"
          value={customValue}
          onChange={onCustomChange}
          className="w-full bg-gray-900/50 border border-gray-700 rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors duration-200 placeholder-gray-500"
          placeholder="Ví dụ: giọng trầm, bí ẩn..."
          aria-label="Tông giọng tùy chỉnh"
        />
        <style>{`
            @keyframes fade-in {
                from { opacity: 0; transform: translateY(-10px); }
                to { opacity: 1; transform: translateY(0); }
            }
            .animate-fade-in {
                animation: fade-in 0.3s ease-out forwards;
            }
        `}</style>
      </div>
    )}
  </div>
);
