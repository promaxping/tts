
import React from 'react';

interface ApiKeyInputProps {
  isKeySaved: boolean;
  apiKey: string;
  setApiKey: (key: string) => void;
  onSave: () => void;
  onClear: () => void;
}

export const ApiKeyInput: React.FC<ApiKeyInputProps> = ({ isKeySaved, apiKey, setApiKey, onSave, onClear }) => {
  if (isKeySaved) {
    return (
      <div className="mb-6 p-3 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center justify-between">
        <p className="text-sm text-green-300">
          API Key đã được lưu.
        </p>
        <button
          onClick={onClear}
          className="text-sm text-slate-300 hover:text-white underline"
        >
          Thay đổi Key
        </button>
      </div>
    );
  }

  return (
    <div className="mb-6 p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg space-y-3">
      <h2 className="font-bold text-orange-300">Yêu cầu API Key</h2>
      <p className="text-sm text-slate-300">
        Vui lòng nhập Gemini API Key của bạn để sử dụng ứng dụng. Key của bạn sẽ được lưu an toàn trong trình duyệt.
        <a 
          href="https://aistudio.google.com/app/apikey" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-orange-400 hover:text-orange-300 underline ml-1"
        >
          Lấy API key tại đây.
        </a>
      </p>
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          className="flex-grow w-full bg-gray-900/50 border border-gray-700 rounded-lg p-2.5 text-slate-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors duration-200 placeholder-gray-500"
          placeholder="Dán API Key của bạn vào đây"
          aria-label="Gemini API Key"
        />
        <button
          onClick={onSave}
          className="bg-orange-600 hover:bg-orange-500 text-white font-bold py-2.5 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
        >
          Lưu Key
        </button>
      </div>
    </div>
  );
};
