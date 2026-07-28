import React, { useState, useEffect } from 'react';
import { getFilesList, FileMetadata } from '../../api/files.api';
import { Image, FileText, Video, Download, Eye, HardDrive, Calendar } from 'lucide-react';

type FileType = 'image' | 'document' | 'recording';

export const FileExplorer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<FileType>('image');
  const [files, setFiles] = useState<FileMetadata[]>([]);
  const [loading, setLoading] = useState(true);

  const [uploading, setUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchFiles();
  }, [activeTab]);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const { getFilesList } = await import('../../api/files.api');
      const data = await getFilesList(activeTab);
      setFiles(data);
    } catch (error) {
      console.error('Error fetching files:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setUploading(true);
      try {
        const { uploadFile } = await import('../../api/files.api');
        await uploadFile(activeTab, file);
        fetchFiles(); // Refresh list after upload
      } catch (error) {
        console.error('Error uploading file:', error);
      } finally {
        setUploading(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getFileUrl = (id: string) => {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    return `${baseUrl.replace(/\/$/, '')}/upload/${activeTab}/${id}`;
  };

  const getIcon = () => {
    if (activeTab === 'image') return <Image className="text-emerald-500" size={32} />;
    if (activeTab === 'document') return <FileText className="text-blue-500" size={32} />;
    if (activeTab === 'recording') return <Video className="text-purple-500" size={32} />;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">File Explorer</h1>
          <p className="text-slate-500 font-medium mt-1">Manage all internal files and assets</p>
        </div>
        <div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            accept={activeTab === 'image' ? 'image/*' : activeTab === 'document' ? '.pdf,.doc,.docx,.txt' : 'video/*,audio/*'}
          />
          <button 
            onClick={handleUploadClick}
            disabled={uploading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {uploading ? (
              <span className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Uploading...
              </span>
            ) : (
              'Upload File'
            )}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab('image')}
            className={`flex-1 py-4 text-sm font-semibold flex items-center justify-center gap-2 ${
              activeTab === 'image' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <Image size={18} /> Images
          </button>
          <button
            onClick={() => setActiveTab('document')}
            className={`flex-1 py-4 text-sm font-semibold flex items-center justify-center gap-2 ${
              activeTab === 'document' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <FileText size={18} /> Documents
          </button>
          <button
            onClick={() => setActiveTab('recording')}
            className={`flex-1 py-4 text-sm font-semibold flex items-center justify-center gap-2 ${
              activeTab === 'recording' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <Video size={18} /> Recordings
          </button>
        </div>

        {/* Content */}
        <div className="p-6 min-h-[500px] bg-slate-50/50">
          {loading ? (
            <div className="flex justify-center items-center h-64 text-slate-400">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : files.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400 space-y-4">
              <HardDrive size={48} className="text-slate-300" />
              <p className="font-medium text-slate-500">No {activeTab}s found in the database.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {files.map((file) => (
                <div key={file.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all group">
                  <div className="h-40 bg-slate-100 flex flex-col items-center justify-center border-b border-slate-100 relative">
                    {activeTab === 'image' ? (
                      <img src={getFileUrl(file.id)} alt={file.filename} className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <div className="transform group-hover:scale-110 transition-transform duration-300">
                        {getIcon()}
                      </div>
                    )}
                    
                    {/* Overlay actions */}
                    <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-sm">
                      <a 
                        href={getFileUrl(file.id)} 
                        target="_blank" 
                        rel="noreferrer"
                        className="p-2 bg-white rounded-lg text-slate-700 hover:text-indigo-600 hover:scale-105 transition-all shadow-sm"
                        title="View"
                      >
                        <Eye size={20} />
                      </a>
                      <a 
                        href={getFileUrl(file.id)} 
                        download={file.filename}
                        className="p-2 bg-indigo-600 rounded-lg text-white hover:bg-indigo-700 hover:scale-105 transition-all shadow-sm"
                        title="Download"
                      >
                        <Download size={20} />
                      </a>
                    </div>
                  </div>

                  <div className="p-4">
                    <p className="font-semibold text-slate-800 truncate text-sm mb-2" title={file.filename}>{file.filename}</p>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="flex items-center gap-1.5"><HardDrive size={14} className="text-slate-400"/> {formatSize(file.size)}</span>
                      <span className="flex items-center gap-1.5"><Calendar size={14} className="text-slate-400"/> {formatDate(file.created_at).split(' ')[0]}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
