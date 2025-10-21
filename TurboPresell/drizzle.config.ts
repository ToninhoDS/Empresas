import { defineConfig } from "drizzle-kit";
import * as dotenv from 'dotenv';

// Carregar variáveis de ambiente do .env.local
dotenv.config({ path: '.env.local' });

if (!process.env.SUPABASE_DB_URL) {
  throw new Error("SUPABASE_DB_URL não encontrada, verifique seu arquivo .env.local");
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.SUPABASE_DB_URL,
  },
});
