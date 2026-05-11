
import { PrismaClient } from '../admin/src/generated/db';
const prisma = new PrismaClient();

async function main() {
  const series = await prisma.tutorialSeries.findMany({
    where: {
      status: { in: ['published', 'published_zh', 'published_all'] }
    },
    select: {
      title: true,
      titleEn: true,
      slug: true,
      description: true,
      descriptionEn: true
    },
    orderBy: { sortOrder: 'asc' }
  });
  console.log(JSON.stringify(series, null, 2));
  await prisma.$disconnect();
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
