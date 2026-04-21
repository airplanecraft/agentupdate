import { PrismaClient } from './database/generated/prisma/client.ts';
import fs from 'fs';

const prisma = new PrismaClient();

async function main() {
  const plugins = JSON.parse(fs.readFileSync('./website/src/data/plugins.json', 'utf-8'));
  console.log(`\n🗑️  Clearing existing plugin data...`);
  await prisma.plugin.deleteMany({});
  console.log(`✅ Cleared.`);

  console.log(`\n📦 Seeding ${plugins.length} real plugins...`);
  for (const p of plugins) {
    await prisma.plugin.upsert({
      where: { slug: p.slug },
      update: p,
      create: p,
    });
    console.log(`  ✓ ${p.name} [${p.category}]`);
  }
  console.log(`\n✅ Seeding complete — ${plugins.length} plugins loaded.`);
  await prisma.$disconnect();
}

main().catch(console.error);
