import { useEffect, useState } from 'react';
import { FileText } from 'lucide-react';
import { getDocuments } from '@/api/documents.api';
import type { DocumentItem } from '@/types/country.types';

interface ResumeSelectorProps {
  value: string;
  onChange: (documentId: string) => void;
}

export function ResumeSelector({ value, onChange }: ResumeSelectorProps) {
  const [docs, setDocs] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDocuments()
      .then((all) => {
        // Filter to PDFs and resumes
        const resumes = all.filter(
          (d) => d.fileType === 'application/pdf' || d.category === 'resume' || d.name.toLowerCase().includes('resume') || d.name.toLowerCase().includes('cv')
        );
        // If no resumes found, show all PDFs
        const filtered = resumes.length > 0 ? resumes : all.filter((d) => d.fileType === 'application/pdf');
        setDocs(filtered.length > 0 ? filtered : all);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="px-4 py-3 bg-secondary border border-border rounded-lg text-base text-muted-foreground">
        Loading documents...
      </div>
    );
  }

  if (docs.length === 0) {
    return (
      <div className="flex items-center gap-3 px-4 py-3 bg-secondary border border-border rounded-lg text-base text-muted-foreground">
        <FileText className="w-5 h-5" />
        No documents uploaded. Upload a resume in the Documents section first.
      </div>
    );
  }

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-base text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
    >
      <option value="">Select a resume...</option>
      {docs.map((doc) => (
        <option key={doc.id} value={doc.id}>
          {doc.name} {doc.category ? `(${doc.category})` : ''}
        </option>
      ))}
    </select>
  );
}
