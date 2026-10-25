import React, { useState, useEffect } from 'react';
import {
  AudioPlayerProvider,
  useAudioPlayer,
} from './context/AudioPlayerContext';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { SearchBar } from './components/SearchBar';
import { BookCard } from './components/BookCard';
import { BookDetailModal } from './components/BookDetailModal';
import { PlayerBar } from './components/PlayerBar';
import { ExpandedPlayerModal } from './components/ExpandedPlayerModal';
import { LibraryView } from './components/LibraryView';
import { AboutModal } from './components/AboutModal';
import { AuralisLogo } from './components/AuralisLogo';
import {
  Book,
  ActiveTab,
  SearchFilters,
} from './types/audiobook';
import {
  fetchFeaturedBooks,
  fetchAudiobooksFeed,
  searchAudiobooks,
} from './services/librivoxApi';
import {
  Sparkles,
  Compass,
  Loader2,
  Search as SearchIcon,
} from 'lucide-react';

const MainContent: React.FC = () => {
  const { currentBook, selectedBookForDetail, closeBookDetail, openBookDetail } =
    useAudioPlayer();

  const [activeTab, setActiveTab] = useState<ActiveTab>('explore');
  const [aboutModalOpen, setAboutModalOpen] = useState(false);

  // Explore state
  const [featuredBooks, setFeaturedBooks] = useState<Book[]>([]);
  const [feedBooks, setFeedBooks] = useState<Book[]>([]);
  const [loadingExplore, setLoadingExplore] = useState(true);
  const [exploreCategory, setExploreCategory] = useState<string>('all');

  // Search state
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    query: '',
    searchType: 'all',
    language: 'all',
  });
  const [searchResults, setSearchResults] = useState<Book[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Load initial explore data
  useEffect(() => {
    let isMounted = true;
    async function loadInitial() {
      setLoadingExplore(true);
      try {
        const [featured, feed] = await Promise.all([
          fetchFeaturedBooks(),
          fetchAudiobooksFeed({ limit: 12 }),
        ]);

        if (isMounted) {
          setFeaturedBooks(featured);
          setFeedBooks(feed);
        }
      } catch (err) {
        console.error('Error loading initial audiobooks:', err);
      } finally {
        if (isMounted) setLoadingExplore(false);
      }
    }
    loadInitial();
    return () => {
      isMounted = false;
    };
  }, []);

  // Execute Search
  const handlePerformSearch = async (filters: SearchFilters) => {
    setSearchFilters(filters);
    if (!filters.query.trim()) {
      setSearchResults([]);
      setHasSearched(false);
      return;
    }

    setIsSearching(true);
    setHasSearched(true);
    try {
      const results = await searchAudiobooks(filters);
      setSearchResults(results);
    } catch (err) {
      console.error('Search error:', err);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleHeroSearchClick = () => {
    setActiveTab('search');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleExploreGenre = (genre: string) => {
    if (genre === 'Spanish') {
      setExploreCategory('spanish');
      setActiveTab('explore');
    } else {
      setActiveTab('search');
      handlePerformSearch({
        query: genre,
        searchType: 'all',
        language: 'all',
      });
    }
  };

  // Filter explore books by category
  const filteredFeaturedBooks = featuredBooks.filter((book) => {
    if (exploreCategory === 'all') return true;
    if (exploreCategory === 'spanish') {
      return (
        book.language?.toLowerCase().includes('span') ||
        (book as any).category === 'spanish'
      );
    }
    if (exploreCategory === 'mystery') {
      return (book as any).category === 'mystery';
    }
    if (exploreCategory === 'scifi') {
      return (book as any).category === 'scifi';
    }
    if (exploreCategory === 'adventure') {
      return (book as any).category === 'adventure';
    }
    if (exploreCategory === 'classics') {
      return (book as any).category === 'classics';
    }
    return true;
  });

  return (
    <div className={`min-h-screen flex flex-col relative bg-[#0c0a09] ${currentBook ? 'pb-28' : 'pb-12'}`}>
      {/* Film grain overlay (Awwwards-mcp signature texture) */}
      <div className="grain" aria-hidden="true" />

      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAbout={() => setAboutModalOpen(true)}
      />

      {/* Main View Switcher */}
      <main className="flex-1 relative z-10">
        {/* VIEW 1: EXPLORE */}
        {activeTab === 'explore' && (
          <div className="space-y-16">
            {/* Hero Section */}
            <HeroSection
              onSearchClick={handleHeroSearchClick}
              onExploreGenre={handleExploreGenre}
            />

            {/* Editorial Statement Strip */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="p-8 sm:p-10 bg-[#12100e] border border-stone-800 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="max-w-2xl space-y-2">
                  <div className="text-[10px] font-mono tracking-[0.28em] text-[#FF9398] uppercase">
                    EDITORIAL &middot; PROYECTO ABIERTO
                  </div>
                  <p className="text-base sm:text-lg font-serif font-light text-stone-200 leading-relaxed">
                    «Las voces de miles de lectores alrededor del mundo convierten los textos silenciosos de Gutenberg en memorias sonoras imperecederas.»
                  </p>
                </div>
                <div className="shrink-0">
                  <button
                    onClick={() => setActiveTab('search')}
                    className="pill-btn coral text-xs cursor-pointer"
                  >
                    <span>Consultar Todo el Archivo</span>
                    <span className="arr">&rarr;</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Featured Catalog Area */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-stone-800 pb-5">
                <div>
                  <div className="flex items-center gap-2 text-[10px] font-mono text-[#FF9398] uppercase tracking-[0.24em]">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Selección de la Redacción</span>
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-serif font-light text-stone-100 mt-1">
                    Clásicos Imprescindibles
                  </h2>
                </div>

                {/* Category Filter Tabs */}
                <div className="flex items-center gap-1.5 p-1 bg-[#12100e] border border-stone-800 rounded-2xl overflow-x-auto text-xs font-mono self-start sm:self-auto">
                  <button
                    onClick={() => setExploreCategory('all')}
                    className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                      exploreCategory === 'all'
                        ? 'bg-[#FF9398] text-stone-950 font-bold shadow-md'
                        : 'text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    Todos
                  </button>
                  <button
                    onClick={() => setExploreCategory('spanish')}
                    className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                      exploreCategory === 'spanish'
                        ? 'bg-[#FF9398] text-stone-950 font-bold shadow-md'
                        : 'text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    En Español
                  </button>
                  <button
                    onClick={() => setExploreCategory('classics')}
                    className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                      exploreCategory === 'classics'
                        ? 'bg-[#FF9398] text-stone-950 font-bold shadow-md'
                        : 'text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    Universales
                  </button>
                  <button
                    onClick={() => setExploreCategory('mystery')}
                    className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                      exploreCategory === 'mystery'
                        ? 'bg-[#FF9398] text-stone-950 font-bold shadow-md'
                        : 'text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    Misterio
                  </button>
                  <button
                    onClick={() => setExploreCategory('scifi')}
                    className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                      exploreCategory === 'scifi'
                        ? 'bg-[#FF9398] text-stone-950 font-bold shadow-md'
                        : 'text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    Ciencia Ficción
                  </button>
                  <button
                    onClick={() => setExploreCategory('adventure')}
                    className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                      exploreCategory === 'adventure'
                        ? 'bg-[#FF9398] text-stone-950 font-bold shadow-md'
                        : 'text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    Aventura
                  </button>
                </div>
              </div>

              {/* Grid of Featured Books */}
              {loadingExplore ? (
                <div className="py-24 flex flex-col items-center justify-center text-stone-400 space-y-3 font-mono text-xs">
                  <Loader2 className="w-8 h-8 animate-spin text-[#FF9398]" />
                  <p>Cargando catálogo editorial...</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                  {filteredFeaturedBooks.map((book) => (
                    <BookCard
                      key={book.id}
                      book={book}
                      onSelect={(b) => openBookDetail(b)}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* Recent from LibriVox Feed */}
            {feedBooks.length > 0 && (
              <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 pt-6">
                <div className="flex items-center justify-between border-b border-stone-800 pb-5">
                  <div>
                    <div className="flex items-center gap-2 text-[10px] font-mono text-[#FF9398] uppercase tracking-[0.24em]">
                      <Compass className="w-3.5 h-3.5 text-[#FF9398]" />
                      <span>Transmisión en Vivo</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-serif font-light text-stone-100 mt-1">
                      Novedades del Servidor Abierto
                    </h2>
                  </div>

                  <button
                    onClick={() => setActiveTab('search')}
                    className="pill-btn outline text-[11px] cursor-pointer"
                  >
                    <span>Ver Todo el Archivo</span>
                    <span className="arr">&rarr;</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
                  {feedBooks.slice(0, 12).map((book) => (
                    <BookCard
                      key={book.id}
                      book={book}
                      onSelect={(b) => openBookDetail(b)}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {/* VIEW 2: SEARCH */}
        {activeTab === 'search' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <div className="text-[10px] font-mono tracking-[0.28em] text-[#FF9398] uppercase">
                ÍNDICE COMPLETO &middot; BÚSQUEDA CRUZADA
              </div>
              <h2 className="text-3xl sm:text-5xl font-serif font-light text-stone-100">
                Buscador del Archivo
              </h2>
              <p className="text-sm text-stone-400 font-sans font-light">
                Consulta en simultáneo los servidores de LibriVox y las colecciones sonoras de Internet Archive.
              </p>
            </div>

            <SearchBar
              filters={searchFilters}
              onSearch={handlePerformSearch}
              isLoading={isSearching}
              totalResults={hasSearched ? searchResults.length : undefined}
            />

            {/* Results Grid */}
            {isSearching ? (
              <div className="py-24 flex flex-col items-center justify-center text-stone-400 space-y-3 font-mono text-xs">
                <Loader2 className="w-8 h-8 animate-spin text-[#FF9398]" />
                <p>Consultando servidores de LibriVox & Internet Archive...</p>
              </div>
            ) : hasSearched ? (
              searchResults.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                  {searchResults.map((book) => (
                    <BookCard
                      key={book.id}
                      book={book}
                      onSelect={(b) => openBookDetail(b)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-[#12100e] rounded-3xl border border-stone-800 p-8 space-y-3 max-w-md mx-auto">
                  <SearchIcon className="w-10 h-10 mx-auto text-stone-600" />
                  <h3 className="text-base font-serif font-medium text-stone-200">
                    Sin coincidencias para &ldquo;{searchFilters.query}&rdquo;
                  </h3>
                  <p className="text-xs text-stone-400 font-sans leading-relaxed">
                    Prueba buscando por apellido (ej: Cervantes, Doyle, Poe, Verne, Kafka) o un término temático general.
                  </p>
                </div>
              )
            ) : (
              <div className="pt-8">
                <div className="text-[10px] font-mono text-[#FF9398] uppercase tracking-[0.28em] mb-6 text-center">
                  Recomendados para iniciar tu audición
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                  {featuredBooks.slice(0, 5).map((book) => (
                    <BookCard
                      key={book.id}
                      book={book}
                      onSelect={(b) => openBookDetail(b)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* VIEW 3: LIBRARY */}
        {activeTab === 'library' && (
          <LibraryView
            onSelectBook={(book) => openBookDetail(book)}
            onExploreClick={() => setActiveTab('explore')}
          />
        )}
      </main>

      {/* Footer Colophon */}
      <footer className="border-t border-stone-800/80 bg-[#0c0a09] py-14 px-4 text-center text-xs text-stone-500 space-y-4 relative z-10">
        <div className="flex justify-center">
          <AuralisLogo size="md" withSubtitle={true} />
        </div>
        <p className="font-sans font-light max-w-md mx-auto text-stone-400">
          Audiolibros libres en streaming directo. Grabaciones abiertas de{' '}
          <a
            href="https://librivox.org"
            target="_blank"
            rel="noopener noreferrer"
            className="text-stone-300 hover:text-[#FF9398] transition-colors"
          >
            LibriVox.org
          </a>{' '}
          y preservación universal en{' '}
          <a
            href="https://archive.org"
            target="_blank"
            rel="noopener noreferrer"
            className="text-stone-300 hover:text-[#FF9398] transition-colors"
          >
            Internet Archive
          </a>
          .
        </p>
        <p className="text-[10px] font-mono tracking-widest uppercase text-stone-600">
          Auralis Audio &middot; Diseñado con el ADN editorial de Awwwards &middot; 2026
        </p>
      </footer>

      {/* Persistent Docked Audio Player */}
      <PlayerBar />

      {/* Full-Screen Immersive Audio Player */}
      <ExpandedPlayerModal />

      {/* Book Chapter / Detail Modal */}
      <BookDetailModal
        book={selectedBookForDetail}
        onClose={closeBookDetail}
      />

      {/* About Modal */}
      <AboutModal
        isOpen={aboutModalOpen}
        onClose={() => setAboutModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AudioPlayerProvider>
      <MainContent />
    </AudioPlayerProvider>
  );
}
