import fetch from 'node-fetch';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// ✅ Resolve caminho do .env independente da pasta onde rodar
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '.env');

dotenv.config({ path: envPath });

const API_URL = "https://sap-backend-in48.onrender.com/pessoas";
const TOKEN = process.env.JWT_TOKEN; // 👉 Lê o token do .env

async function testarAPI() {
  try {
    console.log("🔄 Testando API:", API_URL);
    console.log("🔑 Usando token:", TOKEN ? "✅ Encontrado" : "❌ Não encontrado");

    const response = await fetch(API_URL, {
      headers: {
        "Authorization": `Bearer ${TOKEN}`
      }
    });

    if (!response.ok) {
      console.error(`❌ Erro HTTP ${response.status}: ${response.statusText}`);
      const erro = await response.text();
      console.error("Detalhes:", erro);
      return;
    }

    const data = await response.json();

    console.log("✅ Dados recebidos da API:");
    console.table(data.map(p => ({
      Código: p.scodape,
      Nome: p.snomape,
      Classe: p.sclsape
    })));

  } catch (err) {
    console.error("❌ Erro na requisição:", err.message);
  }
}

// ✅ Executa o teste
testarAPI();

// // ✅ Importa bibliotecas necessárias
// import fetch from 'node-fetch';
// import dotenv from 'dotenv';

// // ✅ Carrega variáveis do arquivo .env
// dotenv.config();

// const API_URL = "https://sap-backend-in48.onrender.com/pessoas";
// const TOKEN = process.env.JWT_TOKEN; // 👉 Lê o token do .env

// async function testarAPI() {
//   try {
//     console.log("🔄 Testando API:", API_URL);
//     console.log("🔑 Usando token:", TOKEN ? "✅ Encontrado" : "❌ Não encontrado");

//     const response = await fetch(API_URL, {
//       headers: {
//         "Authorization": `Bearer ${TOKEN}`
//       }
//     });

//     if (!response.ok) {
//       console.error(`❌ Erro HTTP ${response.status}: ${response.statusText}`);
//       const erro = await response.text();
//       console.error("Detalhes:", erro);
//       return;
//     }

//     const data = await response.json();

//     console.log("✅ Dados recebidos da API:");
//     console.table(data.map(p => ({
//   Código: p.scodape,
//   Nome: p.snomape,
//   Classe: p.sclsape
// })));


//   } catch (err) {
//     console.error("❌ Erro na requisição:", err.message);
//   }
// }

// // ✅ Executa o teste
// testarAPI();


