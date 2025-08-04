import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ✅ Resolve caminho do .env independente da pasta onde rodar
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '.env');

dotenv.config({ path: envPath });

const JWT_SECRET = process.env.JWT_SECRET || '';
if (!JWT_SECRET) {
  console.error('❌ ERRO: JWT_SECRET não definido no .env');
  process.exit(1);
}

// ✅ Define tempo de expiração (default: 1h ou argumento passado ex: node gerarToken.js 30m)
const expiresIn = process.argv[2] || '1h';

// ✅ Payload básico
const payload = {
  usuario: 'admin',
  role: 'admin'
};

// ✅ Gera o token
const token = jwt.sign(payload, JWT_SECRET, { expiresIn });

// ✅ Atualiza ou adiciona JWT_TOKEN no .env
let envContent = '';
if (fs.existsSync(envPath)) {
  envContent = fs.readFileSync(envPath, 'utf-8');
}

// Remove linha antiga de JWT_TOKEN, se existir
const regex = /^JWT_TOKEN=.*$/m;
if (regex.test(envContent)) {
  envContent = envContent.replace(regex, `JWT_TOKEN=${token}`);
} else {
  envContent += `\nJWT_TOKEN=${token}`;
}

// Salva no .env
fs.writeFileSync(envPath, envContent);
console.log(`✅ Novo token gerado e salvo no .env (JWT_TOKEN)`);
console.log(`🔑 Token: ${token}`);
console.log(`⏱️ Expira em: ${expiresIn}`);
