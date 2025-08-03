// backend/middleware/auth.js
import jwt from 'jsonwebtoken';

export function autenticar(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ erro: 'Token não fornecido' });
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET || 'MinhaChaveSuperSecreta123';

    // ✅ Verifica o token
    jwt.verify(token, secret, (err, decoded) => {
      if (err) return res.status(403).json({ erro: 'Token inválido' });

      // ✅ Adiciona os dados decodificados no request
      req.usuario = decoded;
      next();
    });
  } catch (e) {
    res.status(500).json({ erro: 'Erro na autenticação', detalhe: e.message });
  }
}
