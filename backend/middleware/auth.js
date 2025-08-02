import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

export function autenticar(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ erro: 'Token não fornecido' });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch {
    res.status(403).json({ erro: 'Token inválido ou expirado' });
  }
