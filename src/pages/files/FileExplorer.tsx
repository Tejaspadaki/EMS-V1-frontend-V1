import React, { useState, useEffect, useRef } from 'react';
import { FileMetadata, fetchFileBlobUrl } from '../../api/files.api';
import { 
  Image as ImageIcon, 
  FileText, 
  Video, 
  Download, 
  Eye, 
  HardDrive, 
  Calendar, 
  X, 
  ExternalLink, 
  Play, 
  Sparkles,
  FileCode,
  FileSpreadsheet,
  File
} from 'lucide-react';

type FileType = 'image' | 'document' | 'recording';

export const FileExplorer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<FileType>('image');
  const [files, setFiles] = useState<FileMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  
  // Selected file for preview modal
  const [selectedFile, setSelectedFile] = useState<FileMetadata | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchFiles();
    setSelectedFile(null); // Reset preview on tab change
  }, [activeTab]);

  useEffect(() => {
    let activeBlobUrl = '';
    let isMounted = true;

    if (selectedFile) {
      setLoadingPreview(true);
      setPreviewUrl(null);

      fetchFileBlobUrl(activeTab, selectedFile.id)
        .then((url) => {
          if (isMounted) {
            activeBlobUrl = url;
            setPreviewUrl(url);
          } else {
            URL.revokeObjectURL(url);
          }
        })
        .catch((err) => {
          console.error('Blob fetch failed, falling back to direct URL:', err);
          if (isMounted) {
            setPreviewUrl(getFileUrl(selectedFile.id));
          }
        })
        .finally(() => {
          if (isMounted) setLoadingPreview(false);
        });
    } else {
      setPreviewUrl(null);
      setLoadingPreview(false);
    }

    return () => {
      isMounted = false;
      if (activeBlobUrl && activeBlobUrl.startsWith('blob:')) {
        URL.revokeObjectURL(activeBlobUrl);
      }
    };
  }, [selectedFile, activeTab]);

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
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getFileUrl = (id: string, fileTab: FileType = activeTab) => {
    const rawUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_DEV_API_URL || 'http://localhost:5000';
    let cleanBaseUrl = rawUrl.replace(/\/$/, '');
    if (cleanBaseUrl.endsWith('/api')) {
      cleanBaseUrl = cleanBaseUrl.slice(0, -4);
    }
    return `${cleanBaseUrl}/upload/${fileTab}/${id}`;
  };

  const getFileExtension = (filename: string) => {
    const parts = filename.split('.');
    return parts.length > 1 ? parts.pop()?.toUpperCase() || '' : '';
  };

  const getDocIcon = (filename: string) => {
    const ext = getFileExtension(filename).toLowerCase();
    if (['pdf'].includes(ext)) return <FileText className="text-red-500" size={32} />;
    if (['doc', 'docx'].includes(ext)) return <FileText className="text-blue-500" size={32} />;
    if (['xls', 'xlsx', 'csv'].includes(ext)) return <FileSpreadsheet className="text-emerald-500" size={32} />;
    if (['js', 'ts', 'jsx', 'tsx', 'html', 'json', 'py', 'java', 'c'].includes(ext)) return <FileCode className="text-purple-500" size={32} />;
    return <File className="text-slate-500" size={32} />;
  };

  const ImageThumbnailCard: React.FC<{ fileId: string; filename: string }> = ({ fileId, filename }) => {
    const [thumbUrl, setThumbUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      let active = true;
      let createdUrl = '';

      fetchFileBlobUrl('image', fileId)
        .then((url) => {
          if (active) {
            createdUrl = url;
            setThumbUrl(url);
          } else {
            URL.revokeObjectURL(url);
          }
        })
        .catch(() => {
          if (active) setThumbUrl(null);
        })
        .finally(() => {
          if (active) setLoading(false);
        });

      return () => {
        active = false;
        if (createdUrl && createdUrl.startsWith('blob:')) {
          URL.revokeObjectURL(createdUrl);
        }
      };
    }, [fileId]);

    if (loading) {
      return (
        <div className="w-full h-full bg-slate-100 flex items-center justify-center">
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-indigo-600 border-t-transparent"></div>
        </div>
      );
    }

    if (!thumbUrl) {
      return (
        <div className="flex flex-col items-center justify-center p-4 text-center text-slate-400 bg-slate-100 w-full h-full">
          <ImageIcon className="text-indigo-400 mb-1" size={28} />
          <span className="text-xs font-semibold text-slate-500 truncate max-w-[140px]">{filename}</span>
        </div>
      );
    }

    return (
      <img 
        src={thumbUrl} 
        alt={filename} 
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
      />
    );
  };

  const renderCardThumbnail = (file: FileMetadata) => {
    if (activeTab === 'image') {
      return (
        <div className="relative w-full h-full bg-slate-100 flex items-center justify-center overflow-hidden">
          <ImageThumbnailCard fileId={file.id} filename={file.filename} />
        </div>
      );
    }

    if (activeTab === 'document') {
      const ext = getFileExtension(file.filename);
      return (
        <div className="w-full h-full bg-slate-50 flex flex-col items-center justify-center p-4 group-hover:bg-indigo-50/40 transition-colors">
          <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-200/80 mb-2 group-hover:scale-110 transition-transform">
            {getDocIcon(file.filename)}
          </div>
          {ext && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200/80 text-slate-700 uppercase tracking-wider">
              {ext}
            </span>
          )}
        </div>
      );
    }

    if (activeTab === 'recording') {
      return (
        <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center relative group-hover:bg-slate-800 transition-colors">
          <div className="w-12 h-12 rounded-full bg-indigo-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <Play size={22} className="ml-1" />
          </div>
          <span className="mt-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white backdrop-blur-sm uppercase tracking-wider">
            Media
          </span>
        </div>
      );
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            File Explorer
          </h1>
          <p className="text-slate-500 font-medium mt-1">Manage and preview all internal files, documents, and media assets</p>
        </div>
        <div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            accept={activeTab === 'image' ? 'image/*' : activeTab === 'document' ? '.pdf,.doc,.docx,.txt,.csv,.json' : 'video/*,audio/*'}
          />
          <button 
            onClick={handleUploadClick}
            disabled={uploading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-semibold shadow-sm transition-all flex items-center gap-2 disabled:opacity-50 active:scale-95"
          >
            {uploading ? (
              <span className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Uploading...
              </span>
            ) : (
              <>
                <Sparkles size={18} />
                Upload File
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50/50 p-1.5 gap-1.5">
          <button
            onClick={() => setActiveTab('image')}
            className={`flex-1 py-3 px-4 text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-all ${
              activeTab === 'image' ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/60' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
            }`}
          >
            <ImageIcon size={18} /> Images
          </button>
          <button
            onClick={() => setActiveTab('document')}
            className={`flex-1 py-3 px-4 text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-all ${
              activeTab === 'document' ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/60' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
            }`}
          >
            <FileText size={18} /> Documents
          </button>
          <button
            onClick={() => setActiveTab('recording')}
            className={`flex-1 py-3 px-4 text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-all ${
              activeTab === 'recording' ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/60' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
            }`}
          >
            <Video size={18} /> Recordings
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 min-h-[520px] bg-slate-50/40">
          {loading ? (
            <div className="flex flex-col justify-center items-center h-72 text-slate-400 gap-3">
              <div className="animate-spin rounded-full h-9 w-9 border-3 border-indigo-600 border-t-transparent"></div>
              <span className="text-xs font-semibold text-slate-500">Fetching {activeTab}s...</span>
            </div>
          ) : files.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-72 text-slate-400 space-y-3">
              <div className="p-4 bg-slate-100 rounded-2xl">
                <HardDrive size={40} className="text-slate-400" />
              </div>
              <p className="font-semibold text-slate-600">No {activeTab}s found.</p>
              <p className="text-xs text-slate-400">Click Upload File to add your first asset to storage.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {files.map((file) => {
                const fileUrl = getFileUrl(file.id);

                return (
                  <div 
                    key={file.id} 
                    onClick={() => setSelectedFile(file)}
                    className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 group cursor-pointer flex flex-col"
                  >
                    {/* Card Media Header */}
                    <div className="h-44 bg-slate-100 relative border-b border-slate-100 overflow-hidden flex items-center justify-center">
                      {renderCardThumbnail(file)}
                      
                      {/* Hover Actions Overlay */}
                      <div className="absolute inset-0 bg-slate-950/50 opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center gap-2.5 backdrop-blur-xs">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedFile(file);
                          }}
                          className="p-2.5 bg-white text-slate-800 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-md transform hover:scale-105 active:scale-95"
                          title="Preview File"
                        >
                          <Eye size={18} />
                        </button>
                        <a 
                          href={previewUrl || fileUrl} 
                          download={file.filename}
                          onClick={(e) => e.stopPropagation()}
                          className="p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-md transform hover:scale-105 active:scale-95"
                          title="Download File"
                        >
                          <Download size={18} />
                        </a>
                      </div>
                    </div>

                    {/* Card Meta Description */}
                    <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                      <p className="font-semibold text-slate-900 truncate text-sm leading-snug" title={file.filename}>
                        {file.filename}
                      </p>
                      
                      <div className="flex items-center justify-between text-xs font-medium text-slate-500 pt-1 border-t border-slate-100">
                        <span className="flex items-center gap-1 text-slate-500">
                          <HardDrive size={13} className="text-slate-400"/> 
                          {formatSize(file.size)}
                        </span>
                        <span className="flex items-center gap-1 text-slate-500">
                          <Calendar size={13} className="text-slate-400"/> 
                          {formatDate(file.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* FULL-SCREEN INTERACTIVE PREVIEW MODAL                                   */}
      {/* ========================================================================= */}
      {selectedFile && (
        <div 
          onClick={() => setSelectedFile(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-slate-950/75 backdrop-blur-md animate-fade-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-scale-up"
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0 pr-4">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl shrink-0">
                  {activeTab === 'image' ? <ImageIcon size={20} /> : activeTab === 'document' ? <FileText size={20} /> : <Video size={20} />}
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-slate-900 truncate text-base" title={selectedFile.filename}>
                    {selectedFile.filename}
                  </h3>
                  <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                    <span>Size: {formatSize(selectedFile.size)}</span>
                    <span>•</span>
                    <span>Uploaded: {formatDate(selectedFile.created_at)}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={previewUrl || getFileUrl(selectedFile.id)}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-xl transition-colors"
                  title="Open in new tab"
                >
                  <ExternalLink size={18} />
                </a>
                <a
                  href={previewUrl || getFileUrl(selectedFile.id)}
                  download={selectedFile.filename}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-sm"
                  title="Download File"
                >
                  <Download size={14} /> Download
                </a>
                <button
                  onClick={() => setSelectedFile(null)}
                  className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors ml-1"
                  aria-label="Close modal"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Modal Body Preview Area */}
            <div className="p-6 overflow-y-auto flex-1 flex items-center justify-center bg-slate-900/5 min-h-[380px]">
              {loadingPreview ? (
                <div className="flex flex-col items-center justify-center gap-3 py-12 text-slate-500">
                  <div className="animate-spin rounded-full h-10 w-10 border-3 border-indigo-600 border-t-transparent"></div>
                  <span className="text-sm font-semibold">Downloading preview stream...</span>
                </div>
              ) : (
                <>
                  {/* IMAGE PREVIEW */}
                  {activeTab === 'image' && (
                    <div className="relative max-h-[68vh] flex items-center justify-center overflow-hidden rounded-xl bg-slate-950/90 p-2 shadow-inner border border-slate-800">
                      <img
                        src={previewUrl || getFileUrl(selectedFile.id)}
                        alt={selectedFile.filename}
                        className="max-h-[64vh] max-w-full object-contain rounded-lg shadow-md"
                      />
                    </div>
                  )}

                  {/* DOCUMENT PREVIEW */}
                  {activeTab === 'document' && (
                    <div className="w-full h-full min-h-[500px] flex flex-col items-center justify-center">
                      {selectedFile.filename.toLowerCase().endsWith('.pdf') || selectedFile.mimetype === 'application/pdf' ? (
                        <iframe
                          src={previewUrl || getFileUrl(selectedFile.id)}
                          className="w-full h-[62vh] rounded-xl border border-slate-200 shadow-xs"
                          title={selectedFile.filename}
                        />
                      ) : (
                        <div className="p-8 bg-white rounded-2xl border border-slate-200 shadow-sm max-w-md text-center space-y-4">
                          <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                            {getDocIcon(selectedFile.filename)}
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900 text-lg">{selectedFile.filename}</h4>
                            <p className="text-xs text-slate-500 mt-1">
                              Document file ({getFileExtension(selectedFile.filename)}) • {formatSize(selectedFile.size)}
                            </p>
                          </div>
                          <div className="pt-2 flex justify-center gap-3">
                            <a
                              href={previewUrl || getFileUrl(selectedFile.id)}
                              target="_blank"
                              rel="noreferrer"
                              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs transition-colors flex items-center gap-2"
                            >
                              <ExternalLink size={15} /> Open Document
                            </a>
                            <a
                              href={previewUrl || getFileUrl(selectedFile.id)}
                              download={selectedFile.filename}
                              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-xs transition-colors flex items-center gap-2"
                            >
                              <Download size={15} /> Download
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* RECORDING / MEDIA PREVIEW */}
                  {activeTab === 'recording' && (
                    <div className="w-full max-h-[68vh] flex items-center justify-center">
                      {selectedFile.mimetype?.startsWith('audio/') || selectedFile.filename.match(/\.(mp3|wav|ogg|m4a)$/i) ? (
                        <div className="p-8 bg-slate-900 text-white rounded-2xl shadow-xl max-w-lg w-full text-center space-y-6">
                          <div className="w-20 h-20 rounded-2xl bg-indigo-600/30 text-indigo-400 flex items-center justify-center mx-auto border border-indigo-500/30">
                            <Video size={36} />
                          </div>
                          <div>
                            <h4 className="font-bold text-lg text-white">{selectedFile.filename}</h4>
                            <p className="text-xs text-slate-400 mt-1">Audio Recording • {formatSize(selectedFile.size)}</p>
                          </div>
                          <audio controls autoPlay src={previewUrl || getFileUrl(selectedFile.id)} className="w-full rounded-xl" />
                        </div>
                      ) : (
                        <div className="w-full max-h-[64vh] rounded-xl overflow-hidden bg-black shadow-2xl flex items-center justify-center">
                          <video
                            controls
                            autoPlay
                            src={previewUrl || getFileUrl(selectedFile.id)}
                            className="max-h-[64vh] w-full rounded-xl object-contain"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
