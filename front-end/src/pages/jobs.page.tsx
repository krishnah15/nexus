import { useEffect, useState, useCallback } from 'react';
import { Briefcase, Plus, Link as LinkIcon, Search, Trash2, Edit3, ExternalLink, X } from 'lucide-react';
import { getJobs, createJob, updateJob, deleteJob, scrapeJob } from '@/api/jobs.api';
import { EmptyState } from '@/components/shared/empty-state';
import { JOB_STATUSES } from '@/lib/constants';
import { formatDate } from '@/lib/utils';
import type { JobApplication, ScrapedJobData } from '@/types/job.types';

export function JobsPage() {
  const [jobs, setJobs] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showScrape, setShowScrape] = useState(false);
  const [editingJob, setEditingJob] = useState<JobApplication | null>(null);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { page: String(pagination.page), limit: '20' };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const res = await getJobs(params);
      setJobs(res.data);
      setPagination((p) => ({ ...p, totalPages: res.pagination.totalPages, total: res.pagination.total }));
    } catch { /* ignore */ }
    setLoading(false);
  }, [pagination.page, search, statusFilter]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  const handleStatusChange = async (id: string, status: string) => {
    await updateJob(id, { status } as any);
    fetchJobs();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this job application?')) return;
    await deleteJob(id);
    fetchJobs();
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Job Tracker</h1>
          <p className="text-muted-foreground text-base mt-2">{pagination.total} applications tracked</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowScrape(true)} className="flex items-center gap-2.5 px-5 py-2.5 bg-secondary text-foreground rounded-lg text-base hover:bg-secondary/80 transition-colors">
            <LinkIcon className="w-5 h-5" /> Paste URL
          </button>
          <button onClick={() => { setEditingJob(null); setShowForm(true); }} className="flex items-center gap-2.5 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-base hover:bg-primary/90 transition-colors">
            <Plus className="w-5 h-5" /> Add Job
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPagination((p) => ({ ...p, page: 1 })); }}
            placeholder="Search company or position..."
            className="w-full pl-12 pr-4 py-3 bg-secondary border border-border rounded-lg text-base text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPagination((p) => ({ ...p, page: 1 })); }}
          className="px-4 py-3 bg-secondary border border-border rounded-lg text-base text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <option value="">All Statuses</option>
          {JOB_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" /></div>
      ) : jobs.length === 0 ? (
        <EmptyState icon={Briefcase} title="No job applications" description="Start tracking your job applications by adding one manually or pasting a job URL." action={
          <button onClick={() => setShowForm(true)} className="px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-base hover:bg-primary/90">Add your first job</button>
        } />
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground uppercase tracking-wider">Company</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground uppercase tracking-wider">Position</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground uppercase tracking-wider">Location</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground uppercase tracking-wider">Applied</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground uppercase tracking-wider">Salary</th>
                <th className="text-right px-6 py-4 text-sm font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2.5">
                      <span className="text-base font-medium text-foreground">{job.company}</span>
                      {job.jobUrl && <a href={job.jobUrl} target="_blank" rel="noreferrer"><ExternalLink className="w-4 h-4 text-muted-foreground hover:text-primary" /></a>}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-base text-foreground">{job.position}</td>
                  <td className="px-6 py-4 text-base text-muted-foreground">{job.location || '-'}</td>
                  <td className="px-6 py-4">
                    <select
                      value={job.status}
                      onChange={(e) => handleStatusChange(job.id, e.target.value)}
                      className="bg-transparent border border-border rounded-lg px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      {JOB_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </td>
                  <td className="px-6 py-4 text-base text-muted-foreground">{job.appliedDate ? formatDate(job.appliedDate) : '-'}</td>
                  <td className="px-6 py-4 text-base text-muted-foreground">
                    {job.salaryMin || job.salaryMax
                      ? `${job.salaryCurrency} ${job.salaryMin ? job.salaryMin.toLocaleString() : '?'} - ${job.salaryMax ? job.salaryMax.toLocaleString() : '?'}`
                      : '-'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => { setEditingJob(job); setShowForm(true); }} className="p-2 hover:bg-secondary rounded-lg"><Edit3 className="w-4 h-4 text-muted-foreground" /></button>
                      <button onClick={() => handleDelete(job.id)} className="p-2 hover:bg-destructive/10 rounded-lg"><Trash2 className="w-4 h-4 text-destructive" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-border">
              <button
                onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
                disabled={pagination.page === 1}
                className="px-4 py-2 text-base bg-secondary rounded-lg disabled:opacity-50"
              >Previous</button>
              <span className="text-base text-muted-foreground">Page {pagination.page} of {pagination.totalPages}</span>
              <button
                onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
                disabled={pagination.page === pagination.totalPages}
                className="px-4 py-2 text-base bg-secondary rounded-lg disabled:opacity-50"
              >Next</button>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showForm && <JobFormModal job={editingJob} onClose={() => setShowForm(false)} onSave={fetchJobs} />}
      {showScrape && <ScrapeModal onClose={() => setShowScrape(false)} onSave={fetchJobs} />}
    </div>
  );
}

