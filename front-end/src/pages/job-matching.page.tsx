import { useState, useEffect } from 'react';
import { Target, RefreshCw, Trash2, ExternalLink, Plus, MapPin, Briefcase, AlertCircle, Link2, Globe } from 'lucide-react';
import { extractSkillProfile, getSkillProfile, deleteSkillProfile, getMatchingJobs, getSuggestedRoles } from '@/api/job-matching.api';
import { createJob } from '@/api/jobs.api';
import { ResumeSelector } from '@/components/shared/resume-selector';
import type { SkillProfile, MatchedJob, MatchingJobsResponse } from '@/types/ats.types';

// Country code → LinkedIn geoId mapping (for better location filtering)
const LINKEDIN_GEO: Record<string, string> = {
  in: '102713980', us: '103644278', gb: '101165590', de: '101282230',
  ca: '101174742', au: '101452733', sg: '102454443', nl: '102890719', fr: '105015875',
};

function buildLinkedInUrl(role: string, location: string, country: string): string {
  const params = new URLSearchParams({ keywords: role });
  if (location) {
    params.set('location', location);
  } else if (LINKEDIN_GEO[country]) {
    params.set('geoId', LINKEDIN_GEO[country]);
  }
  return `https://www.linkedin.com/jobs/search/?${params.toString()}`;
}

function buildNaukriUrl(role: string, location?: string): string {
  const slug = role.replace(/[.\s/]+/g, '-').replace(/[^a-z0-9-]/gi, '').toLowerCase();
  if (location) {
    const locationSlug = location.replace(/\s+/g, '-').toLowerCase();
    return `https://www.naukri.com/${slug}-jobs-in-${locationSlug}`;
  }
  return `https://www.naukri.com/${slug}-jobs`;
}

