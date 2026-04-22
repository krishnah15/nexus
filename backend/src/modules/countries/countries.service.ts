import prisma from '../../config/database';

export async function getCountries(userId: string) {
  return prisma.country.findMany({
    where: { userId },
    include: { pathways: true, documents: true },
    orderBy: { priority: 'desc' },
  });
}

export async function getCountry(userId: string, id: string) {
  const country = await prisma.country.findFirst({
    where: { id, userId },
    include: { pathways: true, documents: true },
  });
  if (!country) throw Object.assign(new Error('Country not found'), { statusCode: 404 });
  return country;
}

export async function createCountry(userId: string, data: any) {
  return prisma.country.create({
    data: { ...data, userId },
    include: { pathways: true },
  });
}

export async function updateCountry(userId: string, id: string, data: any) {
  await getCountry(userId, id);
  return prisma.country.update({
    where: { id }, data,
    include: { pathways: true },
  });
}

export async function deleteCountry(userId: string, id: string) {
  await getCountry(userId, id);
  return prisma.country.delete({ where: { id } });
}

// Pathways
export async function getPathways(userId: string, countryId: string) {
  await getCountry(userId, countryId);
  return prisma.pathway.findMany({ where: { countryId }, orderBy: { createdAt: 'desc' } });
}

export async function createPathway(userId: string, countryId: string, data: any) {
  await getCountry(userId, countryId);
  return prisma.pathway.create({ data: { ...data, countryId } });
}

export async function updatePathway(userId: string, countryId: string, id: string, data: any) {
  await getCountry(userId, countryId);
  return prisma.pathway.update({ where: { id }, data });
}

export async function deletePathway(userId: string, countryId: string, id: string) {
  await getCountry(userId, countryId);
  return prisma.pathway.delete({ where: { id } });
}
