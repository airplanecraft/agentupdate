const { PrismaClient } = require('/Users/eric/work/openclaweco.com/database/node_modules/@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const series = await prisma.tutorialSeries.findMany({
    where: { slug: { in: ['autoresearch-tutorial', 'firecrawl-tutorial'] } },
    select: { id: true, slug: true, coverImage: true, coverImageEn: true }
  });
  console.log(series);
}
main().catch(console.error).finally(() => prisma.$disconnect());
