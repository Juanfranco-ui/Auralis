import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { CURATED_FEATURED_BOOKS } from './src/services/librivoxApi';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// In-memory cache to prevent LibriVox rate-limiting and make search instantaneous
interface CacheItem {
  data: any;
  timestamp: number;
}
const cache = new Map<string, CacheItem>();
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

function getCached(key: string): any | null {
  const item = cache.get(key);
  if (!item) return null;
  if (Date.now() - item.timestamp > CACHE_TTL_MS) {
    cache.delete(key);
    return null;
  }
  return item.data;
}

function setCache(key: string, data: any) {
  if (cache.size > 200) {
    // Evict oldest
    const firstKey = cache.keys().next().value;
    if (firstKey) cache.delete(firstKey);
  }
  cache.set(key, { data, timestamp: Date.now() });
}

// 1. Direct LibriVox Feed Proxy (/api/feed/audiobooks)
// Forwards query parameters: title, author, genre, limit, offset, format=json, extended=1, coverart=1
app.get('/api/feed/audiobooks', async (req: Request, res: Response) => {
  try {
    const urlParams = new URLSearchParams();
    urlParams.set('format', 'json');

    for (const [key, val] of Object.entries(req.query)) {
      if (typeof val === 'string' && val.trim() !== '') {
        urlParams.set(key, val);
      }
    }

    if (!urlParams.has('coverart')) {
      urlParams.set('coverart', '1');
    }

    const cacheKey = `feed_${urlParams.toString()}`;
    const cached = getCached(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    const targetUrl = `https://librivox.org/api/feed/audiobooks/?${urlParams.toString()}`;
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'LibriVoxAudiobookApp/1.0 (educational/portfolio reader)',
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      return res.status(response.status).json({
        error: `LibriVox returned status ${response.status}`,
        books: [],
      });
    }

    const data = await response.json();
    setCache(cacheKey, data);
    res.json(data);
  } catch (err: any) {
    console.error('Error proxying LibriVox feed:', err.message);
    res.status(500).json({ error: 'Failed to fetch from LibriVox', books: [] });
  }
});