function JobFormModal({ job, onClose, onSave }: { job: JobApplication | null; onClose: () => void; onSave: () => void }) {
  const [form, setForm] = useState({
    company: job?.company || '',
    position: job?.position || '',
    location: job?.location || '',
    jobUrl: job?.jobUrl || '',
    salaryMin: job?.salaryMin?.toString() || '',
    salaryMax: job?.salaryMax?.toString() || '',
    salaryCurrency: job?.salaryCurrency || 'USD',
    status: job?.status || 'saved',
    appliedDate: job?.appliedDate ? new Date(job.appliedDate).toISOString().split('T')[0] : '',
    notes: job?.notes || '',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data: any = {
        company: form.company,
        position: form.position,
        location: form.location || undefined,
        jobUrl: form.jobUrl || undefined,
        salaryMin: form.salaryMin ? parseInt(form.salaryMin) : undefined,
        salaryMax: form.salaryMax ? parseInt(form.salaryMax) : undefined,
        salaryCurrency: form.salaryCurrency,
        status: form.status,
        appliedDate: form.appliedDate ? new Date(form.appliedDate).toISOString() : undefined,
        notes: form.notes || undefined,
      };
      if (job) await updateJob(job.id, data);
      else await createJob(data);
      onSave();
      onClose();
    } catch { /* ignore */ }
    setSaving(false);
  };

  const inputClass = "w-full px-4 py-3 bg-secondary border border-border rounded-lg text-base text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-8 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">{job ? 'Edit Job' : 'Add Job Application'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-secondary rounded-lg"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-base font-medium text-foreground mb-2">Company *</label>
              <input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} required className={inputClass} />
            </div>
            <div>
              <label className="block text-base font-medium text-foreground mb-2">Position *</label>
              <input value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} required className={inputClass} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-base font-medium text-foreground mb-2">Location</label>
              <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="block text-base font-medium text-foreground mb-2">Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={inputClass}>
                {JOB_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-base font-medium text-foreground mb-2">Job URL</label>
            <input value={form.jobUrl} onChange={(e) => setForm({ ...form, jobUrl: e.target.value })} type="url" className={inputClass} />
          </div>
          <div className="grid grid-cols-3 gap-5">
            <div>
              <label className="block text-base font-medium text-foreground mb-2">Min Salary</label>
              <input value={form.salaryMin} onChange={(e) => setForm({ ...form, salaryMin: e.target.value })} type="number" className={inputClass} />
            </div>
            <div>
              <label className="block text-base font-medium text-foreground mb-2">Max Salary</label>
              <input value={form.salaryMax} onChange={(e) => setForm({ ...form, salaryMax: e.target.value })} type="number" className={inputClass} />
            </div>
            <div>
              <label className="block text-base font-medium text-foreground mb-2">Currency</label>
              <input value={form.salaryCurrency} onChange={(e) => setForm({ ...form, salaryCurrency: e.target.value })} maxLength={3} className={inputClass} />
            </div>
          </div>
          <div>
            <label className="block text-base font-medium text-foreground mb-2">Applied Date</label>
            <input value={form.appliedDate} onChange={(e) => setForm({ ...form, appliedDate: e.target.value })} type="date" className={inputClass} />
          </div>
          <div>
            <label className="block text-base font-medium text-foreground mb-2">Notes</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} className={`${inputClass} resize-none`} />
          </div>
          <div className="flex justify-end gap-4 pt-3">
            <button type="button" onClick={onClose} className="px-5 py-2.5 bg-secondary text-foreground rounded-lg text-base">Cancel</button>
            <button type="submit" disabled={saving} className="px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-base hover:bg-primary/90 disabled:opacity-50">
              {saving ? 'Saving...' : job ? 'Update' : 'Add Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ScrapeModal({ onClose, onSave }: { onClose: () => void; onSave: () => void }) {
  const [url, setUrl] = useState('');
  const [scraped, setScraped] = useState<ScrapedJobData | null>(null);
  const [scraping, setScraping] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleScrape = async () => {
    setError('');
    setScraping(true);
    try {
      const data = await scrapeJob(url);
      setScraped(data);
    } catch {
      setError('Failed to scrape job posting. The URL may not be accessible.');
    }
    setScraping(false);
  };

  const handleSave = async () => {
    if (!scraped) return;
    setSaving(true);
    try {
      await createJob({
        company: scraped.company || 'Unknown Company',
        position: scraped.position || 'Unknown Position',
        location: scraped.location,
        jobUrl: url,
        status: 'saved',
        scrapedData: scraped as any,
      });
      onSave();
      onClose();
    } catch { /* ignore */ }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-2xl w-full max-w-xl">
        <div className="flex items-center justify-between p-8 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">Scrape Job Posting</h2>
          <button onClick={onClose} className="p-2 hover:bg-secondary rounded-lg"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-8 space-y-5">
          <div>
            <label className="block text-base font-medium text-foreground mb-2">Job Posting URL</label>
            <div className="flex gap-3">
              <input value={url} onChange={(e) => setUrl(e.target.value)} type="url" placeholder="https://..." className="flex-1 px-4 py-3 bg-secondary border border-border rounded-lg text-base text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
              <button onClick={handleScrape} disabled={!url || scraping} className="px-5 py-3 bg-primary text-primary-foreground rounded-lg text-base hover:bg-primary/90 disabled:opacity-50">
                {scraping ? 'Scraping...' : 'Scrape'}
              </button>
            </div>
          </div>

          {error && <p className="text-destructive text-base">{error}</p>}

          {scraped && (
            <div className="space-y-4 bg-secondary/50 rounded-xl p-6">
              <h3 className="text-base font-medium text-foreground">Scraped Data Preview</h3>
              <div className="space-y-3 text-base">
                <p><span className="text-muted-foreground">Company:</span> <span className="text-foreground">{scraped.company || 'Not found'}</span></p>
                <p><span className="text-muted-foreground">Position:</span> <span className="text-foreground">{scraped.position || 'Not found'}</span></p>
                <p><span className="text-muted-foreground">Location:</span> <span className="text-foreground">{scraped.location || 'Not found'}</span></p>
                {scraped.salary && <p><span className="text-muted-foreground">Salary:</span> <span className="text-foreground">{scraped.salary}</span></p>}
                {scraped.description && <p className="text-muted-foreground text-sm mt-3 line-clamp-3">{scraped.description}</p>}
              </div>
              <button onClick={handleSave} disabled={saving} className="w-full py-3 bg-primary text-primary-foreground rounded-lg text-base hover:bg-primary/90 disabled:opacity-50 mt-4">
                {saving ? 'Saving...' : 'Save to Job Tracker'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
