import { PrismaClient } from './crawler/src/generated/db/client.js';
const prisma = new PrismaClient({ datasources: { db: { url: 'postgresql://openclaweco:openclaweco@localhost:5432/openclaweco?schema=public' } } });
prisma.$connect()
  .then(() => console.log("Connected successfully!"))
  .catch(e => console.error("Connection failed:", e.message))
  .finally(() => prisma.$disconnect());
