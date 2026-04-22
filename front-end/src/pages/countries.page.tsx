import { useEffect, useState, useCallback } from 'react';
import { Globe, Plus, Trash2, Edit3, X, ChevronRight, Clock, DollarSign } from 'lucide-react';
import { getCountries, createCountry, updateCountry, deleteCountry, createPathway, updatePathway, deletePathway } from '@/api/countries.api';
import { StatusBadge } from '@/components/shared/status-badge';
import { EmptyState } from '@/components/shared/empty-state';
import { COUNTRY_STATUSES, PATHWAY_TYPES } from '@/lib/constants';
import type { Country, Pathway } from '@/types/country.types';

export function CountriesPage() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCountry, setEditingCountry] = useState<Country | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [showPathwayForm, setShowPathwayForm] = useState(false);
  const [editingPathway, setEditingPathway] = useState<Pathway | null>(null);

  const fetchCountries = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getCountries();
      setCountries(data);
      if (selectedCountry) {
        setSelectedCountry(data.find((c) => c.id === selectedCountry.id) || null);
      }
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => { fetchCountries(); }, [fetchCountries]);

  const handleDeleteCountry = async (id: string) => {
    if (!confirm('Delete this country and all its pathways?')) return;
    await deleteCountry(id);
    if (selectedCountry?.id === id) setSelectedCountry(null);
    fetchCountries();
  };

  const handleDeletePathway = async (countryId: string, id: string) => {
    if (!confirm('Delete this pathway?')) return;
    await deletePathway(countryId, id);
    fetchCountries();
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Move Abroad</h1>
          <p className="text-muted-foreground text-base mt-2">Track countries, pathways, and requirements</p>
        </div>
        <button onClick={() => { setEditingCountry(null); setShowForm(true); }} className="flex items-center gap-2.5 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-base hover:bg-primary/90">
          <Plus className="w-5 h-5" /> Add Country
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" /></div>
      ) : countries.length === 0 ? (
        <EmptyState icon={Globe} title="No countries tracked" description="Start researching countries you'd like to migrate to." action={
          <button onClick={() => setShowForm(true)} className="px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-base">Add your first country</button>
        } />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Country Cards */}
          <div className="lg:col-span-1 space-y-4">
            {countries.map((country) => (
              <div
                key={country.id}
                onClick={() => setSelectedCountry(country)}
                className={`bg-card border rounded-xl p-5 cursor-pointer transition-all ${
                  selectedCountry?.id === country.id ? 'border-primary ring-1 ring-primary/50' : 'border-border hover:border-primary/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Globe className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-foreground">{country.name}</h3>
                      <p className="text-sm text-muted-foreground mt-0.5">{country.pathways.length} pathways</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={country.status} colorMap={COUNTRY_STATUSES} />
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Detail Panel */}
          <div className="lg:col-span-2">
            {selectedCountry ? (
              <div className="bg-card border border-border rounded-xl">
                <div className="flex items-center justify-between p-8 border-b border-border">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">{selectedCountry.name}</h2>
                    <StatusBadge status={selectedCountry.status} colorMap={COUNTRY_STATUSES} className="mt-3" />
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => { setEditingCountry(selectedCountry); setShowForm(true); }} className="p-2.5 hover:bg-secondary rounded-lg"><Edit3 className="w-5 h-5 text-muted-foreground" /></button>
                    <button onClick={() => handleDeleteCountry(selectedCountry.id)} className="p-2.5 hover:bg-destructive/10 rounded-lg"><Trash2 className="w-5 h-5 text-destructive" /></button>
                  </div>
                </div>

                {selectedCountry.notes && (
                  <div className="px-8 py-5 border-b border-border">
                    <p className="text-base text-muted-foreground">{selectedCountry.notes}</p>
                  </div>
                )}

                <div className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-base font-semibold text-foreground uppercase tracking-wider">Pathways</h3>
                    <button onClick={() => { setEditingPathway(null); setShowPathwayForm(true); }} className="flex items-center gap-1.5 text-sm text-primary hover:underline">
                      <Plus className="w-4 h-4" /> Add Pathway
                    </button>
                  </div>

                  {selectedCountry.pathways.length === 0 ? (
                    <p className="text-base text-muted-foreground py-6 text-center">No pathways added yet</p>
                  ) : (
                    <div className="space-y-4">
                      {selectedCountry.pathways.map((pathway) => (
                        <div key={pathway.id} className="bg-secondary/50 rounded-xl p-6">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-base font-medium text-foreground">{pathway.type}</h4>
                            <div className="flex items-center gap-3">
                              <StatusBadge status={pathway.status} colorMap={COUNTRY_STATUSES} />
                              <button onClick={() => { setEditingPathway(pathway); setShowPathwayForm(true); }} className="p-1.5 hover:bg-secondary rounded-lg"><Edit3 className="w-4 h-4 text-muted-foreground" /></button>
                              <button onClick={() => handleDeletePathway(selectedCountry.id, pathway.id)} className="p-1.5 hover:bg-destructive/10 rounded-lg"><Trash2 className="w-4 h-4 text-destructive" /></button>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-5 text-sm text-muted-foreground">
                            {pathway.timeline && <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {pathway.timeline}</span>}
                            {pathway.costEstimate && <span className="flex items-center gap-1.5"><DollarSign className="w-4 h-4" /> {pathway.costEstimate}</span>}
                          </div>
                          {pathway.notes && <p className="text-sm text-muted-foreground mt-3">{pathway.notes}</p>}
                          {pathway.requirements && typeof pathway.requirements === 'object' && (
                            <div className="mt-4 space-y-2">
                              {Object.entries(pathway.requirements as Record<string, string>).map(([key, val]) => (
                                <div key={key} className="flex items-center gap-2.5 text-sm">
                                  <span className="text-muted-foreground">{key}:</span>
                                  <span className="text-foreground">{String(val)}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-card border border-border rounded-xl flex items-center justify-center h-72">
                <p className="text-muted-foreground text-base">Select a country to view details</p>
              </div>
            )}
          </div>
        </div>
      )}

      {showForm && <CountryFormModal country={editingCountry} onClose={() => setShowForm(false)} onSave={fetchCountries} />}
      {showPathwayForm && selectedCountry && (
        <PathwayFormModal countryId={selectedCountry.id} pathway={editingPathway} onClose={() => setShowPathwayForm(false)} onSave={fetchCountries} />
      )}
    </div>
  );
}

function CountryFormModal({ country, onClose, onSave }: { country: Country | null; onClose: () => void; onSave: () => void }) {
  const [form, setForm] = useState({
    name: country?.name || '',
    priority: country?.priority || 0,
    status: country?.status || 'researching',
    notes: country?.notes || '',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = { ...form, priority: Number(form.priority), notes: form.notes || undefined };
      if (country) await updateCountry(country.id, data);
      else await createCountry(data);
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
          <h2 className="text-xl font-semibold text-foreground">{country ? 'Edit Country' : 'Add Country'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-secondary rounded-lg"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <div>
            <label className="block text-base font-medium text-foreground mb-2">Country Name *</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className={inputClass} />
          </div>
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-base font-medium text-foreground mb-2">Priority</label>
              <input value={form.priority} onChange={(e) => setForm({ ...form, priority: parseInt(e.target.value) || 0 })} type="number" min={0} className={inputClass} />
            </div>
            <div>
              <label className="block text-base font-medium text-foreground mb-2">Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={inputClass}>
                {COUNTRY_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-base font-medium text-foreground mb-2">Notes</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} className={`${inputClass} resize-none`} />
          </div>
          <div className="flex justify-end gap-4 pt-3">
            <button type="button" onClick={onClose} className="px-5 py-2.5 bg-secondary text-foreground rounded-lg text-base">Cancel</button>
            <button type="submit" disabled={saving} className="px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-base hover:bg-primary/90 disabled:opacity-50">
              {saving ? 'Saving...' : country ? 'Update' : 'Add Country'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function PathwayFormModal({ countryId, pathway, onClose, onSave }: { countryId: string; pathway: Pathway | null; onClose: () => void; onSave: () => void }) {
  const [form, setForm] = useState({
    type: pathway?.type || '',
    timeline: pathway?.timeline || '',
    costEstimate: pathway?.costEstimate || '',
    status: pathway?.status || 'researching',
    notes: pathway?.notes || '',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = {
        type: form.type,
        timeline: form.timeline || undefined,
        costEstimate: form.costEstimate || undefined,
        status: form.status,
        notes: form.notes || undefined,
      };
      if (pathway) await updatePathway(countryId, pathway.id, data);
      else await createPathway(countryId, data);
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
          <h2 className="text-xl font-semibold text-foreground">{pathway ? 'Edit Pathway' : 'Add Pathway'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-secondary rounded-lg"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <div>
            <label className="block text-base font-medium text-foreground mb-2">Pathway Type *</label>
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} required className={inputClass}>
              <option value="">Select type</option>
              {PATHWAY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-base font-medium text-foreground mb-2">Timeline</label>
              <input value={form.timeline} onChange={(e) => setForm({ ...form, timeline: e.target.value })} placeholder="6-12 months" className={inputClass} />
            </div>
            <div>
              <label className="block text-base font-medium text-foreground mb-2">Cost Estimate</label>
              <input value={form.costEstimate} onChange={(e) => setForm({ ...form, costEstimate: e.target.value })} placeholder="$2,000 - $5,000" className={inputClass} />
            </div>
          </div>
          <div>
            <label className="block text-base font-medium text-foreground mb-2">Status</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={inputClass}>
              {COUNTRY_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-base font-medium text-foreground mb-2">Notes</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} className={`${inputClass} resize-none`} placeholder="Requirements, eligibility criteria, etc." />
          </div>
          <div className="flex justify-end gap-4 pt-3">
            <button type="button" onClick={onClose} className="px-5 py-2.5 bg-secondary text-foreground rounded-lg text-base">Cancel</button>
            <button type="submit" disabled={saving} className="px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-base hover:bg-primary/90 disabled:opacity-50">
              {saving ? 'Saving...' : pathway ? 'Update' : 'Add Pathway'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
