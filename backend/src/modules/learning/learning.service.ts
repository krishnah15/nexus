import prisma from '../../config/database';

export async function getItems(userId: string, query: any) {
  const page = parseInt(query.page) || 1;
  const limit = Math.min(parseInt(query.limit) || 20, 100);
  const skip = (page - 1) * limit;

  const where: any = { userId };
  if (query.category) where.category = query.category;
  if (query.status) where.status = query.status;
  if (query.search) {
    where.OR = [
      { title: { contains: query.search, mode: 'insensitive' } },
      { platform: { contains: query.search, mode: 'insensitive' } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.learningItem.findMany({ where, skip, take: limit, orderBy: { updatedAt: 'desc' } }),
    prisma.learningItem.count({ where }),
  ]);

  return { items, total, page, limit };
}

export async function getItem(userId: string, id: string) {
  const item = await prisma.learningItem.findFirst({ where: { id, userId } });
  if (!item) throw Object.assign(new Error('Learning item not found'), { statusCode: 404 });
  return item;
}

export async function createItem(userId: string, data: any) {
  return prisma.learningItem.create({
    data: { ...data, userId, targetDate: data.targetDate ? new Date(data.targetDate) : null },
  });
}

export async function updateItem(userId: string, id: string, data: any) {
  await getItem(userId, id);
  if (data.targetDate) data.targetDate = new Date(data.targetDate);
  return prisma.learningItem.update({ where: { id }, data });
}

export async function deleteItem(userId: string, id: string) {
  await getItem(userId, id);
  return prisma.learningItem.delete({ where: { id } });
}
