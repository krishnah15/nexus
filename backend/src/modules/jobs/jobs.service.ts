import prisma from '../../config/database';
import { scrapeJobUrl } from './scraper.service';

export async function getJobs(userId: string, query: any) {
  const page = parseInt(query.page) || 1;
  const limit = Math.min(parseInt(query.limit) || 20, 100);
  const skip = (page - 1) * limit;

  const where: any = { userId };
  if (query.status) where.status = query.status;
  if (query.search) {
    where.OR = [
      { company: { contains: query.search, mode: 'insensitive' } },
      { position: { contains: query.search, mode: 'insensitive' } },
      { location: { contains: query.search, mode: 'insensitive' } },
    ];
  }

  const orderBy: any = {};
  orderBy[query.sort || 'createdAt'] = query.order || 'desc';

  const [jobs, total] = await Promise.all([
    prisma.jobApplication.findMany({
      where, skip, take: limit, orderBy,
      include: { interviews: true },
    }),
    prisma.jobApplication.count({ where }),
  ]);

  return { jobs, total, page, limit };
}

export async function getJob(userId: string, id: string) {
  const job = await prisma.jobApplication.findFirst({
    where: { id, userId },
    include: { interviews: true },
  });
  if (!job) throw Object.assign(new Error('Job not found'), { statusCode: 404 });
  return job;
}

export async function createJob(userId: string, data: any) {
  return prisma.jobApplication.create({
    data: {
      ...data,
      userId,
      appliedDate: data.appliedDate ? new Date(data.appliedDate) : null,
    },
    include: { interviews: true },
  });
}

export async function updateJob(userId: string, id: string, data: any) {
  await getJob(userId, id);
  if (data.appliedDate) data.appliedDate = new Date(data.appliedDate);
  return prisma.jobApplication.update({
    where: { id },
    data,
    include: { interviews: true },
  });
}

export async function deleteJob(userId: string, id: string) {
  await getJob(userId, id);
  return prisma.jobApplication.delete({ where: { id } });
}

export async function scrapeJob(url: string) {
  return scrapeJobUrl(url);
}

// Interviews
export async function getInterviews(userId: string, jobId: string) {
  await getJob(userId, jobId);
  return prisma.jobInterview.findMany({ where: { jobId }, orderBy: { scheduledAt: 'asc' } });
}

export async function createInterview(userId: string, jobId: string, data: any) {
  await getJob(userId, jobId);
  return prisma.jobInterview.create({
    data: {
      ...data,
      jobId,
      scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
    },
  });
}

export async function updateInterview(userId: string, jobId: string, id: string, data: any) {
  await getJob(userId, jobId);
  if (data.scheduledAt) data.scheduledAt = new Date(data.scheduledAt);
  return prisma.jobInterview.update({ where: { id }, data });
}

export async function deleteInterview(userId: string, jobId: string, id: string) {
  await getJob(userId, jobId);
  return prisma.jobInterview.delete({ where: { id } });
}
