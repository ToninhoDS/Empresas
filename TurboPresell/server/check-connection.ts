import { db, supabase } from './db';
import { sql } from 'drizzle-orm';

async function checkConnection() {
  console.log('Verificando conexão com o Supabase...');
  
  try {
    // Verificar conexão com o Supabase
    const { data: supabaseData, error: supabaseError } = await supabase.from('users').select('count').limit(1);
    
    if (supabaseError) {
      throw new Error(`Erro na conexão com Supabase: ${supabaseError.message}`);
    }
    
    console.log('✅ Conexão com o Supabase estabelecida com sucesso!');
    
    // Verificar conexão com o banco de dados PostgreSQL via Drizzle
    console.log('\nVerificando conexão com o banco de dados PostgreSQL via Drizzle...');
    const result = await db.execute(sql`SELECT version();`);
    console.log('✅ Conexão com o banco de dados estabelecida com sucesso!');
    console.log('Versão do PostgreSQL:', result[0].version);
    
    // Verificar tabelas existentes
    console.log('\nVerificando tabelas existentes...');
    const tables = await db.execute(sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    if (tables.length === 0) {
      console.log('Nenhuma tabela encontrada. Execute npm run db:push para criar as tabelas.');
    } else {
      console.log('Tabelas encontradas:');
      tables.forEach((row: any, index: number) => {
        console.log(`${index + 1}. ${row.table_name}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erro ao conectar ao banco de dados:', error);
    console.log('\nVerifique se:');
    console.log('1. As variáveis de ambiente do Supabase estão configuradas corretamente no arquivo .env.local');
    console.log('2. SUPABASE_URL, SUPABASE_ANON_KEY e SUPABASE_DB_URL estão definidos corretamente');
    console.log('3. Você tem acesso ao projeto Supabase e as credenciais estão corretas');
  }
}

// Executar a verificação
checkConnection().catch(console.error).finally(() => process.exit());