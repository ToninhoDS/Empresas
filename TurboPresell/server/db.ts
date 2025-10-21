import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@shared/schema';
import { supabase } from '../lib/supabaseClient';

// Verificar se as variáveis de ambiente necessárias estão definidas
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  throw new Error(
    "Variáveis de ambiente do Supabase não configuradas. Verifique seu arquivo .env.local"
  );
}

// Usar a URL de conexão do Supabase
const dbUrl = process.env.SUPABASE_DB_URL || '';

if (!dbUrl) {
  throw new Error(
    "SUPABASE_DB_URL não configurada. Verifique seu arquivo .env.local"
  );
}

const sql = postgres(dbUrl);
export const db = drizzle(sql, { schema });
export const pool = sql;

// Exportar o cliente Supabase para uso em outros lugares da aplicação
export { supabase };