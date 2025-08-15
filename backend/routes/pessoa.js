import express from 'express';
import { supabase } from '../supabase.js';
import { autenticar } from '../middleware/auth.js';

const router = express.Router();

// GET /pessoas — listar todas
router.get('/', autenticar, async (req, res) => {
  const { data, error } = await supabase.from('vwpessoa').select('*');
  if (error) return res.status(500).json({ erro: error.message });
  res.json(data);
});



// GET /pessoas/:id — obter uma pessoa
router.get('/:id', autenticar, async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from('vwpessoa')
    .select('*')
    .eq('pi_id_pessoa', id)
    .single();

  if (error) return res.status(404).json({ erro: 'Pessoa não encontrada' });
  res.json(data);
});

// POST - Criar nova pessoa completa
router.post('/', autenticar, async (req, res) => {
  const payload = req.body;

  const { data, error } = await supabase
    .rpc('inserir_pessoa_completa', payload);

  if (error) {
    console.error('Erro ao inserir pessoa completa:', error.message);
    return res.status(500).json({ error: error.message });
  }

  return res.status(201).json({ success: true });
});

// PUT - Atualizar pessoa completa (reutiliza mesma função com idempotência do lado do SQL)
router.put('/:id', autenticar, async (req, res) => {
  const payload = req.body;

  const { data, error } = await supabase
    .rpc('inserir_pessoa_completa', payload);

  if (error) {
    console.error('Erro ao atualizar pessoa completa:', error.message);
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ success: true });
});


// DELETE /pessoas/:id — deletar pessoa
router.delete('/:id', autenticar, async (req, res) => {
  const { id } = req.params;

  const { error } = await supabase
    .from('pessoa')
    .delete()
    .eq('pi_id_pessoa', id);

  if (error) return res.status(500).json({ erro: error.message });

  res.json({ sucesso: true });
});

export default router;
