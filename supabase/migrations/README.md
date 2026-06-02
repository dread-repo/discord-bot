# Legacy SQL migrations

Schema is managed by **Prisma** (`prisma/schema.prisma`, `prisma/migrations/`).

`001_initial.sql` remains as a historical reference. New changes: `pnpm exec prisma migrate dev`.

Database still runs on **Supabase Postgres**; set `DATABASE_URL` to the Supabase connection string (pooler URI recommended for the bot/worker).
