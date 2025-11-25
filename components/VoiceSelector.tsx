
import React from 'react';
import { VOICE_OPTIONS } from '../constants';

interface VoiceSelectorProps {
  selectedVoice: string;
  onVoiceChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
}

export const VoiceSelector: React.FC<VoiceSelectorProps> = ({ selectedVoice, onVoiceChange }) => (
  <div>
    <label htmlFor="voice-select" className="block text-sm font-medium text-slate-300 mb-2">
      Giọng đọc
    </label>
    <select
      id="voice-select"
      value={selectedVoice}
      onChange={onVoiceChange}
      className="w-full bg-gray-900/50 border border-gray-700 rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors duration-200"
    >
      {VOICE_OPTIONS.map(category => (
        <optgroup key={category.label} label={`--- ${category.label} ---`}>
          {category.options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  </div>
);
