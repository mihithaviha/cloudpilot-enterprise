import React, { useEffect, useState, useRef } from 'react';
import { api } from '../utils/api';
import { useNotifications } from '../context/NotificationContext';
import { 
  UploadCloud, 
  Search, 
  Trash2, 
  FileText, 
  FileSpreadsheet, 
  Eye, 
  Filter, 
  X,
  Sparkles
} from 'lucide-react';

export const KnowledgeBase: React.FC = () => {
  const { addToast } = useNotifications();

  const [documents, setDocuments] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [dragActive, setDragActive] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<any>(null);
  const [uploading, setUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadDocuments = async () => {
    try {
      const res = await api.documents.list();
      setDocuments(res);
    } catch (error) {
      console.error('Failed to load documents:', error);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      uploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      uploadFile(e.target.files[0]);
    }
  };

  const uploadFile = async (file: File) => {
    // Validate extensions
    const allowed = ['txt', 'csv', 'pdf', 'docx', 'xlsx', 'xls'];
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!ext || !allowed.includes(ext)) {
      addToast('Invalid File Type', 'We support PDF, TXT, CSV, DOCX, and Excel files.', 'warning');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    addToast('Uploading...', `Uploading & indexing "${file.name}"...`, 'info');

    try {
      const newDoc = await api.documents.upload(formData);
      setDocuments(prev => [newDoc, ...prev]);
      addToast('Document Indexed', `"${file.name}" successfully parsed for RAG chat search context.`, 'success');
    } catch (err: any) {
      addToast('Upload Failed', err.message || 'Error occurred.', 'danger');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.documents.delete(id);
      setDocuments(prev => prev.filter(d => d.id !== id));
      addToast('Document Purged', 'File removed from index cache.', 'success');
      if (previewDoc?.id === id) {
        setPreviewDoc(null);
      }
    } catch (err: any) {
      addToast('Action Failed', err.message, 'danger');
    }
  };

  const filteredDocs = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'ALL' || doc.file_type === filterType;
    return matchesSearch && matchesFilter;
  });

  const categories = ['ALL', 'TXT', 'CSV', 'PDF', 'DOCX', 'HTML'];

  return (
    <div className="p-8 space-y-8 animate-slide-up max-w-7xl mx-auto">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100">
            Company Knowledge Base
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Index files into the AI RAG database to chat with documents in real time.
          </p>
        </div>
      </div>

      {/* Drag & Drop File Upload Box */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-3xl p-10 text-center flex flex-col items-center justify-center cursor-pointer transition-all ${
          dragActive 
            ? 'border-brand-500 bg-brand-500/5 dark:bg-brand-950/20' 
            : 'border-slate-300 dark:border-slate-800 hover:border-brand-500/50 bg-white/40 dark:bg-slate-900/40 backdrop-blur'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept=".txt,.csv,.pdf,.docx,.xlsx,.xls"
        />
        
        <div className="p-4 bg-brand-500/10 rounded-2xl text-brand-500 mb-4 animate-pulse-slow">
          <UploadCloud className="h-8 w-8" />
        </div>
        
        <p className="text-sm font-bold text-slate-700 dark:text-slate-350">
          Drag and drop your company document here, or click to browse
        </p>
        <p className="text-xs text-slate-400 mt-2 leading-relaxed">
          Supports PDF, TXT, CSV, DOCX, and Excel files up to 10MB. <br />
          Files are automatically tokenized and indexed using RAG.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Type Categories Tabs */}
        <div className="flex flex-wrap gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterType(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                filterType === cat
                  ? 'bg-brand-500 text-white shadow-md shadow-brand-500/10'
                  : 'bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 text-slate-500 hover:text-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Live Filter Search input */}
        <div className="relative w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search indexed files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 pl-10 pr-4 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-800/80 focus:border-brand-500/20 focus:outline-none transition-all text-slate-800 dark:text-slate-200"
          />
        </div>

      </div>

      {/* Documents List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDocs.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-400 text-xs">
            No matching documents found. Upload a document to expand the knowledge base cache.
          </div>
        ) : (
          filteredDocs.map((doc) => {
            const isSpreadsheet = doc.file_type === 'CSV' || doc.file_type === 'EXCEL';
            return (
              <div 
                key={doc.id} 
                className="glass-panel p-5 rounded-3xl border border-slate-200/60 dark:border-slate-800/40 flex flex-col justify-between h-48 hover:-translate-y-0.5 transition-all"
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <div className={`p-2 rounded-xl text-white ${
                      isSpreadsheet ? 'bg-emerald-500' : 'bg-brand-500'
                    }`}>
                      {isSpreadsheet ? <FileSpreadsheet className="h-4.5 w-4.5" /> : <FileText className="h-4.5 w-4.5" />}
                    </div>
                    
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => setPreviewDoc(doc)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-brand-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(doc.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate pr-4">
                    {doc.name}
                  </p>
                  <p className="text-[10px] text-slate-450 leading-relaxed mt-2 line-clamp-2">
                    {doc.content?.substring(0, 100) || 'Processing document content details...'}
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/60 pt-3 mt-3">
                  <span className="text-[10px] text-slate-400">
                    {(doc.file_size / 1024).toFixed(1)} KB
                  </span>
                  
                  <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 bg-emerald-500/10 text-emerald-500 rounded-full">
                    <Sparkles className="h-3 w-3" /> Indexed
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Document Text Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-6 animate-slide-up">
          <div className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-850 overflow-hidden flex flex-col max-h-[85vh]">
            
            <div className="px-6 py-4 border-b border-slate-200/60 dark:border-slate-800/60 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
              <div className="flex items-center gap-2">
                <FileText className="h-4.5 w-4.5 text-brand-500" />
                <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-250 truncate max-w-md">
                  {previewDoc.name}
                </h3>
              </div>
              <button
                onClick={() => setPreviewDoc(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 font-mono text-[11px] text-slate-650 dark:text-slate-350 leading-relaxed bg-slate-50/50 dark:bg-slate-950/20 whitespace-pre-wrap">
              {previewDoc.content || 'This document has no readable extracted text content.'}
            </div>

            <div className="px-6 py-4 border-t border-slate-200/60 dark:border-slate-800/60 flex justify-end gap-2 bg-slate-50 dark:bg-slate-900/50 text-xs">
              <span className="text-[10px] text-slate-400 self-center">
                Indexed: {new Date(previewDoc.created_at).toLocaleString()}
              </span>
              <button
                onClick={() => setPreviewDoc(null)}
                className="bg-brand-500 hover:bg-brand-600 text-white font-bold px-4 py-2 rounded-xl transition-all"
              >
                Done
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
export default KnowledgeBase;
