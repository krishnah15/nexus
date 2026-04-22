import { useEffect, useState, useCallback } from 'react';
import { Code2, Plus, Trash2, Edit3, X, ExternalLink } from 'lucide-react';
import { getDsaProblems, createDsaProblem, updateDsaProblem, deleteDsaProblem, getDsaStats } from '@/api/dsa.api';
import { StatusBadge } from '@/components/shared/status-badge';
import { EmptyState } from '@/components/shared/empty-state';
import { DSA_DIFFICULTIES, DSA_STATUSES } from '@/lib/constants';
import type { DsaProblem, DsaStats } from '@/types/dsa.types';

export function DsaPage() {
  const [problems, setProblems] = useState<DsaProblem[]>([]);
  const [stats, setStats] = useState<DsaStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProblem, setEditingProblem] = useState<DsaProblem | null>(null);
  const [difficultyFilter, setDifficultyFilter] = useState('');
  const [topicFilter, setTopicFilter] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (difficultyFilter) params.difficulty = difficultyFilter;
      if (topicFilter) params.topic = topicFilter;
      const [res, s] = await Promise.all([getDsaProblems(params), getDsaStats()]);
      setProblems(res.data);
      setStats(s);
    } catch { /* ignore */ }
    setLoading(false);
  }, [difficultyFilter, topicFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this problem?')) return;
    await deleteDsaProblem(id);
    fetchData();
  };

  const solved = stats?.byStatus.find((s) => s.status === 'solved')?._count || 0;
  const easyCount = stats?.byDifficulty.find((d) => d.difficulty === 'easy')?._count || 0;
  const mediumCount = stats?.byDifficulty.find((d) => d.difficulty === 'medium')?._count || 0;
  const hardCount = stats?.byDifficulty.find((d) => d.difficulty === 'hard')?._count || 0;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">DSA Practice</h1>
          <p className="text-muted-foreground text-base mt-2">Track your problem-solving journey</p>
        </div>
        <button onClick={() => { setEditingProblem(null); setShowForm(true); }} className="flex items-center gap-2.5 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-base hover:bg-primary/90">
          <Plus className="w-5 h-5" /> Add Problem
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-card border border-border rounded-xl p-6 text-center">
          <p className="text-4xl font-bold text-foreground">{solved}</p>
          <p className="text-sm text-muted-foreground mt-2">Solved</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-6 text-center">
          <p className="text-4xl font-bold text-green-400">{easyCount}</p>
          <p className="text-sm text-muted-foreground mt-2">Easy</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-6 text-center">
          <p className="text-4xl font-bold text-yellow-400">{mediumCount}</p>
          <p className="text-sm text-muted-foreground mt-2">Medium</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-6 text-center">
          <p className="text-4xl font-bold text-red-400">{hardCount}</p>
          <p className="text-sm text-muted-foreground mt-2">Hard</p>
        </div>
      </div>

      {/* Heatmap */}
      {stats?.heatmap && Object.keys(stats.heatmap).length > 0 && (
        <div className="bg-card border border-border rounded-xl p-8">
          <h2 className="text-base font-semibold text-foreground mb-4">Solve Activity</h2>
          <div className="flex flex-wrap gap-1.5">
            {(() => {
              const days: string[] = [];
              const today = new Date();
              for (let i = 180; i >= 0; i--) {
                const d = new Date(today);
                d.setDate(d.getDate() - i);
                days.push(d.toISOString().split('T')[0]);
              }
              return days.map((day) => {
                const count = stats.heatmap[day] || 0;
                const intensity = count === 0 ? 'bg-secondary' : count <= 1 ? 'bg-green-900' : count <= 3 ? 'bg-green-700' : 'bg-green-500';
                return <div key={day} className={`w-3.5 h-3.5 rounded-sm ${intensity}`} title={`${day}: ${count} solved`} />;
              });
            })()}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-4">
        <select value={difficultyFilter} onChange={(e) => setDifficultyFilter(e.target.value)} className="px-4 py-3 bg-secondary border border-border rounded-lg text-base text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50">
          <option value="">All Difficulties</option>
          {DSA_DIFFICULTIES.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
        </select>
        <input value={topicFilter} onChange={(e) => setTopicFilter(e.target.value)} placeholder="Filter by topic..." className="px-4 py-3 bg-secondary border border-border rounded-lg text-base text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" /></div>
      ) : problems.length === 0 ? (
        <EmptyState icon={Code2} title="No problems tracked" description="Start tracking your DSA practice — add problems from LeetCode, Codeforces, etc." action={
          <button onClick={() => setShowForm(true)} className="px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-base">Add your first problem</button>
        } />
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground uppercase">Problem</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground uppercase">Platform</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground uppercase">Difficulty</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground uppercase">Topic</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground uppercase">Status</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground uppercase">Time</th>
                <th className="text-right px-6 py-4 text-sm font-medium text-muted-foreground uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {problems.map((p) => (
                <tr key={p.id} className="border-b border-border last:border-0 hover:bg-secondary/30">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2.5">
                      <span className="text-base font-medium text-foreground">{p.title}</span>
                      {p.url && <a href={p.url} target="_blank" rel="noreferrer"><ExternalLink className="w-4 h-4 text-muted-foreground hover:text-primary" /></a>}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-base text-muted-foreground capitalize">{p.platform || '-'}</td>
                  <td className="px-6 py-4">
                    <span className={`text-base font-medium capitalize ${DSA_DIFFICULTIES.find((d) => d.value === p.difficulty)?.color || 'text-muted-foreground'}`}>
                      {p.difficulty || '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-base text-muted-foreground">{p.topic || '-'}</td>
                  <td className="px-6 py-4"><StatusBadge status={p.status} colorMap={DSA_STATUSES} /></td>
                  <td className="px-6 py-4 text-base text-muted-foreground">{p.timeTakenMin ? `${p.timeTakenMin}m` : '-'}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => { setEditingProblem(p); setShowForm(true); }} className="p-2 hover:bg-secondary rounded-lg"><Edit3 className="w-4 h-4 text-muted-foreground" /></button>
                      <button onClick={() => handleDelete(p.id)} className="p-2 hover:bg-destructive/10 rounded-lg"><Trash2 className="w-4 h-4 text-destructive" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && <DsaFormModal problem={editingProblem} onClose={() => setShowForm(false)} onSave={fetchData} />}
    </div>
  );
}

