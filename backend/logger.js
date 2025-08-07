// logger.js

import fs from 'fs';
import path from 'path';

// Caminho fixo
const logDir = 'C:\\FlexSoft';
const logPath = path.join(logDir, 'LogWbe.txt');

// Cria diretório se não existir
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const logStream = fs.createWriteStream(logPath, { flags: 'a' });

function log(...args) {
  const timestamp = new Date().toISOString();
  const message = args.map(arg =>
    typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
  ).join(' ');
  const fullMessage = `[${timestamp}] ${message}`;

  console.log(fullMessage);
  logStream.write(fullMessage + '\n');
}

function error(...args) {
  const timestamp = new Date().toISOString();
  const message = args.map(arg =>
    typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
  ).join(' ');
  const fullMessage = `[${timestamp}] [ERRO] ${message}`;

  console.error(fullMessage);
  logStream.write(fullMessage + '\n');
}

export { log, error };
