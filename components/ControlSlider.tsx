
import React from 'react';

interface ControlSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  displayValue: string;
}

export const ControlSlider: React.FC<ControlSliderProps> = ({ label, value, min, max, step, onChange, displayValue }) => (
  <div>
    <label className="flex justify-between items-center text-sm font-medium text-slate-300 mb-2">
      <span>{label}</span>
      <span className="text-orange-400 font-semibold bg-gray-700/50 px-2 py-0.5 rounded-md">{displayValue}</span>
    </label>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={onChange}
      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
    />
  </div>
);
