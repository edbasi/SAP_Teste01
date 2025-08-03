const fetch = require('node-fetch');

const API_URL = 'https://sap-backend-in48.onrender.com/pessoas';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c3VhcmlvIjoiYWRtaW4iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NTQxOTA4MjgsImV4cCI6MTc1NDE5NDQyOH0.5su5FCjCYolvwTAUe9Ge6udtzAss3B9RCDlHta7l87Q'; // substitua pelo seu token JWT gerado

async function testarPessoas() {
  try {
    const res = await fetch(API_URL, {
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    if (!res.ok) {
      console.error('Erro na requisição:', res.status, res.statusText);
      return;
    }

    const data = await res.json();
    console.log('Resposta da API /pessoas:', data);
  } catch (err) {
    console.error('Erro:', err.message);
  }
}

testarPessoas();
