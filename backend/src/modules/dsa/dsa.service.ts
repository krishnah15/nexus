import prisma from '../../config/database';

export async function getProblems(userId: string, query: any) {
  const page = parseInt(query.page) || 1;
  const limit = Math.min(parseInt(query.limit) || 20, 100);
  const skip = (page - 1) * limit;

  const where: any = { userId };
  if (query.difficulty) where.difficulty = query.difficulty;
  if (query.topic) where.topic = query.topic;
  if (query.status) where.status = query.status;
  if (query.search) {
    where.title = { contains: query.search, mode: 'insensitive' };
  }

  const [problems, total] = await Promise.all([
    prisma.dsaProblem.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
    prisma.dsaProblem.count({ where }),
  ]);

  return { problems, total, page, limit };
}

export async function getProblem(userId: string, id: string) {
  const problem = await prisma.dsaProblem.findFirst({ where: { id, userId } });
  if (!problem) throw Object.assign(new Error('Problem not found'), { statusCode: 404 });
  return problem;
}

export async function createProblem(userId: string, data: any) {
  return prisma.dsaProblem.create({
    data: { ...data, userId, solvedAt: data.solvedAt ? new Date(data.solvedAt) : null },
  });
}

export async function updateProblem(userId: string, id: string, data: any) {
  await getProblem(userId, id);
  if (data.solvedAt) data.solvedAt = new Date(data.solvedAt);
  return prisma.dsaProblem.update({ where: { id }, data });
}

export async function deleteProblem(userId: string, id: string) {
  await getProblem(userId, id);
  return prisma.dsaProblem.delete({ where: { id } });
}

export async function getStats(userId: string) {
  const [byDifficulty, byTopic, byStatus, recentActivity] = await Promise.all([
    prisma.dsaProblem.groupBy({ by: ['difficulty'], where: { userId }, _count: true }),
    prisma.dsaProblem.groupBy({ by: ['topic'], where: { userId }, _count: true }),
    prisma.dsaProblem.groupBy({ by: ['status'], where: { userId }, _count: true }),
    prisma.dsaProblem.findMany({
      where: { userId, solvedAt: { not: null } },
      select: { solvedAt: true },
      orderBy: { solvedAt: 'desc' },
      take: 365,
    }),
  ]);

  // Build heatmap data (daily solve counts for last 365 days)
  const heatmap: Record<string, number> = {};
  recentActivity.forEach((p) => {
    if (p.solvedAt) {
      const day = p.solvedAt.toISOString().split('T')[0];
      heatmap[day] = (heatmap[day] || 0) + 1;
    }
  });

  return { byDifficulty, byTopic, byStatus, heatmap };
}
