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
    console.warn('Failed to load featured from /api/featured, trying fallback:', err);
  }

  // Client-side fallback if server is starting or standalone
  return [];
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
    console.error(`Error fetching book detail for ${bookId}:`, err);
  }

  return null;
}
