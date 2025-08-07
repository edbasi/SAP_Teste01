import jwt from 'jsonwebtoken';

// Token gerado no Delphi
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c3VhcmlvIjoiYWRtaW4iLCJyb2xlIjoiYWRtaW4iLCJleHAiOjE3NTQzMTIzMDYsImlhdCI6MTc1NDMwODcwNn0.Wm1DTWZxNWtXNGZxZHc0TGNvWXNtbVRPWEpjWWdXSFk1WVNqMEN2UnhfYw';

// Chave secreta usada no Delphi
const secret = 'MinhaChaveSuperSecreta123';

try {
  const decoded = jwt.verify(token, secret, { algorithms: ['HS256'] });
  console.log('✅ Token VÁLIDO!');
  console.log('Conteúdo decodificado:', decoded);
} catch (err) {
  console.error('❌ Token INVÁLIDO!');
  console.error('Erro:', err.message);
}
