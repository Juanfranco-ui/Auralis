export interface Author {
  id?: string;
  first_name: string;
  last_name: string;
  dob?: string;
  dod?: string;
}

export interface SectionReader {
  reader_id: string;
  display_name: string;
}

export interface Section {
  id: string;
  section_number: string;
  title: string;
  listen_url: string;
  language?: string;
  playtime: string | number;
  file_name?: string | null;
  readers?: SectionReader[];
}

export interface Genre {
  id: string;
  name: string;
}

export interface Book {
  id: string;
  title: string;
  description: string;
  url_text_source?: string;
  language: string;
  copyright_year?: string;
  num_sections: string | number;
  url_rss?: string;
  url_zip_file?: string;
  url_project?: string;
  url_librivox?: string;
  totaltime?: string;
  totaltimesecs?: number;
  authors: Author[];
  sections?: Section[];
  genres?: Genre[];
  coverart_jpg?: string;
  coverart_thumbnail?: string;
  coverart_pdf?: string;
  identifier?: string;
  category?: string;
}

export interface Bookmark {
  id: string;
  bookId: string;
  bookTitle: string;
  coverUrl?: string;
  sectionIndex: number;
  sectionTitle: string;
  timestamp: number;
  note: string;
  createdAt: number;
}

export interface HistoryItem {
  book: Book;
  currentSectionIndex: number;
  currentTime: number;
  duration: number;
  lastPlayedAt: number;
  completedPercentage: number;
}

export type SleepTimerOption = 0 | 5 | 15 | 30 | 45 | 60 | 'end_of_chapter';

export type ActiveTab = 'explore' | 'search' | 'library';

export interface SearchFilters {
  query: string;
  searchType: 'all' | 'title' | 'author';
  language: 'all' | 'Spanish' | 'English';
  genre?: string;
}
