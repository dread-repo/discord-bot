import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';

let prisma: PrismaClient | undefined;
let pool: Pool | undefined;

export function getPrisma(): PrismaClient {
  if (prisma !== undefined) {
    return prisma;
  }
  const databaseUrl = process.env['DATABASE_URL'];
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required for Prisma');
  }
  pool = new Pool({ connectionString: databaseUrl });
  const adapter = new PrismaPg(pool);
  prisma = new PrismaClient({ adapter });
  return prisma;
}

export async function disconnectPrisma(): Promise<void> {
  if (prisma !== undefined) {
    await prisma.$disconnect();
    prisma = undefined;
  }
  if (pool !== undefined) {
    await pool.end();
    pool = undefined;
  }
}
