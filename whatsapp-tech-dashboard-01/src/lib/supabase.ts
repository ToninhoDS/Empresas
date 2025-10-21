
import { createClient } from '@supabase/supabase-js'

// Recupera os valores das variáveis de ambiente
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Cria um objeto que será exportado
let supabase: ReturnType<typeof createClient>;

// Verifica se as variáveis necessárias estão disponíveis
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('As variáveis de ambiente do Supabase não estão configuradas corretamente.');
  console.info('Por favor, configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.');
  
  // Cria um cliente mock com métodos vazios para evitar erros de runtime
  supabase = {
    from: () => ({
      select: () => ({ data: null, error: new Error('Supabase não inicializado') }),
      insert: () => ({ data: null, error: new Error('Supabase não inicializado') }),
      update: () => ({ data: null, error: new Error('Supabase não inicializado') }),
      delete: () => ({ data: null, error: new Error('Supabase não inicializado') }),
      eq: () => ({ data: null, error: new Error('Supabase não inicializado') }),
    }),
    auth: {
      signInWithPassword: () => Promise.resolve({ data: { user: null }, error: new Error('Supabase não inicializado') }),
      signUp: () => Promise.resolve({ data: { user: null }, error: new Error('Supabase não inicializado') }),
      signOut: () => Promise.resolve({ error: null }),
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
    },
    rpc: () => Promise.resolve({ data: null, error: new Error('Supabase não inicializado') }),
    channel: () => ({
      on: () => ({ subscribe: () => ({ unsubscribe: () => {} }) }),
    }),
  } as any;
} else {
  // Se as variáveis estão presentes, criar o cliente real
  supabase = createClient(supabaseUrl, supabaseAnonKey);
}

export { supabase };
