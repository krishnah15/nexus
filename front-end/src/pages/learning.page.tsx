import { useEffect, useState, useCallback } from 'react';
import { BookOpen, Plus, Trash2, Edit3, X } from 'lucide-react';
import { getLearningItems, createLearningItem, updateLearningItem, deleteLearningItem } from '@/api/learning.api';
import { StatusBadge } from '@/components/shared/status-badge';
import { EmptyState } from '@/components/shared/empty-state';
import { LEARNING_CATEGORIES, LEARNING_STATUSES } from '@/lib/constants';
import type { LearningItem } from '@/types/learning.types';

export function LearningPage() {
  const [items, setItems] = useState<LearningItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<LearningItem | null>(null);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (categoryFilter) params.category = categoryFilter;
      if (statusFilter) params.status = statusFilter;
      const res = await getLearningItems(params);
      setItems(res.data);
    } catch { /* ignore */ }
    setLoading(false);
  }, [categoryFilter, statusFilter]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const handleProgressChange = async (id: string, progress: number) => {
    const status = progress === 100 ? 'completed' : progress > 0 ? 'in_progress' : 'not_started';
    await updateLearningItem(id, { progress, status });
    fetchItems();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this learning item?')) return;
    await deleteLearningItem(id);
    fetchItems();
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Learning & Skills</h1>
          <p className="text-muted-foreground text-base mt-2">Track your courses, skills, and certifications</p>
        </div>
        <button onClick={() => { setEditingItem(null); setShowForm(true); }} className="flex items-center gap-2.5 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-base hover:bg-primary/90">
          <Plus className="w-5 h-5" /> Add Item
        </button>
      </div>

      <div className="flex gap-4">
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="px-4 py-3 bg-secondary border border-border rounded-lg text-base text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50">
          <option value="">All Categories</option>
          {LEARNING_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-3 bg-secondary border border-border rounded-lg text-base text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50">
          <option value="">All Statuses</option>
          {LEARNING_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" /></div>
      ) : items.length === 0 ? (
        <EmptyState icon={BookOpen} title="No learning items" description="Start tracking what you're learning — courses, skills, certifications, books, and projects." action={
          <button onClick={() => setShowForm(true)} className="px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-base">Add your first item</button>
        } />
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground uppercase">Title</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground uppercase">Category</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground uppercase">Platform</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground uppercase">Progress</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground uppercase">Status</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground uppercase">Priority</th>
                <th className="text-right px-6 py-4 text-sm font-medium text-muted-foreground uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-border last:border-0 hover:bg-secondary/30">
                  <td className="px-6 py-4">
                    <span className="text-base font-medium text-foreground">{item.title}</span>
                    {item.url && <a href={item.url} target="_blank" rel="noreferrer" className="text-sm text-primary ml-2 hover:underline">Link</a>}
                  </td>
                  <td className="px-6 py-4 text-base text-muted-foreground capitalize">{item.category}</td>
                  <td className="px-6 py-4 text-base text-muted-foreground">{item.platform || '-'}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-28 bg-secondary rounded-full h-2.5">
                        <div className="bg-primary h-2.5 rounded-full transition-all" style={{ width: `${item.progress}%` }} />
                      </div>
                      <input
                        type="number"
                        min={0} max={100}
                        value={item.progress}
                        onChange={(e) => handleProgressChange(item.id, parseInt(e.target.value) || 0)}
                        className="w-14 px-2 py-1 bg-secondary border border-border rounded text-sm text-center text-foreground focus:outline-none"
                      />
                      <span className="text-sm text-muted-foreground">%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4"><StatusBadge status={item.status} colorMap={LEARNING_STATUSES} /></td>
                  <td className="px-6 py-4">
                    <span className={`text-sm font-medium capitalize ${item.priority === 'high' ? 'text-red-400' : item.priority === 'medium' ? 'text-yellow-400' : 'text-gray-400'}`}>
                      {item.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => { setEditingItem(item); setShowForm(true); }} className="p-2 hover:bg-secondary rounded-lg"><Edit3 className="w-4 h-4 text-muted-foreground" /></button>
                      <button onClick={() => handleDelete(item.id)} className="p-2 hover:bg-destructive/10 rounded-lg"><Trash2 className="w-4 h-4 text-destructive" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && <LearningFormModal item={editingItem} onClose={() => setShowForm(false)} onSave={fetchItems} />}
    </div>
  );
}

function LearningFormModal({ item, onClose, onSave }: { item: LearningItem | null; onClose: () => void; onSave: () => void }) {
  const [form, setForm] = useState({
    title: item?.title || '',
    category: item?.category || 'course',
    platform: item?.platform || '',
    url: item?.url || '',
    progress: item?.progress || 0,
    status: item?.status || 'not_started',
    priority: item?.priority || 'medium',
    targetDate: item?.targetDate ? new Date(item.targetDate).toISOString().split('T')[0] : '',
    notes: item?.notes || '',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data: any = {
        ...form,
        progress: Number(form.progress),
        url: form.url || undefined,
        platform: form.platform || undefined,
        targetDate: form.targetDate ? new Date(form.targetDate).toISOString() : undefined,
        notes: form.notes || undefined,
      };
      if (item) await updateLearningItem(item.id, data);
      else await createLearningItem(data);
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
          <h2 className="text-xl font-semibold text-foreground">{item ? 'Edit Item' : 'Add Learning Item'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-secondary rounded-lg"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <div>
            <label className="block text-base font-medium text-foreground mb-2">Title *</label>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required className={inputClass} />
          </div>
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-base font-medium text-foreground mb-2">Category</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inputClass}>
                {LEARNING_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-base font-medium text-foreground mb-2">Platform</label>
              <input value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })} placeholder="Udemy, Coursera..." className={inputClass} />
            </div>
          </div>
          <div>
            <label className="block text-base font-medium text-foreground mb-2">URL</label>
            <input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} type="url" className={inputClass} />
          </div>
          <div className="grid grid-cols-3 gap-5">
            <div>
              <label className="block text-base font-medium text-foreground mb-2">Progress (%)</label>
              <input value={form.progress} onChange={(e) => setForm({ ...form, progress: parseInt(e.target.value) || 0 })} type="number" min={0} max={100} className={inputClass} />
            </div>
            <div>
              <label className="block text-base font-medium text-foreground mb-2">Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={inputClass}>
                {LEARNING_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-base font-medium text-foreground mb-2">Priority</label>
              <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} className={inputClass}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-base font-medium text-foreground mb-2">Target Date</label>
            <input value={form.targetDate} onChange={(e) => setForm({ ...form, targetDate: e.target.value })} type="date" className={inputClass} />
          </div>
          <div>
            <label className="block text-base font-medium text-foreground mb-2">Notes</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} className={`${inputClass} resize-none`} />
          </div>
          <div className="flex justify-end gap-4 pt-3">
            <button type="button" onClick={onClose} className="px-5 py-2.5 bg-secondary text-foreground rounded-lg text-base">Cancel</button>
            <button type="submit" disabled={saving} className="px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-base hover:bg-primary/90 disabled:opacity-50">
              {saving ? 'Saving...' : item ? 'Update' : 'Add Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
