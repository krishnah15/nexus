import prisma from '../../config/database';

export async function getOverview(userId: string) {
  const [
    totalJobs,
    jobsByStatus,
    totalLearning,
    learningByStatus,
    totalDsa,
    dsaByStatus,
    totalCountries,
    recentJobs,
    recentLearning,
  ] = await Promise.all([
    prisma.jobApplication.count({ where: { userId } }),
    prisma.jobApplication.groupBy({ by: ['status'], where: { userId }, _count: true }),
    prisma.learningItem.count({ where: { userId } }),
    prisma.learningItem.groupBy({ by: ['status'], where: { userId }, _count: true }),
    prisma.dsaProblem.count({ where: { userId } }),
    prisma.dsaProblem.groupBy({ by: ['status'], where: { userId }, _count: true }),
    prisma.country.count({ where: { userId } }),
    prisma.jobApplication.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 5, select: { id: true, company: true, position: true, status: true, createdAt: true } }),
    prisma.learningItem.findMany({ where: { userId }, orderBy: { updatedAt: 'desc' }, take: 5, select: { id: true, title: true, category: true, status: true, progress: true, updatedAt: true } }),
  ]);

  return {
    jobs: { total: totalJobs, byStatus: jobsByStatus, recent: recentJobs },
    learning: { total: totalLearning, byStatus: learningByStatus, recent: recentLearning },
    dsa: { total: totalDsa, byStatus: dsaByStatus },
    countries: { total: totalCountries },
  };
}

export async function getJobsFunnel(userId: string) {
  const stages = ['saved', 'applied', 'screening', 'interview', 'technical', 'offer', 'accepted', 'rejected', 'withdrawn'];
  const counts = await prisma.jobApplication.groupBy({
    by: ['status'],
    where: { userId },
    _count: true,
  });

  return stages.map((stage) => ({
    stage,
    count: (counts.find((c: { status: string; _count: number }) => c.status === stage) as any)?._count || 0,
  }));
}

export async function getLearningProgress(userId: string) {
  const items = await prisma.learningItem.findMany({
    where: { userId },
    select: { category: true, progress: true, status: true },
  });

  const byCategory: Record<string, { total: number; avgProgress: number; completed: number }> = {};
  items.forEach((item: { category: string; progress: number; status: string }) => {
    if (!byCategory[item.category]) {
      byCategory[item.category] = { total: 0, avgProgress: 0, completed: 0 };
    }
    byCategory[item.category].total++;
    byCategory[item.category].avgProgress += item.progress;
    if (item.status === 'completed') byCategory[item.category].completed++;
  });

  Object.keys(byCategory).forEach((key) => {
    byCategory[key].avgProgress = Math.round(byCategory[key].avgProgress / byCategory[key].total);
  });

  return byCategory;
}
