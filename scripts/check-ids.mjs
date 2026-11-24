import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const apiFilePath = path.resolve(__dirname, '../src/services/librivoxApi.ts');
const content = fs.readFileSync(apiFilePath, 'utf-8');

const startMarker = 'export const CURATED_FEATURED_BOOKS';
const endMarker = '];';
const startIndex = content.indexOf(startMarker);
if (startIndex === -1) {
  console.error('No se encontró CURATED_FEATURED_BOOKS en', apiFilePath);
  process.exit(1);
}
const endIndex = content.indexOf(endMarker, startIndex);
const curatedBlock = content.slice(startIndex, endIndex);

const regex = /id:\s*['"]([^'"]+)['"],\s*identifier:\s*['"]([^'"]+)['"],\s*title:\s*['"]([^'"]+)['"]/g;
let match;
const books = [];
while ((match = regex.exec(curatedBlock)) !== null) {
  books.push({
    id: match[1],
    identifier: match[2],
    title: match[3],
  });
}

console.log(`Diagnóstico de ${books.length} libros curados en archive.org...\n`);

async function checkIdentifier(book) {
  const url = `https://archive.org/metadata/${encodeURIComponent(book.identifier)}`;
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'Auralis-Identifier-Checker/1.0' } });
    if (!res.ok) {
      return {
        ...book,
        status: 'HTTP_ERROR',
        details: `HTTP ${res.status}: ${res.statusText}`,
      };
    }
    const data = await res.json();
    if (!data || Object.keys(data).length === 0 || !data.metadata) {
      return {
        ...book,
        status: 'NOT_FOUND',
        details: 'API retornó {} (identificador inexistente)',
      };
    }

    const files = data.files || [];
    const mp3Files = files.filter(
      (f) =>
        (f.name && f.name.toLowerCase().endsWith('.mp3')) ||
        (f.format && f.format.toLowerCase().includes('mp3'))
    );

    if (mp3Files.length === 0) {
      return {
        ...book,
        status: 'NO_MP3',
        details: `Existe (${files.length} archivos), pero no contiene ningún archivo .mp3`,
      };
    }

    return {
      ...book,
      status: 'OK',
      mp3Count: mp3Files.length,
      details: `${mp3Files.length} archivos mp3 disponibles`,
    };
  } catch (err) {
    return {
      ...book,
      status: 'NETWORK_ERROR',
      details: err.message,
    };
  }
}

// Concurrency pool
async function mapConcurrent(items, limit, fn) {
  const results = [];
  const executing = [];
  for (const item of items) {
    const p = Promise.resolve().then(() => fn(item));
    results.push(p);
    if (limit <= items.length) {
      const e = p.then(() => executing.splice(executing.indexOf(e), 1));
      executing.push(e);
      if (executing.length >= limit) {
        await Promise.race(executing);
      }
    }
  }
  return Promise.all(results);
}

const results = await mapConcurrent(books, 5, checkIdentifier);

const notFound = results.filter((r) => r.status === 'NOT_FOUND');
const noMp3 = results.filter((r) => r.status === 'NO_MP3');
const errors = results.filter((r) => r.status === 'HTTP_ERROR' || r.status === 'NETWORK_ERROR');
const ok = results.filter((r) => r.status === 'OK');

console.log('----------------------------------------------------');
console.log(`TOTAL LIBROS ANALIZADOS: ${results.length}`);
console.log(`✓ VÁLIDOS (con MP3): ${ok.length}`);
console.log(`✗ NO EXISTEN EN ARCHIVE.ORG: ${notFound.length}`);
console.log(`✗ SIN ARCHIVOS MP3: ${noMp3.length}`);
console.log(`! ERRORES DE RED / HTTP: ${errors.length}`);
console.log('----------------------------------------------------\n');

if (notFound.length > 0) {
  console.log('=== IDENTIFICADORES QUE NO EXISTEN ({}) ===');
  for (const item of notFound) {
    console.log(`- [${item.identifier}] "${item.title}" (id: ${item.id})`);
  }
  console.log('');
}

if (noMp3.length > 0) {
  console.log('=== IDENTIFICADORES SIN ARCHIVOS MP3 ===');
  for (const item of noMp3) {
    console.log(`- [${item.identifier}] "${item.title}" (id: ${item.id}) - ${item.details}`);
  }
  console.log('');
}

if (errors.length > 0) {
  console.log('=== ERRORES AL CONSULTAR ===');
  for (const item of errors) {
    console.log(`- [${item.identifier}] "${item.title}": ${item.details}`);
  }
  console.log('');
}

if (notFound.length === 0 && noMp3.length === 0 && errors.length === 0) {
  console.log('Todos los identificadores de CURATED_FEATURED_BOOKS son válidos y contienen MP3s.');
}
