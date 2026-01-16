import React, { useRef } from 'react';

interface ImageUploadProps {
  images: string[];
  onAdd: (image: string) => void;
  onRemove: (index: number) => void;
  maxImages?: number;
  className?: string;
  label?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  images,
  onAdd,
  onRemove,
  maxImages = 10,
  className = '',
  label = '이미지 추가',
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('파일 크기는 5MB 이하여야 합니다.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        onAdd(reader.result);
      }
    };
    reader.readAsDataURL(file);

    // Reset input
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div className={className}>
      <div className="flex flex-wrap gap-3">
        {images.map((image, index) => (
          <div 
            key={index} 
            className="relative group w-24 h-24 border border-gray-200 rounded-lg overflow-hidden"
          >
            <img 
              src={image} 
              alt={`업로드 이미지 ${index + 1}`}
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full 
                         flex items-center justify-center opacity-0 group-hover:opacity-100 
                         transition-opacity text-sm font-bold"
              title="삭제"
            >
              ×
            </button>
          </div>
        ))}
        
        {images.length < maxImages && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg 
                       flex flex-col items-center justify-center text-gray-400 
                       hover:border-blue-400 hover:text-blue-400 transition-colors"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="text-xs mt-1">{label}</span>
          </button>
        )}
      </div>
      
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};

interface SingleImageUploadProps {
  image?: string;
  onAdd: (image: string) => void;
  onRemove: () => void;
  className?: string;
  label?: string;
}

export const SingleImageUpload: React.FC<SingleImageUploadProps> = ({
  image,
  onAdd,
  onRemove,
  className = '',
  label = '이미지 추가',
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('파일 크기는 5MB 이하여야 합니다.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        onAdd(reader.result);
      }
    };
    reader.readAsDataURL(file);

    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div className={className}>
      {image ? (
        <div className="relative group w-32 h-32 border border-gray-200 rounded-lg overflow-hidden">
          <img 
            src={image} 
            alt="업로드 이미지"
            className="w-full h-full object-cover"
          />
          <button
            type="button"
            onClick={onRemove}
            className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full 
                       flex items-center justify-center opacity-0 group-hover:opacity-100 
                       transition-opacity text-sm font-bold"
            title="삭제"
          >
            ×
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg 
                     flex flex-col items-center justify-center text-gray-400 
                     hover:border-blue-400 hover:text-blue-400 transition-colors"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="text-xs mt-1">{label}</span>
        </button>
      )}
      
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};
