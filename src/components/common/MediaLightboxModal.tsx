import React from 'react';
import { X, Download, FileText } from 'lucide-react';

interface MediaLightboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  attachment: {
    url: string;
    name: string;
    type?: string;
    size?: string;
  } | null;
}

export const MediaLightboxModal: React.FC<MediaLightboxModalProps> = ({ isOpen, onClose, attachment }) => {
  if (!isOpen || !attachment) return null;

  const isImage = attachment.url.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i) || attachment.type === 'image';
  const isPdf = attachment.url.match(/\.pdf$/i) || attachment.name.endsWith('.pdf');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in" onClick={onClose}>
      <div 
        className="relative max-w-4xl w-full max-h-[90vh] bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="min-w-0 flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl">
              <FileText size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white truncate max-w-md">{attachment.name}</h3>
              {attachment.size && <p className="text-[11px] text-slate-400">{attachment.size}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={attachment.url}
              download={attachment.name}
              target="_blank"
              rel="noreferrer"
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-colors flex items-center gap-1.5 text-xs font-semibold"
            >
              <Download size={15} />
              Download
            </a>
            <button
              onClick={onClose}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content Viewer */}
        <div className="flex-1 overflow-auto p-6 flex items-center justify-center bg-slate-950 min-h-[300px]">
          {isImage ? (
            <img 
              src={attachment.url} 
              alt={attachment.name} 
              className="max-w-full max-h-[75vh] object-contain rounded-2xl shadow-xl"
            />
          ) : isPdf ? (
            <iframe 
              src={attachment.url} 
              title={attachment.name} 
              className="w-full h-[70vh] rounded-xl border border-slate-800"
            />
          ) : (
            <div className="text-center p-8 text-slate-400 space-y-4">
              <FileText size={48} className="mx-auto text-slate-500" />
              <p className="text-sm font-medium">Preview not available for this file type.</p>
              <a
                href={attachment.url}
                download={attachment.name}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-all"
              >
                <Download size={16} />
                Download File
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