// Helper to sanitize HTML tags
function cleanText(html: string = ''): string {
  return html
    .replace(/<br\s*[\/]?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();
}

// 2. Comprehensive Search Endpoint (/api/search)
// Combines LibriVox API and Internet Archive LibriVox collection
app.get('/api/search', async (req: Request, res: Response) => {
  try {
    const q = ((req.query.q as string) || '').trim();
    const type = (req.query.type as string) || 'all'; // all, title, author
    const lang = (req.query.lang as string) || 'all'; // all, Spanish, English
    const limit = Math.min(Number(req.query.limit) || 24, 50);

    if (!q) {
      return res.json({ books: [], total: 0 });
    }

    const cacheKey = `search_${q}_${type}_${lang}_${limit}`;
    const cached = getCached(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    const results: any[] = [];
    const seenIds = new Set<string>();

    // Strategy 0: Instant curated match
    const qLower = q.toLowerCase();
    for (const b of CURATED_FEATURED_BOOKS) {
      if (lang === 'Spanish' && !b.language.toLowerCase().includes('span')) continue;
      if (lang === 'English' && b.language.toLowerCase().includes('span')) continue;

      const author = `${b.authors?.[0]?.first_name || ''} ${b.authors?.[0]?.last_name || ''}`.toLowerCase();
      const title = (b.title || '').toLowerCase();
      const desc = (b.description || '').toLowerCase();

      let matched = false;
      if (type === 'author') matched = author.includes(qLower);
      else if (type === 'title') matched = title.includes(qLower);
      else matched = title.includes(qLower) || author.includes(qLower) || desc.includes(qLower);

      if (matched) {
        seenIds.add(b.id);
        if (b.identifier) seenIds.add(b.identifier);
        results.push(b);
      }
    }

    // Strategy A: Query LibriVox API
    try {
      const lvParams = new URLSearchParams({
        format: 'json',
        coverart: '1',
        limit: String(limit),
      });

      if (type === 'author') {
        lvParams.set('author', q);
      } else if (type === 'title') {
        lvParams.set('title', `^${q}`);
      } else {
        // General search: try author and title
        lvParams.set('title', `^${q}`);
      }

      const lvUrl = `https://librivox.org/api/feed/audiobooks/?${lvParams.toString()}`;
      const lvResp = await fetch(lvUrl, {
        headers: { 'User-Agent': 'LibriVoxAudiobookApp/1.0' },
      });

      if (lvResp.ok) {
        const lvData = await lvResp.json();
        if (Array.isArray(lvData.books)) {
          for (const b of lvData.books) {
            if (lang !== 'all' && b.language && !b.language.toLowerCase().includes(lang.toLowerCase())) {
              continue;
            }
            if (!seenIds.has(String(b.id))) {
              seenIds.add(String(b.id));
              results.push(b);
            }
          }
        }
      }

      // If general search and fewer than 6 results, also try author on LibriVox
      if (type === 'all' && results.length < 6) {
        const lvAuthorUrl = `https://librivox.org/api/feed/audiobooks/?format=json&coverart=1&author=${encodeURIComponent(
          q
        )}&limit=10`;
        const authResp = await fetch(lvAuthorUrl, {
          headers: { 'User-Agent': 'LibriVoxAudiobookApp/1.0' },
        });
        if (authResp.ok) {
          const authData = await authResp.json();
          if (Array.isArray(authData.books)) {
            for (const b of authData.books) {
              if (lang !== 'all' && b.language && !b.language.toLowerCase().includes(lang.toLowerCase())) {
                continue;
              }
              if (!seenIds.has(String(b.id))) {
                seenIds.add(String(b.id));
                results.push(b);
              }
            }
          }
        }
      }
    } catch (e) {
      console.warn('LibriVox API search error:', e);
    }

    // Strategy B: Internet Archive LibriVox Collection Full-Text Search
    // Excellent for Spanish keywords, full text titles, and names
    try {
      let iaQuery = `collection:(librivoxaudio) AND (${q})`;
      if (lang === 'Spanish') {
        iaQuery += ' AND (language:(Spanish) OR language:(spa))';
      } else if (lang === 'English') {
        iaQuery += ' AND (language:(English) OR language:(eng))';
      }

      const iaUrl = `https://archive.org/advancedsearch.php?q=${encodeURIComponent(
        iaQuery
      )}&fl[]=identifier,title,creator,description,year,downloads,avg_rating,item_size&sort[]=downloads+desc&rows=${limit}&output=json`;

      const iaResp = await fetch(iaUrl);
      if (iaResp.ok) {
        const iaData = await iaResp.json();
        const docs = iaData?.response?.docs || [];

        for (const doc of docs) {
          const id = `ia_${doc.identifier}`;
          if (!seenIds.has(id) && !seenIds.has(doc.identifier)) {
            seenIds.add(id);

            // Clean author name
            const creator = doc.creator || 'Autor Clásico';
            const authorParts = creator.split(' ');
            const lastName = authorParts.pop() || creator;
            const firstName = authorParts.join(' ');

            results.push({
              id,
              identifier: doc.identifier,
              title: doc.title || 'Audiolibro Sin Título',
              description: cleanText(doc.description || 'Audiolibro de dominio público de la colección LibriVox.'),
              language: lang === 'Spanish' ? 'Spanish' : 'Multilingual',
              copyright_year: doc.year ? String(doc.year) : undefined,
              num_sections: 1, // Will be resolved dynamically on open
              authors: [
                {
                  id: '0',
                  first_name: firstName,
                  last_name: lastName,
                },
              ],
              coverart_jpg: `https://archive.org/services/img/${doc.identifier}`,
              coverart_thumbnail: `https://archive.org/services/img/${doc.identifier}`,
              url_project: `https://archive.org/details/${doc.identifier}`,
              totaltime: 'Completo',
            });
          }
        }
      }
    } catch (e) {
      console.warn('Internet Archive search error:', e);
    }

    const responsePayload = { books: results, total: results.length };
    setCache(cacheKey, responsePayload);
    res.json(responsePayload);
  } catch (err: any) {
    console.error('Search endpoint error:', err.message);
    res.status(500).json({ error: 'Search failed', books: [] });
  }
});

// Ensures any legacy or cached identifier redirects to the active, verified archive identifier
const IDENTIFIER_ALIASES: Record<string, string> = {
  'rimasyleyendas_1108_librivox': 'leyendas_becquer_1208_librivox',
  'ia_rimasyleyendas_1108_librivox': 'leyendas_becquer_1208_librivox',
  'metamorfosis_1303_librivox': 'lametamorfosis_2101_librivox',
  'ia_metamorfosis_1303_librivox': 'lametamorfosis_2101_librivox',
  'frankenstein_1818_1001_librivox': 'frankenstein_cs_librivox',
  'ia_frankenstein_1818_1001_librivox': 'frankenstein_cs_librivox',
  'timemachine_version2_librivox': 'time_machine_0805_librivox',
  'ia_timemachine_version2_librivox': 'time_machine_0805_librivox',
  'novelas_ejemplares_1407_librivox': 'novelas_ejemplares_1110_librivox',
  'ia_novelas_ejemplares_1407_librivox': 'novelas_ejemplares_1110_librivox',
  '271': 'dracula_librivox',
  '314': 'adventures_holmes',
  '47': 'count_monte_cristo_0711_librivox',
  '100': 'aventurasde_arturogordonpym_1812_librivox',
};

// 3. Extended Book Detail & Chapter Resolution (/api/book/:id)
app.get('/api/book/:id', async (req: Request, res: Response) => {
  try {
    const rawId = req.params.id;
    const bookId = IDENTIFIER_ALIASES[rawId] || rawId;
    const cacheKey = `book_detail_${bookId}`;
    const cached = getCached(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    // Check if it's an Internet Archive identifier (prefixed with ia_ or containing underscore)
    if (bookId.startsWith('ia_') || (!/^\d+$/.test(bookId) && bookId.includes('_'))) {
      const bareIdentifier = bookId.replace(/^ia_/, '');
      const identifier = IDENTIFIER_ALIASES[bareIdentifier] || bareIdentifier;
      const metaUrl = `https://archive.org/metadata/${encodeURIComponent(identifier)}`;
      const metaResp = await fetch(metaUrl);
      if (!metaResp.ok) {
        return res.status(404).json({ error: 'Libro no encontrado en Internet Archive' });
      }

      const meta = await metaResp.json();
      const files = meta.files || [];
      const metadata = meta.metadata || {};

      // Filter playable MP3 files, case-insensitive, exclude samples/thumbs
      const mp3Files = files.filter(
        (f: any) =>
          f.name &&
          f.name.toLowerCase().endsWith('.mp3') &&
          !f.name.toLowerCase().includes('_sample') &&
          !f.name.toLowerCase().includes('_thumb')
      );

      // Prefer 64kbps version if duplicates exist
      const trackMap = new Map<string, any>();
      for (const f of mp3Files) {
        const baseKey = f.name
          .replace(/_64kb\.mp3$/i, '')
          .replace(/_128kb\.mp3$/i, '')
          .replace(/\.mp3$/i, '');
        if (!trackMap.has(baseKey) || f.name.toLowerCase().includes('_64kb.mp3') || f.format === '64Kbps MP3') {
          trackMap.set(baseKey, f);
        }
      }

      const selectedFiles = Array.from(trackMap.values());
      // Sort by track or filename
      selectedFiles.sort((a, b) => {
        const trackA = parseInt(a.track || '0', 10);
        const trackB = parseInt(b.track || '0', 10);
        if (trackA && trackB && trackA !== trackB) return trackA - trackB;
        return a.name.localeCompare(b.name, undefined, { numeric: true });
      });

      const sections = selectedFiles.map((f: any, idx: number) => {
        let playtime = 0;
        if (f.length) {
          if (typeof f.length === 'string' && f.length.includes(':')) {
            const parts = f.length.split(':').map(Number);
            playtime = parts.length === 2 ? parts[0] * 60 + parts[1] : parts[0] * 3600 + parts[1] * 60 + parts[2];
          } else {
            playtime = Math.round(parseFloat(f.length) || 0);
          }
        }

        const title = f.title || `Capítulo ${idx + 1}`;
        return {
          id: `${identifier}_sec_${idx + 1}`,
          section_number: String(idx + 1),
          title: cleanText(title),
          listen_url: `https://archive.org/download/${identifier}/${encodeURIComponent(f.name)}`,
          playtime: String(playtime),
          file_name: f.name,
          readers: f.artist ? [{ reader_id: '1', display_name: f.artist }] : undefined,
        };
      });

      const creator = metadata.creator || 'Dominio Público';
      const authorParts = String(creator).split(' ');
      const lastName = authorParts.pop() || creator;
      const firstName = authorParts.join(' ');

      const totalSecs = sections.reduce((acc, s) => acc + (parseInt(String(s.playtime), 10) || 0), 0);
      const hours = Math.floor(totalSecs / 3600);
      const mins = Math.floor((totalSecs % 3600) / 60);
      const totaltime = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

      const book = {
        id: bookId,
        identifier,
        title: metadata.title || identifier,
        description: cleanText(metadata.description || ''),
        language: metadata.language || 'Español',
        copyright_year: metadata.year || metadata.date?.slice(0, 4),
        num_sections: sections.length,
        totaltime,
        totaltimesecs: totalSecs,
        authors: [{ first_name: firstName, last_name: lastName }],
        coverart_jpg: `https://archive.org/services/img/${identifier}`,
        coverart_thumbnail: `https://archive.org/services/img/${identifier}`,
        sections,
      };

      setCache(cacheKey, book);
      return res.json(book);
    }

    // LibriVox numeric ID
    const lvUrl = `https://librivox.org/api/feed/audiobooks/?id=${bookId}&format=json&extended=1&coverart=1`;
    const lvResp = await fetch(lvUrl, {
      headers: { 'User-Agent': 'LibriVoxAudiobookApp/1.0' },
    });

    if (!lvResp.ok) {
      return res.status(lvResp.status).json({ error: 'Libro no encontrado en LibriVox' });
    }

    const lvData = await lvResp.json();
    const book = lvData?.books?.[0];

    if (!book) {
      return res.status(404).json({ error: 'Libro no encontrado' });
    }

    // Clean description
    book.description = cleanText(book.description || '');

    // Ensure sections have valid direct MP3 URLs
    if (Array.isArray(book.sections)) {
      book.sections = book.sections.map((s: any, idx: number) => ({
        ...s,
        section_number: s.section_number || String(idx + 1),
        title: cleanText(s.title || `Capítulo ${idx + 1}`),
        // Ensure https
        listen_url: s.listen_url ? s.listen_url.replace(/^http:\/\//i, 'https://') : '',
      }));
    }

    setCache(cacheKey, book);
    res.json(book);
  } catch (err: any) {
    console.error('Error fetching book detail:', err.message);
    res.status(500).json({ error: 'Error al cargar detalles del audiolibro' });
  }
});

// 4. Featured & Curated Collections Endpoint (/api/featured)
app.get('/api/featured', async (_req: Request, res: Response) => {
  try {
    const cacheKey = 'featured_curated_v4';
    const cached = getCached(cacheKey);
    if (cached) {
      return res.json(cached);
    }
    setCache(cacheKey, CURATED_FEATURED_BOOKS);
    res.json(CURATED_FEATURED_BOOKS);
  } catch (err: any) {
    console.error('Featured list error:', err.message);
    res.status(500).json([]);
  }
});

// Vite Integration: Dev middleware or Production Static Serve
async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening at http://0.0.0.0:${PORT}`);
  });
}

start().catch((err) => {
  console.error('Server failed to start:', err);
  process.exit(1);
});