export function JobMatchingPage() {
  const [profile, setProfile] = useState<SkillProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [documentId, setDocumentId] = useState('');
  const [extracting, setExtracting] = useState(false);

  const [suggestedRoles, setSuggestedRoles] = useState<{ role: string; count: number }[]>([]);
  const [selectedRole, setSelectedRole] = useState('');
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [location, setLocation] = useState('');
  const [country, setCountry] = useState('in');
  const [minMatch, setMinMatch] = useState(30);
  const [searching, setSearching] = useState(false);
  const [jobResult, setJobResult] = useState<MatchingJobsResponse | null>(null);
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set());
  const [error, setError] = useState('');

  useEffect(() => {
    getSkillProfile()
      .then((p) => {
        setProfile(p);
        if (p) {
          getSuggestedRoles().then((roles) => {
            setSuggestedRoles(roles);
            if (roles.length > 0) setSelectedRole(roles[0].role);
          }).catch(() => {});
        }
      })
      .catch(() => {})
      .finally(() => setLoadingProfile(false));
  }, []);

  const handleExtract = async () => {
    if (!documentId) return;
    setError('');
    setExtracting(true);
    try {
      const p = await extractSkillProfile(documentId);
      setProfile(p);
      setJobResult(null);
      setLoadingRoles(true);
      getSuggestedRoles(country).then((roles) => {
        setSuggestedRoles(roles);
        if (roles.length > 0) setSelectedRole(roles[0].role);
      }).catch(() => {}).finally(() => setLoadingRoles(false));
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to extract skills');
    }
    setExtracting(false);
  };

  const handleDeleteProfile = async () => {
    if (!confirm('Delete your skill profile?')) return;
    await deleteSkillProfile();
    setProfile(null);
    setJobResult(null);
  };

  const handleSearch = async () => {
    setError('');
    setSearching(true);
    try {
      const res = await getMatchingJobs({
        location: location || undefined,
        country,
        minMatch: String(minMatch),
      });
      setJobResult(res);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to fetch matching jobs');
    }
    setSearching(false);
  };

  const handleSaveJob = async (job: MatchedJob) => {
    try {
      await createJob({
        company: job.company,
        position: job.title,
        location: job.location,
        jobUrl: job.url,
        salaryMin: job.salaryMin,
        salaryMax: job.salaryMax,
        status: 'saved',
      });
      setSavedJobs((prev) => new Set([...prev, job.url]));
    } catch { /* ignore */ }
  };

  const matchColor = (pct: number) => {
    if (pct >= 80) return 'bg-green-500/15 text-green-400';
    if (pct >= 60) return 'bg-yellow-500/15 text-yellow-400';
    return 'bg-red-500/15 text-red-400';
  };

  if (loadingProfile) {
    return (
      <div className="flex justify-center py-16">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Job Matching</h1>
        <p className="text-muted-foreground text-base mt-2">
          Find jobs that match your skills from your resume
        </p>
      </div>

      {/* Skill Profile Section */}
      <div className="bg-card border border-border rounded-xl p-8">
        <h2 className="text-xl font-semibold text-foreground mb-6">Skill Profile</h2>

        {!profile ? (
          <div className="space-y-5">
            <p className="text-base text-muted-foreground">
              Extract skills from your resume to start matching jobs.
            </p>
            <div>
              <label className="block text-base font-medium text-foreground mb-2">Select Resume</label>
              <ResumeSelector value={documentId} onChange={setDocumentId} />
            </div>
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive text-base rounded-lg p-4">
                {error}
              </div>
            )}
            <button
              onClick={handleExtract}
              disabled={!documentId || extracting}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg text-base font-medium hover:bg-primary/90 disabled:opacity-50"
            >
              {extracting ? 'Extracting...' : 'Extract Skills'}
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-base text-muted-foreground">
                  Extracted from <span className="text-foreground font-medium">{profile.document.name}</span>
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {profile.skills.length} skills found · Last updated {new Date(profile.extractedAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => { setProfile(null); setDocumentId(''); }}
                  className="flex items-center gap-2 px-4 py-2.5 bg-secondary text-foreground rounded-lg text-base hover:bg-secondary/80"
                >
                  <RefreshCw className="w-4 h-4" /> Re-extract
                </button>
                <button
                  onClick={handleDeleteProfile}
                  className="flex items-center gap-2 px-4 py-2.5 bg-destructive/10 text-destructive rounded-lg text-base hover:bg-destructive/20"
                >
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill) => (
                <span key={skill} className="px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-sm font-medium">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Search on Job Platforms */}
      {profile && suggestedRoles.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-8 space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Search on Job Platforms</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Pick a role based on your skills, then search on LinkedIn or Naukri
            </p>
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-3">
              Suggested Roles {loadingRoles && <span className="text-primary ml-2">— checking job availability...</span>}
            </label>
            <div className="flex flex-wrap gap-3">
              {suggestedRoles.map(({ role, count }) => (
                <button
                  key={role}
                  onClick={() => setSelectedRole(role)}
                  className={`px-4 py-2.5 rounded-lg text-base font-medium transition-colors border flex items-center gap-2 ${
                    selectedRole === role
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-secondary text-foreground border-border hover:border-primary/50'
                  }`}
                >
                  {role}
                  {count > 0 && (
                    <span className={`text-sm px-2 py-0.5 rounded-full ${
                      selectedRole === role ? 'bg-white/20' : 'bg-primary/10 text-primary'
                    }`}>
                      {count >= 1000 ? `${(count / 1000).toFixed(1)}k` : count} jobs
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Location / Country */}
          <div className="flex gap-4 items-end flex-wrap">
            <div className="w-44">
              <label className="block text-sm font-medium text-muted-foreground mb-2">Country</label>
              <select
                value={country}
                onChange={(e) => {
                  const c = e.target.value;
                  setCountry(c);
                  setLoadingRoles(true);
                  getSuggestedRoles(c).then((roles) => {
                    setSuggestedRoles(roles);
                    if (roles.length > 0) setSelectedRole(roles[0].role);
                  }).catch(() => {}).finally(() => setLoadingRoles(false));
                }}
                className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-base text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="in">India</option>
                <option value="us">United States</option>
                <option value="gb">United Kingdom</option>
                <option value="de">Germany</option>
                <option value="ca">Canada</option>
                <option value="au">Australia</option>
                <option value="sg">Singapore</option>
                <option value="nl">Netherlands</option>
                <option value="fr">France</option>
              </select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-muted-foreground mb-2">City (optional)</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Mumbai, Bangalore, Remote..."
                  className="w-full pl-12 pr-4 py-3 bg-secondary border border-border rounded-lg text-base text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>
          </div>

          {/* Platform Buttons */}
          {selectedRole && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <a
                href={buildLinkedInUrl(selectedRole, location, country)}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-3 py-4 bg-[#0A66C2] text-white rounded-xl text-base font-medium hover:bg-[#004182] transition-colors"
              >
                <Link2 className="w-5 h-5" />
                Search "{selectedRole}" on LinkedIn
              </a>
              <a
                href={buildNaukriUrl(selectedRole, location || undefined)}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-3 py-4 bg-[#4A90D9] text-white rounded-xl text-base font-medium hover:bg-[#3A7BC8] transition-colors"
              >
                <Globe className="w-5 h-5" />
                Search "{selectedRole}" on Naukri
              </a>
            </div>
          )}
        </div>
      )}

      {/* Adzuna API Search */}
      {profile && (
        <div className="bg-card border border-border rounded-xl p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Adzuna Job Search</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Fetched results with skill match scoring
              </p>
            </div>
            <div className="flex items-end gap-4">
              <div className="w-48">
                <label className="block text-sm font-medium text-muted-foreground mb-2">Min Match: {minMatch}%</label>
                <input
                  type="range"
                  min={10}
                  max={100}
                  step={5}
                  value={minMatch}
                  onChange={(e) => setMinMatch(parseInt(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>
              <button
                onClick={handleSearch}
                disabled={searching}
                className="px-6 py-3 bg-primary text-primary-foreground rounded-lg text-base font-medium hover:bg-primary/90 disabled:opacity-50"
              >
                {searching ? 'Searching...' : 'Search Adzuna'}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive text-base rounded-lg p-4">
              {error}
            </div>
          )}
        </div>
      )}

      {/* Adzuna Results */}
      {jobResult && (
        <div className="space-y-6">
          {!jobResult.apiConfigured ? (
            <div className="bg-card border border-border rounded-xl p-8">
              <div className="flex items-start gap-4">
                <AlertCircle className="w-6 h-6 text-warning flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Adzuna API Not Configured</h3>
                  <p className="text-base text-muted-foreground mt-2">
                    To fetch job listings with match scoring, add an API key to your backend <code className="text-primary">.env</code> file.
                    You can still use LinkedIn and Naukri search above.
                  </p>
                  <ul className="mt-3 space-y-1 text-base text-muted-foreground">
                    <li>- <strong>Adzuna</strong> (free tier): Set <code className="text-primary">ADZUNA_APP_ID</code> and <code className="text-primary">ADZUNA_APP_KEY</code></li>
                  </ul>
                </div>
              </div>
            </div>
          ) : jobResult.jobs.length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-8 text-center">
              <Target className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground">No matching jobs found</h3>
              <p className="text-base text-muted-foreground mt-2">
                Try lowering the minimum match percentage or changing the location.
              </p>
            </div>
          ) : (
            <>
              <p className="text-base text-muted-foreground">
                Found <span className="text-foreground font-semibold">{jobResult.jobs.length}</span> jobs matching {minMatch}%+ of your skills
              </p>
              <div className="space-y-4">
                {jobResult.jobs.map((job, idx) => (
                  <div key={idx} className="bg-card border border-border rounded-xl p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-foreground truncate">{job.title}</h3>
                          <span className={`px-3 py-1 rounded-lg text-sm font-bold ${matchColor(job.matchPercentage)}`}>
                            {job.matchPercentage}% match
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-base text-muted-foreground">
                          <span className="flex items-center gap-1.5">
                            <Briefcase className="w-4 h-4" /> {job.company}
                          </span>
                          {job.location && (
                            <span className="flex items-center gap-1.5">
                              <MapPin className="w-4 h-4" /> {job.location}
                            </span>
                          )}
                          {(job.salaryMin || job.salaryMax) && (
                            <span>
                              {job.salaryMin ? `$${job.salaryMin.toLocaleString()}` : '?'} - {job.salaryMax ? `$${job.salaryMax.toLocaleString()}` : '?'}
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {job.matchedSkills.slice(0, 10).map((skill) => (
                            <span key={skill} className="px-2 py-0.5 bg-green-500/10 text-green-400 rounded text-sm">
                              {skill}
                            </span>
                          ))}
                          {job.matchedSkills.length > 10 && (
                            <span className="px-2 py-0.5 text-muted-foreground text-sm">
                              +{job.matchedSkills.length - 10} more
                            </span>
                          )}
                        </div>

                        {job.description && (
                          <p className="text-sm text-muted-foreground mt-3 line-clamp-2">{job.description}</p>
                        )}
                      </div>

                      <div className="flex flex-col gap-2 flex-shrink-0">
                        {job.url && (
                          <a
                            href={job.url}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90"
                          >
                            <ExternalLink className="w-4 h-4" /> View Job
                          </a>
                        )}
                        <button
                          onClick={() => handleSaveJob(job)}
                          disabled={savedJobs.has(job.url)}
                          className="flex items-center gap-2 px-4 py-2.5 bg-secondary text-foreground rounded-lg text-sm hover:bg-secondary/80 disabled:opacity-50"
                        >
                          <Plus className="w-4 h-4" /> {savedJobs.has(job.url) ? 'Saved' : 'Save to Tracker'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
