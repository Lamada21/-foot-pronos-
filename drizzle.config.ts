// Cette config est utilisée pour drizzle-kit (push, generate).
// Le dialect SQLite est utilisé car le schema.ts utilise `sqliteTable` de drizzle-orm/sqlite-core.
// Pour Neon/PostgreSQL en production, les migrations sont gérées manuellement via seed-neon.ts
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'sqlite',
  schema: './src/db/schema.ts',
  out: './drizzle',
  dbCredentials: {
    url: './football.db',
  },
});
