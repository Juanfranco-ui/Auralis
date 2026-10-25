import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

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

// 3. Extended Book Detail & Chapter Resolution (/api/book/:id)
app.get('/api/book/:id', async (req: Request, res: Response) => {
  try {
    const bookId = req.params.id;
    const cacheKey = `book_detail_${bookId}`;
    const cached = getCached(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    // Check if it's an Internet Archive identifier (prefixed with ia_ or containing underscore)
    if (bookId.startsWith('ia_') || (!/^\d+$/.test(bookId) && bookId.includes('_'))) {
      const identifier = bookId.replace(/^ia_/, '');
      const metaUrl = `https://archive.org/metadata/${identifier}`;
      const metaResp = await fetch(metaUrl);
      if (!metaResp.ok) {
        return res.status(404).json({ error: 'Libro no encontrado en Internet Archive' });
      }

      const meta = await metaResp.json();
      const files = meta.files || [];
      const metadata = meta.metadata || {};

      // Filter playable MP3 files, prefer 64kbps or VBR MP3
      const mp3Files = files.filter(
        (f: any) =>
          f.name &&
          f.name.endsWith('.mp3') &&
          !f.name.includes('_sample') &&
          (f.format?.includes('MP3') || f.format === 'VBR MP3' || f.format === '64Kbps MP3')
      );

      // Prefer 64kbps version if duplicates exist
      const trackMap = new Map<string, any>();
      for (const f of mp3Files) {
        const baseKey = f.track || f.title || f.name.replace(/_64kb\.mp3$/, '').replace(/\.mp3$/, '');
        if (!trackMap.has(baseKey) || f.format === '64Kbps MP3') {
          trackMap.set(baseKey, f);
        }
      }

      const selectedFiles = Array.from(trackMap.values());
      // Sort by track or filename
      selectedFiles.sort((a, b) => {
        const trackA = parseInt(a.track || '0', 10);
        const trackB = parseInt(b.track || '0', 10);
        if (trackA && trackB) return trackA - trackB;
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
    const cacheKey = 'featured_curated_v1';
    const cached = getCached(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    // Curated high quality books with verified chapters and audio files
    const curatedList = [
      {
        id: 'ia_don_quijote_vol1_0706_librivox',
        identifier: 'don_quijote_vol1_0706_librivox',
        title: 'Don Quijote de la Mancha (Vol. 1)',
        authors: [{ first_name: 'Miguel de', last_name: 'Cervantes Saavedra' }],
        language: 'Spanish',
        num_sections: 37,
        totaltime: '18h 45m',
        copyright_year: '1605',
        description:
          'La obra cumbre de la literatura en español. Las hilarantes y conmovedoras aventuras del hidalgo Don Quijote y su fiel escudero Sancho Panza por las tierras de La Mancha.',
        coverart_jpg: 'https://archive.org/services/img/don_quijote_vol1_0706_librivox',
        coverart_thumbnail: 'https://archive.org/services/img/don_quijote_vol1_0706_librivox',
        category: 'spanish',
      },
      {
        id: '314',
        title: 'The Adventures of Sherlock Holmes',
        authors: [{ first_name: 'Sir Arthur Conan', last_name: 'Doyle' }],
        language: 'English',
        num_sections: 12,
        totaltime: '10h 18m',
        copyright_year: '1892',
        description:
          'Colección de doce historias inolvidables del legendario detective privado Sherlock Holmes y su compañero el Dr. John Watson resolviendo los crímenes más intrincados de Londres victoriano.',
        coverart_jpg: 'https://www.archive.org/download/LibrivoxCdCoverArt4/Adventures_of_Sherlock_Holmes_1003.jpg',
        coverart_thumbnail:
          'https://www.archive.org/download/LibrivoxCdCoverArt4/Adventures_of_Sherlock_Holmes_1003_thumb.jpg',
        category: 'classics',
      },
      {
        id: '271',
        title: 'Dracula',
        authors: [{ first_name: 'Bram', last_name: 'Stoker' }],
        language: 'English',
        num_sections: 27,
        totaltime: '16h 31m',
        copyright_year: '1897',
        description:
          'La historia clásica de vampiros de Bram Stoker: Jonathan Harker viaja al castillo de Transilvania y desata una lucha inmortal entre la luz y las sombras.',
        coverart_jpg: 'https://archive.org/download/dracula_librivox/Dracula_1108.jpg',
        coverart_thumbnail: 'https://archive.org/download/dracula_librivox/Dracula_1108_thumb.jpg',
        category: 'mystery',
      },
      {
        id: '47',
        title: 'The Count of Monte Cristo',
        authors: [{ first_name: 'Alexandre', last_name: 'Dumas' }],
        language: 'English',
        num_sections: 128,
        totaltime: '49h 43m',
        copyright_year: '1844',
        description:
          'Una de las mayores historias de traición, justicia, aventuras y venganza jamás escritas. Edmond Dantès escapa del Castillo de If para reclamar su destino.',
        coverart_jpg: 'https://archive.org/services/img/count_monte_cristo_0711_librivox',
        coverart_thumbnail: 'https://archive.org/services/img/count_monte_cristo_0711_librivox',
        category: 'adventure',
      },
      {
        id: 'ia_rimasyleyendas_1108_librivox',
        identifier: 'rimasyleyendas_1108_librivox',
        title: 'Rimas y Leyendas',
        authors: [{ first_name: 'Gustavo Adolfo', last_name: 'Bécquer' }],
        language: 'Spanish',
        num_sections: 24,
        totaltime: '5h 12m',
        copyright_year: '1871',
        description:
          'Las rimas poéticas y leyendas misteriosas y fantásticas del gran maestro del romanticismo español. El rayo de luna, Los ojos verdes y El monte de las ánimas.',
        coverart_jpg: 'https://archive.org/services/img/rimasyleyendas_1108_librivox',
        coverart_thumbnail: 'https://archive.org/services/img/rimasyleyendas_1108_librivox',
        category: 'spanish',
      },
      {
        id: '100',
        title: 'Narrative of Arthur Gordon Pym',
        authors: [{ first_name: 'Edgar Allan', last_name: 'Poe' }],
        language: 'English',
        num_sections: 27,
        totaltime: '6h 22m',
        copyright_year: '1838',
        description:
          'La única novela completa de Edgar Allan Poe: un joven polizón en un barco ballenero vive naufragios, motines y misterios en las aguas del Polo Sur.',
        coverart_jpg: 'https://www.archive.org/download/LibrivoxCdCoverArt10/Narrative_Arthur_Gordon_Pym_1108.jpg',
        coverart_thumbnail:
          'https://www.archive.org/download/LibrivoxCdCoverArt10/Narrative_Arthur_Gordon_Pym_1108_thumb.jpg',
        category: 'mystery',
      },
      {
        id: 'ia_metamorfosis_1303_librivox',
        identifier: 'metamorfosis_1303_librivox',
        title: 'La Metamorfosis',
        authors: [{ first_name: 'Franz', last_name: 'Kafka' }],
        language: 'Spanish',
        num_sections: 3,
        totaltime: '2h 15m',
        copyright_year: '1915',
        description:
          'Al despertar una mañana tras un sueño intranquilo, Gregorio Samsa se encontró sobre su cama convertido en un monstruoso insecto. Clásico universal del existencialismo.',
        coverart_jpg: 'https://archive.org/services/img/metamorfosis_1303_librivox',
        coverart_thumbnail: 'https://archive.org/services/img/metamorfosis_1303_librivox',
        category: 'spanish',
      },
      {
        id: 'ia_timemachine_version2_librivox',
        identifier: 'timemachine_version2_librivox',
        title: 'The Time Machine',
        authors: [{ first_name: 'H. G.', last_name: 'Wells' }],
        language: 'English',
        num_sections: 16,
        totaltime: '3h 48m',
        copyright_year: '1895',
        description:
          'La obra pionera de los viajes en el tiempo. Un científico victoriano viaja al año 802.701 d.C. y descubre las dos razas del futuro: los pacíficos Eloi y los siniestros Morlocks.',
        coverart_jpg: 'https://archive.org/services/img/timemachine_version2_librivox',
        coverart_thumbnail: 'https://archive.org/services/img/timemachine_version2_librivox',
        category: 'scifi',
      },
      {
        id: 'ia_novelas_ejemplares_1407_librivox',
        identifier: 'novelas_ejemplares_1407_librivox',
        title: 'Novelas Ejemplares',
        authors: [{ first_name: 'Miguel de', last_name: 'Cervantes' }],
        language: 'Spanish',
        num_sections: 15,
        totaltime: '12h 30m',
        copyright_year: '1613',
        description:
          'Doce novelas cortas escritas por Miguel de Cervantes: La gitanilla, Rinconete y Cortadillo, El licenciado Vidriera y El coloquio de los perros.',
        coverart_jpg: 'https://archive.org/services/img/novelas_ejemplares_1407_librivox',
        coverart_thumbnail: 'https://archive.org/services/img/novelas_ejemplares_1407_librivox',
        category: 'spanish',
      },
      {
        id: 'ia_frankenstein_1818_1001_librivox',
        identifier: 'frankenstein_1818_1001_librivox',
        title: 'Frankenstein, or The Modern Prometheus',
        authors: [{ first_name: 'Mary', last_name: 'Shelley' }],
        language: 'English',
        num_sections: 24,
        totaltime: '8h 20m',
        copyright_year: '1818',
        description:
          'Víctor Frankenstein desafía las leyes de la naturaleza y da vida a una criatura creada con fragmentos humanos. Una obra maestra gótica sobre la soledad y la creación.',
        coverart_jpg: 'https://archive.org/services/img/frankenstein_1818_1001_librivox',
        coverart_thumbnail: 'https://archive.org/services/img/frankenstein_1818_1001_librivox',
        category: 'classics',
      },
    ];

    setCache(cacheKey, curatedList);
    res.json(curatedList);
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