function DsaFormModal({ problem, onClose, onSave }: { problem: DsaProblem | null; onClose: () => void; onSave: () => void }) {
  const [form, setForm] = useState({
    title: problem?.title || '',
    platform: problem?.platform || '',
    url: problem?.url || '',
    difficulty: problem?.difficulty || '',
    topic: problem?.topic || '',
    status: problem?.status || 'todo',
    timeTakenMin: problem?.timeTakenMin?.toString() || '',
    notes: problem?.notes || '',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data: any = {
        title: form.title,
        platform: form.platform || undefined,
        url: form.url || undefined,
        difficulty: form.difficulty || undefined,
        topic: form.topic || undefined,
        status: form.status,
        timeTakenMin: form.timeTakenMin ? parseInt(form.timeTakenMin) : undefined,
        notes: form.notes || undefined,
        solvedAt: form.status === 'solved' ? new Date().toISOString() : undefined,
      };
      if (problem) await updateDsaProblem(problem.id, data);
      else await createDsaProblem(data);
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
          <h2 className="text-xl font-semibold text-foreground">{problem ? 'Edit Problem' : 'Add DSA Problem'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-secondary rounded-lg"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <div>
            <label className="block text-base font-medium text-foreground mb-2">Problem Title *</label>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required className={inputClass} />
          </div>
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-base font-medium text-foreground mb-2">Platform</label>
              <input value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })} placeholder="LeetCode, Codeforces..." className={inputClass} />
            </div>
            <div>
              <label className="block text-base font-medium text-foreground mb-2">Topic</label>
              <input value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} placeholder="Arrays, DP, Trees..." className={inputClass} />
            </div>
          </div>
          <div>
            <label className="block text-base font-medium text-foreground mb-2">URL</label>
            <input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} type="url" className={inputClass} />
          </div>
          <div className="grid grid-cols-3 gap-5">
            <div>
              <label className="block text-base font-medium text-foreground mb-2">Difficulty</label>
              <select value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })} className={inputClass}>
                <option value="">Select</option>
                {DSA_DIFFICULTIES.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-base font-medium text-foreground mb-2">Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={inputClass}>
                {DSA_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-base font-medium text-foreground mb-2">Time (min)</label>
              <input value={form.timeTakenMin} onChange={(e) => setForm({ ...form, timeTakenMin: e.target.value })} type="number" min={0} className={inputClass} />
            </div>
          </div>
          <div>
            <label className="block text-base font-medium text-foreground mb-2">Notes</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} className={`${inputClass} resize-none`} />
          </div>
          <div className="flex justify-end gap-4 pt-3">
            <button type="button" onClick={onClose} className="px-5 py-2.5 bg-secondary text-foreground rounded-lg text-base">Cancel</button>
            <button type="submit" disabled={saving} className="px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-base hover:bg-primary/90 disabled:opacity-50">
              {saving ? 'Saving...' : problem ? 'Update' : 'Add Problem'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
