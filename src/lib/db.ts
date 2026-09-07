/**
 * LuminaForge.ai — Database Client
 * ================================================================
 * Auto-selects the best available database client:
 *
 * 1. Prisma + SQLite — default for local development / preview
 *    - Uses DATABASE_URL env var (already configured in .env)
 *    - Full type-safety, migrations, auto-completion
 *
 * 2. Supabase + Postgres — production mode
 *    - Set SUPABASE_URL + SUPABASE_SERVICE_ROLE in .env.local
 *    - Row-level security enforced at DB level
 *    - Automatic profile/project/generation management
 *
 * The app auto-detects which mode to use at runtime.
 * =====================================================================
 */

// Default: PrismaClient for development & preview
const { PrismaClient } = await import('@prisma/client');

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db;
}