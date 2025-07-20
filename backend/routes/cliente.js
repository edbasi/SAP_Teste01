// routes/cliente.js
import express from 'express';
import { supabase } from '../supabase.js';
import { criarPessoaCompleta } from '../services/pessoaService.js';

const router = express.Router();

// GET /Clientes
router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('vw_pessoa_completa')
    .select('*')
    .eq('descricao_tipo', 'Cliente');

  if (error) return res.status(500).json(error);
  res.json(data);
});

// GET /Clientes/:id
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from('vw_pessoa_completa')
    .select('*')
    .eq('id', id)
    .eq('descricao_tipo', 'Cliente')
    .single();

  if (error) return res.status(404).json({ error: 'Cliente não encontrado' });
  res.json(data);
});

// POST /Clientes
router.post('/', async (req, res) => {
  const resultado = await criarPessoaCompleta(req.body);
  if (resultado.error) return res.status(500).json(resultado.error);
  res.status(201).json(resultado.data);
});

// PUT /Clientes/:id
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { pessoa } = req.body;

  const { error } = await supabase
    .from('pessoa')
    .update(pessoa)
    .eq('id', id);

  if (error) return res.status(500).json(error);
  res.json({ message: 'Cliente atualizado com sucesso' });
});

// DELETE /Clientes/:id
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  const { error } = await supabase
    .from('pessoa')
    .delete()
    .eq('id', id);

  if (error) return res.status(500).json(error);
  res.json({ message: 'Cliente excluído com sucesso' });
});

export default router;
