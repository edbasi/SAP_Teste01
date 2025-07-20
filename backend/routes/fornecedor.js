const express = require('express');
const router = express.Router();
const supabase = require('../db');
const { criarPessoaCompleta } = require('../services/pessoaService');

// GET /fornecedores
router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('vw_pessoa_completa')
    .select('*')
    .eq('descricao_tipo', 'Fornecedor');

  if (error) return res.status(500).json(error);
  res.json(data);
});

// GET /fornecedores/:id
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from('vw_pessoa_completa')
    .select('*')
    .eq('id', id)
    .eq('descricao_tipo', 'Fornecedor')
    .single();

  if (error) return res.status(404).json({ error: 'Fornecedor não encontrado' });
  res.json(data);
});

// POST /fornecedores
router.post('/', async (req, res) => {
  const resultado = await criarPessoaCompleta(req.body);
  if (resultado.error) return res.status(500).json(resultado.error);
  res.status(201).json(resultado.data);
});

// PUT /fornecedores/:id
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { pessoa } = req.body;

  const { error } = await supabase
    .from('pessoa')
    .update(pessoa)
    .eq('id', id);

  if (error) return res.status(500).json(error);
  res.json({ message: 'Fornecedor atualizado com sucesso' });
});

// DELETE /fornecedores/:id
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  const { error } = await supabase
    .from('pessoa')
    .delete()
    .eq('id', id);

  if (error) return res.status(500).json(error);
  res.json({ message: 'Fornecedor excluído com sucesso' });
});

module.exports = router;
