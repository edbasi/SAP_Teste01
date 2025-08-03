// gerarToken.js
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// ✅ Pegamos o tempo de expiração da linha de comando (default = 1h)
const tempoExp = process.argv[2] || '1h';

// ✅ Payload básico (você pode editar conforme quiser)
const payload = {
  usuario: 'admin',
  role: 'admin'
};

// ✅ Gera o token com expiração customizável
const token = jwt.sign(payload, process.env.JWT_SECRET, {
  expiresIn: tempoExp   // 👈 define o tempo de expiração
});

console.log('✅ Token JWT gerado com sucesso!');
console.log('Tempo de expiração:', tempoExp);
console.log('Token:\n');
console.log(token);
