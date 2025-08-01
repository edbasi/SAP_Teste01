// backend/supabase.js
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// ✅ Garantir que variáveis do .env sejam carregadas
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Erro: SUPABASE_URL ou SUPABASE_KEY não estão definidas no .env');
  process.exit(1); // Encerra a aplicação se as chaves não estiverem setadas
}
_______________________________________
