import express from 'express';
import { supabase } from '../supabase.js';

const router = express.Router();

// 🔍 GET: Retorna todas as pessoas (VIEW)
router.get('/', async (req, res) => {
  const { data, error } = await supabase.from('vw_pessoa').select('*');

  if (error) return res.status(500).json({ erro: error.message });
  res.json(data);
});

// 🔍 GET: Pessoa por ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from('vw_pessoa')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return res.status(404).json({ erro: 'Pessoa não encontrada' });
  res.json(data);
});

export default router;
