import { Link, Navigate } from 'react-router-dom';
import {
  Briefcase,
  ScanSearch,
  Target,
  BookOpen,
  Code2,
  Globe,
  FileText,
  LayoutDashboard,
  ArrowRight,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

const features = [
  {
    icon: Briefcase,
    title: 'Job Tracker',
    description: 'Centralize every application, interview, and offer. Never lose track of where you applied.',
  },
  {
    icon: ScanSearch,
    title: 'ATS Resume Check',
    description: 'Beat the bots. Instant analysis of keyword match, format issues, and recruiter signals.',
  },
  {
    icon: Target,
    title: 'AI Job Matching',
    description: 'Fit scores against real listings so you spend time on roles that actually fit your stack.',
  },
  {
    icon: BookOpen,
    title: 'Learning Roadmap',
    description: 'A curated path through the skills hiring managers actually ask about — no more tutorial hell.',
  },
  {
    icon: Code2,
    title: 'DSA Practice',
    description: 'Structured problem sets, progress tracking, and patterns that show up in real interviews.',
  },
  {
    icon: Globe,
    title: 'Move Abroad',
    description: 'Compare countries, visa paths, and cost of living for developers looking to relocate.',
  },
  {
    icon: FileText,
    title: 'Document Vault',
    description: 'Resumes, cover letters, portfolios — versioned and ready to send the moment you need them.',
  },
  {
    icon: LayoutDashboard,
    title: 'Unified Dashboard',
    description: 'Every metric that matters to your search, in one place. No more stitching spreadsheets together.',
  },
];

const highlights = [
  'Built for developers serious about their next role',
  'AI-powered resume and job matching',
  'Everything in one workspace — no tool sprawl',
];

export function LandingPage() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
      </div>
    );
  }

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-primary tracking-tight">NEXUS</h1>
            <span className="hidden sm:inline text-sm text-muted-foreground ml-2">
              Self Development Platform
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Sign in
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--color-primary)/15%,_transparent_60%)] pointer-events-none" />
        <div className="max-w-5xl mx-auto px-6 pt-24 pb-20 text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4" />
            The all-in-one career workspace for developers
          </div>

          <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05] mb-6">
            Ship your career,{' '}
            <span className="text-primary">not just your code.</span>
          </h2>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Track applications, beat ATS systems, match to the right roles, and keep your skills
            sharp — everything you need between deciding to switch jobs and signing the offer.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link
              to="/register"
              className="group inline-flex items-center gap-2 px-6 py-3.5 text-base font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all"
            >
              Start for free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-6 py-3.5 text-base font-semibold bg-secondary text-foreground rounded-lg hover:bg-secondary/80 border border-border transition-all"
            >
              I already have an account
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-muted-foreground">
            {highlights.map((item) => (
              <div key={item} className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-success" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-border">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <div className="max-w-2xl mb-16">
            <h3 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Everything your job hunt actually needs.
            </h3>
            <p className="text-lg text-muted-foreground">
              Purpose-built modules that replace a dozen tabs, spreadsheets, and half-finished tools.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group p-6 bg-card border border-border rounded-xl hover:border-primary/40 hover:bg-card/80 transition-all"
              >
                <div className="w-11 h-11 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-5 group-hover:bg-primary/15 transition-colors">
                  <feature.icon className="w-5 h-5" />
                </div>
                <h4 className="text-base font-semibold mb-2">{feature.title}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border">
        <div className="max-w-4xl mx-auto px-6 py-24 text-center">
          <h3 className="text-3xl md:text-4xl font-bold tracking-tight mb-5">
            Stop juggling tools. Start landing offers.
          </h3>
          <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto">
            Create your workspace in under a minute. No credit card, no setup friction.
          </p>
          <Link
            to="/register"
            className="group inline-flex items-center gap-2 px-6 py-3.5 text-base font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all"
          >
            Create your account
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-primary">NEXUS</span>
            <span>· Self Development Platform</span>
          </div>
          <div>© {new Date().getFullYear()} Nexus. Built for developers.</div>
        </div>
      </footer>
    </div>
  );
}
