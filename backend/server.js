import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { supabase } from './supabase.js';

// ✅ Rotas REST
import clienteRoutes from './routes/cliente.js';
import fornecedorRoutes from './routes/fornecedor.js';
import operadorRoutes from './routes/operador.js';
import bancoRoutes from './routes/banco.js';
import limpezaRoutes from './routes/limpeza.js';
import pessoaRoutes from './routes/pessoa.js';
import authRoutes from './routes/auth.js'; // ✅ Rota de login

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// ✅ Rotas de autenticação
app.use('/auth', authRoutes);

// ✅ Rotas REST de negócio
app.use('/clientes', clienteRoutes);
app.use('/fornecedores', fornecedorRoutes);
app.use('/operadores', operadorRoutes);
app.use('/bancos', bancoRoutes);
app.use('/limpezas', limpezaRoutes);
app.use('/pessoas', pessoaRoutes);

// ✅ Endpoint direto para a view vw_pessoa (além de /pessoas)
app.get('/VwPessoa', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('vwpessoa')
      .select('*');

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ mensagem: 'aaaaaa', erro: err.message });
  }
});

// ✅ Rota raiz para teste rápido
app.get('/', (_, res) => res.send('✅ API rodando com Supabase + JWT + Render!'));

app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));
