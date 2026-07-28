import React, { useState, useRef } from 'react';
import { UploadCloud, X } from 'lucide-react';

export interface AttachmentData {
  url: string;
  type: 'image' | 'file';
  name: string;
  size: string;
}

interface FileUploaderProps {
  onUploadComplete: (data: AttachmentData) => void;
  onCancel: () => void;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onUploadComplete, onCancel }) => {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const processFile = async (file: File) => {
    setError(null);
    // Enforce 100MB limit
    if (file.size > 100 * 1024 * 1024) {
      setError('File exceeds the 100MB client-side limit.');
      return;
    }

    setIsUploading(true);
    setProgress(0);
    
    try {
      const formData = new FormData();
      formData.append('file', file);

      // We import api from our axios config directly or use a localized import
      const { default: api } = await import('../../api/axios');
      
      const endpoint = file.type.startsWith('image/') ? '/upload/image' : '/upload/document';

      const response = await api.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const currentProgress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setProgress(currentProgress);
          }
        }
      });

      if (response.data.success) {
        onUploadComplete(response.data.data);
      } else {
        throw new Error(response.data.error?.message || 'Upload failed');
      }
    } catch (err: any) {
      console.error('File upload error:', err);
      setError(err.response?.data?.error?.message || err.message || 'Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg border border-[var(--color-border)] shadow-lg max-w-sm w-full relative">
      <button onClick={onCancel} className="absolute top-2 right-2 text-gray-400 hover:text-gray-600">
        <X size={18} />
      </button>
      
      <h4 className="font-semibold text-sm mb-3 text-[var(--color-text-primary)]">Attach File</h4>

      {error && <div className="text-xs text-[#C62828] bg-[#FFEBEE] p-2 rounded mb-3 font-medium">{error}</div>}

      {!isUploading ? (
        <div 
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer
            ${dragActive ? 'border-[var(--color-primary)] bg-indigo-50' : 'border-gray-300 hover:border-gray-400 bg-gray-50'}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
        >
          <UploadCloud className="mx-auto text-gray-400 mb-2" size={24} />
          <p className="text-sm font-medium text-gray-700">Drag & drop or click to upload</p>
          <p className="text-xs text-gray-500 mt-1">Max 100MB limit enforced</p>
          <input 
            ref={inputRef}
            type="file" 
            className="hidden" 
            onChange={handleChange}
          />
        </div>
      ) : (
        <div className="py-4">
          <div className="flex justify-between text-xs mb-1 font-medium">
            <span className="text-[var(--color-primary)]">Uploading...</span>
            <span className="text-[var(--color-text-secondary)]">{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-[var(--color-primary)] h-2 rounded-full transition-all duration-150" 
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
