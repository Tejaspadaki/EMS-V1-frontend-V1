import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { getEmployeeDocuments, uploadEmployeeDocument } from '../../api/hr.api';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { toast } from '../../utils/toast';
import { UploadCloud, FileText, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';

const DOCUMENT_TYPES = [
  { value: 'ID_PROOF', label: 'ID Proof (Aadhar/Passport)' },
  { value: 'ADDRESS_PROOF', label: 'Address Proof' },
  { value: 'PAN_CARD', label: 'PAN Card' },
  { value: 'RESUME', label: 'Resume / CV' },
  { value: 'OFFER_LETTER', label: 'Signed Offer Letter' },
  { value: 'BANK_DETAILS', label: 'Bank Account Details / Cancelled Cheque' },
];

export const SubmitDocumentsPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const effectiveUserId = userId || user?.id;
  
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  
  const [selectedType, setSelectedType] = useState(DOCUMENT_TYPES[0].value);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    if (effectiveUserId) {
      fetchDocuments();
    }
  }, [effectiveUserId]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const data = await getEmployeeDocuments(effectiveUserId!);
      setDocuments(data);
    } catch (error) {
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !effectiveUserId) return;

    try {
      setUploading(true);
      await uploadEmployeeDocument(effectiveUserId, selectedType, selectedFile);
      toast.success('Document uploaded successfully');
      setSelectedFile(null);
      // reset file input
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
      await fetchDocuments();
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const getDocTypeLabel = (val: string) => {
    const found = DOCUMENT_TYPES.find(d => d.value === val);
    return found ? found.label : val;
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="flex items-center gap-4 mb-6">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Submit Documents</h1>
          <p className="text-[var(--color-text-secondary)] text-sm">Upload and manage employee KYC documents</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Upload Section */}
        <div className="md:col-span-1">
          <div className="ems-card p-6 sticky top-6">
            <h2 className="text-lg font-semibold mb-4 text-[var(--color-text-primary)]">Upload New File</h2>
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">Document Type</label>
                <Select 
                  value={selectedType} 
                  onChange={(e) => setSelectedType(e.target.value)}
                  required
                >
                  {DOCUMENT_TYPES.map(d => (
                    <option key={d.value} value={d.value}>{d.label}</option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">Select File</label>
                <label 
                  htmlFor="file-upload" 
                  className={`
                    border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors
                    ${selectedFile ? 'border-[var(--color-primary)] bg-indigo-50/50' : 'border-slate-300 hover:border-[var(--color-primary)] hover:bg-slate-50'}
                  `}
                >
                  <UploadCloud size={32} className={selectedFile ? 'text-[var(--color-primary)]' : 'text-slate-400'} />
                  <span className="text-sm font-medium text-center text-[var(--color-text-primary)]">
                    {selectedFile ? selectedFile.name : 'Click to browse files'}
                  </span>
                  <span className="text-xs text-[var(--color-text-secondary)]">
                    Max size: 10MB
                  </span>
                </label>
                <input 
                  id="file-upload" 
                  type="file" 
                  className="hidden" 
                  onChange={handleFileChange}
                  accept=".pdf,.jpg,.jpeg,.png"
                />
              </div>

              <Button type="submit" variant="primary" fullWidth disabled={!selectedFile || uploading}>
                {uploading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="animate-spin" size={18} /> Uploading...
                  </span>
                ) : 'Upload Document'}
              </Button>
            </form>
          </div>
        </div>

        {/* Existing Documents List */}
        <div className="md:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)] px-1">Uploaded Documents</h2>
          
          {loading ? (
            <div className="ems-card p-12 flex justify-center items-center">
              <Loader2 className="animate-spin text-[var(--color-primary)]" size={32} />
            </div>
          ) : documents.length === 0 ? (
            <div className="ems-card p-12 flex flex-col items-center justify-center text-center">
              <FileText size={48} className="text-slate-300 mb-4" />
              <h3 className="text-lg font-medium text-slate-700">No documents yet</h3>
              <p className="text-slate-500 text-sm mt-1">Files uploaded for this employee will appear here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {documents.map(doc => (
                <div key={doc.id} className="ems-card p-4 hover:shadow-md transition-shadow group">
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                      <FileText size={24} />
                    </div>
                    <CheckCircle2 size={20} className="text-emerald-500" />
                  </div>
                  <h3 className="font-semibold text-slate-900 truncate" title={doc.fileName}>
                    {doc.fileName}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mb-3">
                    {getDocTypeLabel(doc.documentType)}
                  </p>
                  
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-auto">
                    <span className="text-xs text-slate-400">
                      {new Date(doc.uploadedAt).toLocaleDateString()}
                    </span>
                    <a 
                      href={doc.fileUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:underline"
                    >
                      View File
                    </a>
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
