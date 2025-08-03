import express from 'express';
import { supabase } from '../supabase.js';
import { autenticar } from '../auth.js';

const router = express.Router();

router.get('/', autenticar, async (req, res) => {
  const { data, error } = await supabase.from('vwpessoa').select('*');
  if (error) return res.status(500).json({ erro: error.message });
  res.json(data);
});

router.get('/:id', autenticar, async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from('vwpessoa')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return res.status(404).json({ erro: 'Pessoa não encontrada' });
  res.json(data);
});

export default router;
