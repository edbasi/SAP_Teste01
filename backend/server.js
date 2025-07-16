// Atualização do server.js para refletir nova estrutura da tabela "clientes"
import express from 'express';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// GET - Lista clientes com filtros
app.get('/clientes', async (req, res) => {
  const { ativo, limite, offset, ordem, nome } = req.query;

  let query = supabase.from('clientes').select('*');

  if (ativo !== undefined) query = query.eq('ativo', ativo === 'true');
  if (nome) query = query.ilike('nome', `%${nome}%`);

  const lim = parseInt(limite) || 10;
  const off = parseInt(offset) || 0;
  query = query.range(off, off + lim - 1);

  if (ordem) {
    const [coluna, direcao] = ordem.split(':');
    if (coluna && direcao)
      query = query.order(coluna, { ascending: direcao.toLowerCase() !== 'desc' });
  } else {
    query = query.order('nome', { ascending: true });
  }

  const { data, error } = await query;
  if (error) return res.status(500).json({ erro: 'Erro ao buscar clientes', detalhes: error.message });
  res.json(data);
});

// POST - Cria novo cliente
app.post('/clientes', async (req, res) => {
  const { codigo, nome, docto, ativo } = req.body;

  if (!nome) return res.status(400).json({ error: 'Nome é obrigatório.' });

  try {
    const { data, error } = await supabase
      .from('clientes')
      .insert([{ codigo, nome, docto, ativo }])
      .select();

    if (error) throw error;

    res.status(201).json(data[0]);
  } catch (err) {
    console.error('Erro ao cadastrar cliente:', err.message || err);
    if (err.response) {
      console.error('Detalhes do erro:', err.response.data);
    }
    res.status(500).json({ error: 'Erro ao cadastrar cliente.', detalhes: err.message || err });
  }
});

// PUT - Atualiza cliente
app.put('/clientes/:id', async (req, res) => {
  const { id } = req.params;
  const { codigo, nome, docto, ativo } = req.body;

  try {
    const { data, error } = await supabase
      .from('clientes')
      .update({ codigo, nome, docto, ativo })
      .eq('id', id)
      .select();

    if (error) throw error;

    res.json(data[0]);
  } catch (err) {
    console.error('Erro ao atualizar cliente:', err);
    res.status(500).json({ error: 'Erro ao atualizar cliente' });
  }
});

// DELETE - Exclui cliente
app.delete('/clientes/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const { error } = await supabase
      .from('clientes')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.status(204).send();
  } catch (err) {
    console.error('Erro ao excluir cliente:', err);
    res.status(500).json({ error: 'Erro ao excluir cliente' });
  }
});

// Endpoint de teste SAP
app.get('/sap/business-partners', async (req, res) => {
  try {
    const response = await fetch('https://sandbox.api.sap.com/s4hanacloud/sap/opu/odata/sap/API_BUSINESS_PARTNER/A_BusinessPartner?$top=5&$format=json', {
      headers: { 'APIKey': process.env.SAP_API_KEY }
    });
    const data = await response.json();
    res.json(data.d.results);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao acessar SAP' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Servidor rodando em http://sandbox.api.sap.com:${PORT}`);
});
