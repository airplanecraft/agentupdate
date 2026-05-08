import { PrismaClient } from './database/generated/prisma/index.js';
const prisma = new PrismaClient();
async function main() {
  const series = await prisma.tutorialSeries.findMany({
    where: { slug: { in: ['autoresearch-tutorial', 'firecrawl-tutorial'] } },
    select: { id: true, slug: true, coverImage: true, coverImageEn: true }
  });
  console.log(series);
}
main().catch(console.error).finally(() => prisma.$disconnect());
