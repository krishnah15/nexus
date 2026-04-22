import { useState, useEffect } from 'react';
import { ScanSearch, Trash2, ChevronDown, ChevronUp, Lightbulb, CheckCircle, XCircle } from 'lucide-react';
import { checkAtsScore, getAtsHistory, deleteAtsCheck } from '@/api/ats.api';
import { ResumeSelector } from '@/components/shared/resume-selector';
import { EmptyState } from '@/components/shared/empty-state';
import type { AtsCheckResult } from '@/types/ats.types';

export function AtsPage() {
  const [documentId, setDocumentId] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<AtsCheckResult | null>(null);
  const [history, setHistory] = useState<AtsCheckResult[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [error, setError] = useState('');
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    getAtsHistory()
      .then(setHistory)
      .catch(() => {})
      .finally(() => setLoadingHistory(false));
  }, []);

  const handleCheck = async () => {
    if (!documentId || !jobDescription) return;
    setError('');
    setChecking(true);
    try {
      const res = await checkAtsScore({ documentId, jobDescription });
      setResult(res);
      setHistory((prev) => [res, ...prev]);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to check ATS score');
    }
    setChecking(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this ATS check?')) return;
    await deleteAtsCheck(id);
    setHistory((prev) => prev.filter((h) => h.id !== id));
    if (result?.id === id) setResult(null);
  };

  const scoreColor = (score: number) => {
    if (score >= 70) return 'text-green-400';
    if (score >= 40) return 'text-yellow-400';
    return 'text-red-400';
  };

  const scoreBg = (score: number) => {
    if (score >= 70) return 'stroke-green-500';
    if (score >= 40) return 'stroke-yellow-500';
    return 'stroke-red-500';
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">ATS Score Check</h1>
        <p className="text-muted-foreground text-base mt-2">
          Check how well your resume matches a job description
        </p>
      </div>

      {/* Check Form */}
      <div className="bg-card border border-border rounded-xl p-8 space-y-6">
        <div>
          <label className="block text-base font-medium text-foreground mb-2">Select Resume</label>
          <ResumeSelector value={documentId} onChange={setDocumentId} />
        </div>

        <div>
          <label className="block text-base font-medium text-foreground mb-2">
            Job Description
            <span className="text-sm text-muted-foreground ml-2">({jobDescription.length}/10000)</span>
          </label>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            rows={8}
            placeholder="Paste the full job description here..."
            className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-base text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
            maxLength={10000}
          />
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive text-base rounded-lg p-4">
            {error}
          </div>
        )}

        <button
          onClick={handleCheck}
          disabled={!documentId || jobDescription.length < 50 || checking}
          className="px-6 py-3 bg-primary text-primary-foreground rounded-lg text-base font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {checking ? 'Analyzing...' : 'Check ATS Score'}
        </button>
      </div>

      {/* Result */}
      {result && (
        <div className="bg-card border border-border rounded-xl p-8 space-y-8">
          <div className="flex items-start gap-8">
            {/* Score Ring */}
            <div className="flex-shrink-0">
              <div className="relative w-32 h-32">
                <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="currentColor" strokeWidth="8" className="text-secondary" />
                  <circle
                    cx="60" cy="60" r="50" fill="none" strokeWidth="8"
                    className={scoreBg(result.score)}
                    strokeDasharray={`${(result.score / 100) * 314} 314`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-3xl font-bold ${scoreColor(result.score)}`}>{result.score}</span>
                  <span className="text-sm text-muted-foreground">/ 100</span>
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="flex-1 space-y-2">
              <h2 className="text-xl font-semibold text-foreground">
                {result.score >= 70 ? 'Strong Match' : result.score >= 40 ? 'Moderate Match' : 'Needs Improvement'}
              </h2>
              <p className="text-base text-muted-foreground">
                Your resume matches <span className={`font-semibold ${scoreColor(result.score)}`}>{result.score}%</span> of the keywords in this job description.
              </p>
              <p className="text-sm text-muted-foreground">
                {result.matchedKeywords.length} matched · {result.missingKeywords.length} missing
              </p>
            </div>
          </div>

          {/* Matched Keywords */}
          {result.matchedKeywords.length > 0 && (
            <div>
              <h3 className="text-base font-medium text-foreground mb-3 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" /> Matched Keywords
              </h3>
              <div className="flex flex-wrap gap-2">
                {result.matchedKeywords.map((kw) => (
                  <span key={kw} className="px-3 py-1.5 bg-green-500/15 text-green-400 rounded-lg text-sm font-medium">
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Missing Keywords */}
          {result.missingKeywords.length > 0 && (
            <div>
              <h3 className="text-base font-medium text-foreground mb-3 flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-400" /> Missing Keywords
              </h3>
              <div className="flex flex-wrap gap-2">
                {result.missingKeywords.map((kw) => (
                  <span key={kw} className="px-3 py-1.5 bg-red-500/15 text-red-400 rounded-lg text-sm font-medium">
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Suggestions */}
          {result.suggestions.length > 0 && (
            <div>
              <h3 className="text-base font-medium text-foreground mb-3 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-yellow-400" /> Suggestions
              </h3>
              <ul className="space-y-3">
                {result.suggestions.map((s, i) => (
                  <li key={i} className="flex gap-3 text-base text-muted-foreground">
                    <span className="text-yellow-400 font-semibold">{i + 1}.</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* History */}
      <div>
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="flex items-center gap-2 text-base font-medium text-foreground mb-4"
        >
          Previous Checks ({history.length})
          {showHistory ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>

        {showHistory && (
          loadingHistory ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
            </div>
          ) : history.length === 0 ? (
            <EmptyState icon={ScanSearch} title="No previous checks" description="Run your first ATS score check above." />
          ) : (
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground uppercase">Resume</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground uppercase">Score</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground uppercase">Matched</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground uppercase">Missing</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground uppercase">Date</th>
                    <th className="text-right px-6 py-4 text-sm font-medium text-muted-foreground uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((check) => (
                    <tr
                      key={check.id}
                      className="border-b border-border last:border-0 hover:bg-secondary/30 cursor-pointer"
                      onClick={() => setResult(check)}
                    >
                      <td className="px-6 py-4 text-base text-foreground">{check.document.name}</td>
                      <td className="px-6 py-4">
                        <span className={`text-base font-bold ${scoreColor(check.score)}`}>{check.score}%</span>
                      </td>
                      <td className="px-6 py-4 text-base text-green-400">{check.matchedKeywords.length}</td>
                      <td className="px-6 py-4 text-base text-red-400">{check.missingKeywords.length}</td>
                      <td className="px-6 py-4 text-base text-muted-foreground">
                        {new Date(check.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(check.id); }}
                          className="p-2 hover:bg-destructive/10 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>
    </div>
  );
}
