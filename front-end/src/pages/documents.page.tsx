import { useEffect, useState, useCallback } from 'react';
import { FileText, Trash2, Download, X, Upload } from 'lucide-react';
import { getDocuments, uploadDocument, deleteDocument, getDownloadUrl } from '@/api/documents.api';
import { EmptyState } from '@/components/shared/empty-state';
import { formatDate } from '@/lib/utils';
import type { DocumentItem } from '@/types/country.types';

export function DocumentsPage() {
  const [docs, setDocs] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);

  const fetchDocs = useCallback(async () => {
    setLoading(true);
    try { setDocs(await getDocuments()); } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => { fetchDocs(); }, [fetchDocs]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this document?')) return;
    await deleteDocument(id);
    fetchDocs();
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '-';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Documents</h1>
          <p className="text-muted-foreground text-base mt-2">Upload and manage your documents</p>
        </div>
        <button onClick={() => setShowUpload(true)} className="flex items-center gap-2.5 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-base hover:bg-primary/90">
          <Upload className="w-5 h-5" /> Upload
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" /></div>
      ) : docs.length === 0 ? (
        <EmptyState icon={FileText} title="No documents" description="Upload documents like passports, degrees, certificates, and experience letters." action={
          <button onClick={() => setShowUpload(true)} className="px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-base">Upload your first document</button>
        } />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {docs.map((doc) => (
            <div key={doc.id} className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-base font-medium text-foreground truncate">{doc.name}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">{formatFileSize(doc.fileSize)}</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-3 text-sm text-muted-foreground">
                {doc.category && <span className="px-2.5 py-1 bg-secondary rounded-lg capitalize">{doc.category}</span>}
                <span>{formatDate(doc.createdAt)}</span>
                {doc.expiryDate && <span className="text-warning">Expires: {formatDate(doc.expiryDate)}</span>}
              </div>
              <div className="mt-4 flex justify-end gap-3">
                <a href={getDownloadUrl(doc.id)} className="p-2 hover:bg-secondary rounded-lg"><Download className="w-5 h-5 text-muted-foreground" /></a>
                <button onClick={() => handleDelete(doc.id)} className="p-2 hover:bg-destructive/10 rounded-lg"><Trash2 className="w-5 h-5 text-destructive" /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showUpload && <UploadModal onClose={() => setShowUpload(false)} onSave={fetchDocs} />}
    </div>
  );
}

function UploadModal({ onClose, onSave }: { onClose: () => void; onSave: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (name) formData.append('name', name);
      if (category) formData.append('category', category);
      if (expiryDate) formData.append('expiryDate', new Date(expiryDate).toISOString());
      await uploadDocument(formData);
      onSave();
      onClose();
    } catch { /* ignore */ }
    setSaving(false);
  };

  const inputClass = "w-full px-4 py-3 bg-secondary border border-border rounded-lg text-base text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-2xl w-full max-w-lg">
        <div className="flex items-center justify-between p-8 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">Upload Document</h2>
          <button onClick={onClose} className="p-2 hover:bg-secondary rounded-lg"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <div>
            <label className="block text-base font-medium text-foreground mb-2">File *</label>
            <input type="file" onChange={(e) => { setFile(e.target.files?.[0] || null); if (!name && e.target.files?.[0]) setName(e.target.files[0].name); }} required className="w-full text-base text-foreground file:mr-4 file:py-2.5 file:px-5 file:rounded-lg file:border-0 file:text-base file:bg-secondary file:text-foreground hover:file:bg-secondary/80" />
          </div>
          <div>
            <label className="block text-base font-medium text-foreground mb-2">Document Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
          </div>
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-base font-medium text-foreground mb-2">Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass}>
                <option value="">Select</option>
                <option value="passport">Passport</option>
                <option value="degree">Degree</option>
                <option value="certificate">Certificate</option>
                <option value="experience_letter">Experience Letter</option>
                <option value="resume">Resume</option>
                <option value="cover_letter">Cover Letter</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-base font-medium text-foreground mb-2">Expiry Date</label>
              <input value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} type="date" className={inputClass} />
            </div>
          </div>
          <div className="flex justify-end gap-4 pt-3">
            <button type="button" onClick={onClose} className="px-5 py-2.5 bg-secondary text-foreground rounded-lg text-base">Cancel</button>
            <button type="submit" disabled={saving || !file} className="px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-base hover:bg-primary/90 disabled:opacity-50">
              {saving ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
