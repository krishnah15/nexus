import { useEffect, useState } from 'react';
import { Briefcase, BookOpen, Code2, Globe, TrendingUp, Target } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { getDashboardOverview, getJobsFunnel, type DashboardOverview, type FunnelData } from '@/api/dashboard.api';
import { StatusBadge } from '@/components/shared/status-badge';
import { JOB_STATUSES } from '@/lib/constants';
import { formatRelativeDate } from '@/lib/utils';

const COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#22c55e', '#f59e0b', '#ef4444', '#ec4899', '#64748b', '#f97316'];

export function DashboardPage() {
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [funnel, setFunnel] = useState<FunnelData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getDashboardOverview(), getJobsFunnel()])
      .then(([o, f]) => { setOverview(o); setFunnel(f); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" /></div>;
  }

  const statCards = [
    { label: 'Job Applications', value: overview?.jobs.total || 0, icon: Briefcase, color: 'text-blue-400' },
    { label: 'Learning Items', value: overview?.learning.total || 0, icon: BookOpen, color: 'text-purple-400' },
    { label: 'DSA Problems', value: overview?.dsa.total || 0, icon: Code2, color: 'text-green-400' },
    { label: 'Countries Tracked', value: overview?.countries.total || 0, icon: Globe, color: 'text-orange-400' },
  ];

  const dsaPieData = overview?.dsa.byStatus.map((s) => ({ name: s.status, value: s._count })) || [];
  const funnelFiltered = funnel.filter((f) => f.count > 0);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground text-base mt-2">Your self-development overview</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => (
          <div key={card.label} className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-base text-muted-foreground">{card.label}</p>
                <p className="text-4xl font-bold text-foreground mt-2">{card.value}</p>
              </div>
              <card.icon className={`w-10 h-10 ${card.color}`} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Jobs Funnel */}
        <div className="bg-card border border-border rounded-xl p-8">
          <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2.5">
            <TrendingUp className="w-6 h-6 text-primary" />
            Job Application Funnel
          </h2>
          {funnelFiltered.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={funnelFiltered} layout="vertical">
                <XAxis type="number" stroke="#71717a" fontSize={13} />
                <YAxis dataKey="stage" type="category" stroke="#71717a" fontSize={13} width={90} />
                <Tooltip contentStyle={{ backgroundColor: '#111118', border: '1px solid #27272a', borderRadius: '8px', color: '#fafafa', fontSize: '14px' }} />
                <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted-foreground text-base py-10 text-center">No job applications yet</p>
          )}
        </div>

        {/* DSA Progress */}
        <div className="bg-card border border-border rounded-xl p-8">
          <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2.5">
            <Target className="w-6 h-6 text-primary" />
            DSA Progress
          </h2>
          {dsaPieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={dsaPieData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {dsaPieData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#111118', border: '1px solid #27272a', borderRadius: '8px', color: '#fafafa', fontSize: '14px' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted-foreground text-base py-10 text-center">No DSA problems tracked yet</p>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-card border border-border rounded-xl p-8">
          <h2 className="text-xl font-semibold text-foreground mb-6">Recent Job Applications</h2>
          {overview?.jobs.recent && overview.jobs.recent.length > 0 ? (
            <div className="space-y-4">
              {overview.jobs.recent.map((job) => (
                <div key={job.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                  <div>
                    <p className="text-base font-medium text-foreground">{job.position}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">{job.company}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <StatusBadge status={job.status} colorMap={JOB_STATUSES} />
                    <span className="text-sm text-muted-foreground">{formatRelativeDate(job.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-base">No recent applications</p>
          )}
        </div>

        <div className="bg-card border border-border rounded-xl p-8">
          <h2 className="text-xl font-semibold text-foreground mb-6">Recent Learning Activity</h2>
          {overview?.learning.recent && overview.learning.recent.length > 0 ? (
            <div className="space-y-4">
              {overview.learning.recent.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                  <div>
                    <p className="text-base font-medium text-foreground">{item.title}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">{item.category}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-20 bg-secondary rounded-full h-2.5">
                      <div className="bg-primary h-2.5 rounded-full" style={{ width: `${item.progress}%` }} />
                    </div>
                    <span className="text-sm text-muted-foreground">{item.progress}%</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-base">No learning items yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
