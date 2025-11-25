import React from 'react';
import { FileUpload } from './FileUpload';

interface TextAreaProps {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onFileContent: (content: string) => void;
  onFileError: (errorMessage: string) => void;
}

export const TextArea: React.FC<TextAreaProps> = ({ value, onChange, onFileContent, onFileError }) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <label htmlFor="text-input" className="block text-sm font-medium text-slate-300">
          Văn bản
        </label>
        <FileUpload onFileContent={onFileContent} onError={onFileError} />
      </div>
      <textarea
        id="text-input"
        value={value}
        onChange={onChange}
        rows={6}
        className="w-full bg-gray-900/50 border rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors duration-200 resize-y placeholder-gray-500 border-gray-700"
        placeholder="Nhập hoặc dán văn bản vào đây..."
        aria-describedby="char-count"
      />
      <div id="char-count" className="text-right text-sm text-gray-400 mt-1.5">
        <span>{value.length.toLocaleString('vi-VN')}</span> ký tự
      </div>
    </div>
  );
};