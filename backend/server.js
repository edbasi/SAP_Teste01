import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { supabase } from './supabase.js';

// ✅ Rotas REST
import { execSync } from 'child_process';
import pessoaRoutes from './routes/pessoa.js';
import produtoRoutes from './routes/produto.js';
import authRoutes from './routes/auth.js'; // ✅ Rota de login

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// ✅ Rotas de autenticação
app.use('/auth', authRoutes);

// ✅ Rotas REST de negócio
app.use('/pessoas', pessoaRoutes);
app.use('/produtos', produtoRoutes);

// ✅ rota /versao que mostra o commit atual
app.get('/versao', (req, res) => {
  try {
    const hash = execSync('git rev-parse --short HEAD').toString().trim();
    res.send(`Versão atual do backend: ${hash}`);
  } catch (e) {
    res.status(500).send('Erro ao obter versão');
  }
});

// ✅ Endpoint direto para a view vwpessoa (além de /pessoas)
app.get('/vwpessoa', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('vwpessoa')
      .select('pi_id_pessoa,ps_cod_pessoa,ps_nom_pessoa,ps_doc_pessoa,ps_des_classe,ps_nom_banco,ps_tip_classe,pi_ind_classe');
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ mensagem: 'vwpessoa', erro: err.message });
  }
});

    // // GET by ID
    // router.get('/:id', async (req, res) => {
    //   const { id } = req.params;
    //   const { data, error } = await supabase
    //     .from('pessoa_view_completa')
    //     .select('*')
    //     .eq('id', id)
    //     .eq('descricao', tipoDescricao)
    //     .single();
    //   if (error) return res.status(404).json({ erro: error.message });
    //   res.json(data);
    // });

// ✅ Endpoint direto para a view vwproduto (além de /protutos)
app.get('/vwproduto', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('vwproduto')
      .select('*');
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ mensagem: 'vwproduto', erro: err.message });
  }
});

// ✅ Rota raiz para teste rápido
app.get('/', (_, res) => res.send('✅ API rodando com Supabase + JWT + Render!'));

app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));
