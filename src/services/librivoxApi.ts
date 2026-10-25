import { Book, SearchFilters } from '../types/audiobook';

// Clean text helper to strip any residual HTML markup safely
export function stripHtml(html: string = ''): string {
  if (!html) return '';
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
}

// Format duration in seconds to "Xh Ym" or "Ym Zs"
export function formatDuration(seconds: number | string | undefined): string {
  if (!seconds) return 'Duración no disp.';
  const sec = typeof seconds === 'string' ? parseInt(seconds, 10) : seconds;
  if (isNaN(sec) || sec <= 0) return 'Duración no disp.';

  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);

  if (h > 0) {
    return `${h}h ${m.toString().padStart(2, '0')}m`;
  }
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// Format time for audio player (00:00 or 0:00:00)
export function formatPlayerTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

// Get primary author string
export function getAuthorName(book: Book): string {
  if (!book.authors || book.authors.length === 0) return 'Autor Desconocido';
  const author = book.authors[0];
  const first = author.first_name ? author.first_name.trim() : '';
  const last = author.last_name ? author.last_name.trim() : '';
  if (first && last) return `${first} ${last}`;
  return last || first || 'Autor Desconocido';
}

// Get best available cover image for a book
export function getBookCover(book: Book): string {
  if (book.coverart_jpg) return book.coverart_jpg;
  if (book.coverart_thumbnail) return book.coverart_thumbnail;
  if (book.identifier) return `https://archive.org/services/img/${book.identifier}`;
  return '';
}

export const CURATED_FEATURED_BOOKS: Book[] = [
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
  },
];

// 1. Fetch Featured Books
export async function fetchFeaturedBooks(): Promise<Book[]> {
  try {
    const res = await fetch('/api/featured');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    }
  } catch (err) {
    console.warn('Failed to load featured from /api/featured, using static curated fallback:', err);
  }

  // Standalone / Netlify client-side fallback
  return CURATED_FEATURED_BOOKS;
}

// 2. Fetch Audiobooks from LibriVox Feed directly
export async function fetchAudiobooksFeed(
  options: {
    limit?: number;
    offset?: number;
    title?: string;
    author?: string;
    genre?: string;
  } = {}
): Promise<Book[]> {
  const params = new URLSearchParams();
  params.set('format', 'json');
  params.set('coverart', '1');
  params.set('limit', String(options.limit || 24));
  if (options.offset) params.set('offset', String(options.offset));
  if (options.title) params.set('title', options.title);
  if (options.author) params.set('author', options.author);
  if (options.genre) params.set('genre', options.genre);

  try {
    const res = await fetch(`/api/feed/audiobooks?${params.toString()}`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.books)) {
        return data.books;
      }
    }
  } catch (err) {
    console.error('Error fetching /api/feed/audiobooks:', err);
  }

  return [];
}

// 3. Search Audiobooks (smart multi-provider endpoint)
export async function searchAudiobooks(filters: SearchFilters): Promise<Book[]> {
  const q = filters.query.trim();
  if (!q) return [];

  const params = new URLSearchParams({
    q,
    type: filters.searchType,
    lang: filters.language,
    limit: '30',
  });

  try {
    const res = await fetch(`/api/search?${params.toString()}`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.books)) {
        return data.books;
      }
    }
  } catch (err) {
    console.error('Search request failed:', err);
  }

  // Fallback direct to Internet Archive if server is unreachable
  try {
    let iaQuery = `collection:(librivoxaudio) AND (${q})`;
    if (filters.language === 'Spanish') {
      iaQuery += ' AND (language:(Spanish) OR language:(spa))';
    } else if (filters.language === 'English') {
      iaQuery += ' AND (language:(English) OR language:(eng))';
    }

    const iaUrl = `https://archive.org/advancedsearch.php?q=${encodeURIComponent(
      iaQuery
    )}&fl[]=identifier,title,creator,description,year,downloads&sort[]=downloads+desc&rows=20&output=json`;

    const res = await fetch(iaUrl);
    if (res.ok) {
      const iaData = await res.json();
      const docs = iaData?.response?.docs || [];
      return docs.map((doc: any) => ({
        id: `ia_${doc.identifier}`,
        identifier: doc.identifier,
        title: doc.title || 'Audiolibro',
        description: stripHtml(doc.description || ''),
        language: filters.language === 'Spanish' ? 'Spanish' : 'Multilingual',
        copyright_year: doc.year ? String(doc.year) : undefined,
        num_sections: 1,
        authors: [
          {
            first_name: '',
            last_name: doc.creator || 'Autor Clásico',
          },
        ],
        coverart_jpg: `https://archive.org/services/img/${doc.identifier}`,
        coverart_thumbnail: `https://archive.org/services/img/${doc.identifier}`,
      }));
    }
  } catch (fallbackErr) {
    console.error('Archive search fallback failed:', fallbackErr);
  }

  return [];
}

// 4. Fetch Full Book Details with Sections / Chapters
export async function fetchBookDetails(bookId: string): Promise<Book | null> {
  try {
    const res = await fetch(`/api/book/${encodeURIComponent(bookId)}`);
    if (res.ok) {
      const book = await res.json();
      if (book && (book.id || book.title)) {
        return book;
      }
    }
  } catch (err) {
    console.warn(`Error fetching /api/book/${bookId}, trying direct Archive fallback:`, err);
  }

  // Direct Archive.org fallback (works 100% on static Netlify with CORS)
  try {
    const identifier = bookId.replace(/^ia_/, '');
    const metaResp = await fetch(`https://archive.org/metadata/${encodeURIComponent(identifier)}`);
    if (metaResp.ok) {
      const meta = await metaResp.json();
      const files: any[] = meta.files || [];
      const metadata = meta.metadata || {};

      const mp3Files = files.filter(
        (f: any) =>
          f.name &&
          f.name.endsWith('.mp3') &&
          !f.name.includes('_sample') &&
          (f.format?.includes('MP3') || f.format === 'VBR MP3' || f.format === '64Kbps MP3')
      );

      const trackMap = new Map<string, any>();
      for (const f of mp3Files) {
        const baseKey = f.track || f.title || f.name.replace(/_64kb\.mp3$/, '').replace(/\.mp3$/, '');
        if (!trackMap.has(baseKey) || f.format === '64Kbps MP3') {
          trackMap.set(baseKey, f);
        }
      }

      const selectedFiles = Array.from(trackMap.values());
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

        return {
          id: `${identifier}_sec_${idx + 1}`,
          section_number: String(idx + 1),
          title: stripHtml(f.title || `Capítulo ${idx + 1}`),
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

      return {
        id: bookId,
        identifier,
        title: metadata.title || identifier,
        description: stripHtml(metadata.description || ''),
        language: metadata.language || 'Español',
        copyright_year: metadata.year || metadata.date?.slice(0, 4),
        num_sections: sections.length,
        totaltime: hours > 0 ? `${hours}h ${mins}m` : `${mins}m`,
        totaltimesecs: totalSecs,
        authors: [{ first_name: firstName, last_name: lastName }],
        coverart_jpg: `https://archive.org/services/img/${identifier}`,
        coverart_thumbnail: `https://archive.org/services/img/${identifier}`,
        sections,
      };
    }
  } catch (archiveErr) {
    console.error('Archive metadata fallback failed:', archiveErr);
  }

  return null;
}
