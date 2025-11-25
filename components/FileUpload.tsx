import React from 'react';

interface FileUploadProps {
  onFileContent: (content: string) => void;
  onError: (errorMessage: string) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileContent, onError }) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const allowedExtensions = ['.txt', '.md', '.rtf'];
    const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;
    
    if (!allowedExtensions.includes(fileExtension)) {
        onError(`Định dạng tệp không được hỗ trợ. Vui lòng chọn tệp .txt, .md, hoặc .rtf.`);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        return;
    }
    
    const maxSizeInBytes = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSizeInBytes) {
        onError(`Tệp quá lớn. Vui lòng chọn tệp nhỏ hơn 5MB.`);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      onFileContent(content);
      onError(''); 
    };
    reader.onerror = () => {
        onError('Đã xảy ra lỗi khi đọc tệp.');
    };
    reader.readAsText(file, 'UTF-8');

    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept=".txt,.md,.rtf,text/plain,text/markdown"
      />
      <button
        type="button"
        onClick={handleClick}
        className="text-sm font-medium text-orange-400 hover:text-orange-300 underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-orange-500 rounded"
        title="Tải lên tệp văn bản"
      >
        Tải lên
      </button>
    </>
  );
};