import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { supabase } from '../supabase.js';
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();

// 🔑 Rota de login
router.post('/login', async (req, res) => {
  const { email, senha } = req.body;

  const { data: usuario, error } = await supabase
    .from('usuarios')
    .select('*')
    .eq('email', email)
    .single();

  if (error || !usuario) return res.status(401).json({ erro: 'Usuário inválido' });

  const senhaOk = await bcrypt.compare(senha, usuario.senha_hash);
  if (!senhaOk) return res.status(401).json({ erro: 'Senha incorreta' });

  const token = jwt.sign(
    { id: usuario.id, email: usuario.email },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  res.json({ token });
});

export default router;
