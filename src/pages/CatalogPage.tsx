import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { HeroSection } from '../components/HeroSection';
import { BookCard } from '../components/BookCard';
import { SeoHead } from '../components/SeoHead';
import { Book } from '../types/audiobook';
import { fetchFeaturedBooks, fetchAudiobooksFeed, getAuthorName } from '../services/librivoxApi';
import { useAudioPlayer } from '../context/AudioPlayerContext';
import { Sparkles, Compass, Loader2, Search, X, ChevronDown, BookOpen } from 'lucide-react';

export const CatalogPage: React.FC = () => {
  const navigate = useNavigate();
  const { openBookDetail } = useAudioPlayer();

  const [featuredBooks, setFeaturedBooks] = useState<Book[]>([]);
  const [feedBooks, setFeedBooks] = useState<Book[]>([]);
  const [loadingExplore, setLoadingExplore] = useState(true);
  const [exploreCategory, setExploreCategory] = useState<string>('all');
  const [languageFilter, setLanguageFilter] = useState<'all' | 'es' | 'en'>('all');
  const [filterText, setFilterText] = useState<string>('');
  const [showAllBooks, setShowAllBooks] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
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
        console.error('Error loading catalog audiobooks:', err);
      } finally {
        if (isMounted) setLoadingExplore(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleHeroSearchClick = () => {
    navigate('/buscar');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleExploreGenre = (genre: string) => {
    setExploreCategory(genre);
    const catalogEl = document.getElementById('catalogo');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const filteredFeaturedBooks = useMemo(() => {
    return featuredBooks.filter((book) => {
      // 1. Language Filter
      const isSpanish = book.language?.toLowerCase().includes('span') || (book as any).category === 'spanish';
      if (languageFilter === 'es' && !isSpanish) return false;
      if (languageFilter === 'en' && isSpanish) return false;

      // 2. Category Filter
      if (exploreCategory === 'spanish' && !isSpanish) return false;
      if (exploreCategory === 'mystery') {
        const cat = (book as any).category;
        const matches = cat === 'mystery' || book.id.includes('baskerville') || book.id.includes('leyendas') || book.id.includes('poe') || book.id.includes('dracula') || book.id.includes('frankenstein');
        if (!matches) return false;
      }
      if (exploreCategory === 'tales') {
        const cat = (book as any).category;
        const matches = cat === 'tales' || book.title.toLowerCase().includes('cuento') || book.title.toLowerCase().includes('relato') || book.id.includes('quiroga') || book.id.includes('grimm');
        if (!matches) return false;
      }
      if (exploreCategory === 'adventure') {
        const cat = (book as any).category;
        const matches = cat === 'adventure' || book.title.toLowerCase().includes('viaje') || book.title.toLowerCase().includes('isla') || book.id.includes('odisea') || book.id.includes('verne') || book.id.includes('monte_cristo');
        if (!matches) return false;
      }
      if (exploreCategory === 'classics') {
        const cat = (book as any).category;
        const matches = cat === 'classics' || book.id.includes('quijote') || book.id.includes('odisea') || book.id.includes('lazarillo') || book.id.includes('pride') || book.id.includes('dorian');
        if (!matches) return false;
      }
      if (exploreCategory === 'poetry') {
        const cat = (book as any).category;
        const matches = cat === 'poetry' || book.id.includes('rimas') || book.id.includes('poesia') || book.id.includes('dario');
        if (!matches) return false;
      }
      if (exploreCategory === 'scifi') {
        const cat = (book as any).category;
        const matches = cat === 'scifi' || book.id.includes('time_machine') || book.id.includes('metamorfosis') || book.id.includes('20000leguas') || book.id.includes('frankenstein');
        if (!matches) return false;
      }

      // 3. In-catalog search query filter
      if (filterText.trim()) {
        const q = filterText.trim().toLowerCase();
        const author = getAuthorName(book).toLowerCase();
        const title = (book.title || '').toLowerCase();
        const desc = (book.description || '').toLowerCase();
        return title.includes(q) || author.includes(q) || desc.includes(q);
      }

      return true;
    });
  }, [featuredBooks, exploreCategory, languageFilter, filterText]);

  // If in 'all' view with no search filter, allow preview mode (15 items) or expand to all
  const isDefaultView = exploreCategory === 'all' && languageFilter === 'all' && !filterText.trim();
  const visibleBooks = isDefaultView && !showAllBooks ? filteredFeaturedBooks.slice(0, 15) : filteredFeaturedBooks;
  const remainingCount = filteredFeaturedBooks.length - visibleBooks.length;

  const structuredSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Auralis Audiobooks',
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'All',
    description:
      'Escucha decenas de audiolibros y cuentos clásicos de dominio público en español e inglés desde LibriVox e Internet Archive con diseño editorial de alta fidelidad.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  };

  return (
    <div className="space-y-16">
      <SeoHead
        title="Auralis · Audiolibros LibriVox de Dominio Público"
        description="Escucha decenas de audiolibros de literatura universal gratis en español e inglés directamente desde LibriVox e Internet Archive. Sin muros de pago."
        canonicalPath="/"
        schemaJson={structuredSchema}
      />

      {/* Hero Section */}
      <HeroSection
        onSearchClick={handleHeroSearchClick}
        onExploreGenre={handleExploreGenre}
      />

      {/* Editorial Statement Strip */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-6 sm:p-10 bg-[#12100e] border border-stone-800 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
          <div className="max-w-2xl space-y-2">
            <div className="text-[10px] font-mono tracking-[0.28em] text-[#FF9398] uppercase">
              EDITORIAL &middot; PROYECTO ABIERTO
            </div>
            <p className="text-base sm:text-lg font-serif font-light text-stone-200 leading-relaxed">
              «Las voces de miles de lectores alrededor del mundo convierten los textos silenciosos de Gutenberg en memorias sonoras imperecederas.»
            </p>
          </div>
          <div className="shrink-0 flex items-center gap-3">
            <button
              onClick={() => navigate('/buscar')}
              className="pill-btn coral text-xs cursor-pointer shadow-md"
            >
              <span>Consultar Todo el Archivo</span>
              <span className="arr">&rarr;</span>
            </button>
          </div>
        </div>
      </div>

      {/* Featured Catalog Area */}
      <section id="catalogo" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 scroll-mt-24">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-stone-800 pb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[10px] font-mono text-[#FF9398] uppercase tracking-[0.24em]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Colección Seleccionada &middot; {featuredBooks.length} Obras Disponibles</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-serif font-light text-stone-100">
              Historias & Clásicos del Archivo
            </h2>
            <p className="text-xs sm:text-sm text-stone-400 font-sans font-light max-w-xl">
              Explora una selección de literatura española e historias universales con grabaciones completas en alta definición y sin cortes.
            </p>
          </div>

          {/* Inline Filter Controls & Search */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Live Search inside Catalog */}
            <div className="relative min-w-[240px] sm:w-64">
              <Search className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                placeholder="Filtrar por autor o título..."
                className="w-full pl-9 pr-8 py-2 bg-[#12100e] border border-stone-800 focus:border-[#FF9398] rounded-xl text-xs text-stone-200 placeholder-stone-500 outline-none transition-colors"
              />
              {filterText && (
                <button
                  onClick={() => setFilterText('')}
                  aria-label="Limpiar filtro"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Language Toggle Pills */}
            <div className="flex items-center p-1 bg-[#12100e] border border-stone-800 rounded-xl text-xs font-mono">
              {[
                { id: 'all', label: 'Todos' },
                { id: 'es', label: 'Español' },
                { id: 'en', label: 'English' },
              ].map((lang) => (
                <button
                  key={lang.id}
                  onClick={() => setLanguageFilter(lang.id as any)}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    languageFilter === lang.id
                      ? 'bg-stone-800 text-stone-100 font-semibold'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin text-xs font-mono">
          {[
            { id: 'all', label: 'Todas las historias' },
            { id: 'spanish', label: 'En Español' },
            { id: 'tales', label: 'Cuentos & Relatos' },
            { id: 'mystery', label: 'Misterio & Terror' },
            { id: 'adventure', label: 'Aventura' },
            { id: 'classics', label: 'Clásicos' },
            { id: 'poetry', label: 'Poesía & Lírica' },
            { id: 'scifi', label: 'Ciencia Ficción' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setExploreCategory(cat.id);
                setShowAllBooks(true);
              }}
              className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap border ${
                exploreCategory === cat.id
                  ? 'bg-[#FF9398] text-stone-950 font-bold border-[#FF9398] shadow-md'
                  : 'bg-[#12100e] text-stone-400 border-stone-800 hover:border-stone-700 hover:text-stone-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Counter notification */}
        <div className="flex items-center justify-between text-xs font-mono text-stone-400 pt-1">
          <span>
            Mostrando <strong className="text-stone-200">{visibleBooks.length}</strong> de <strong className="text-stone-200">{filteredFeaturedBooks.length}</strong> historias cargadas
          </span>

          {isDefaultView && (
            <button
              onClick={() => setShowAllBooks(!showAllBooks)}
              className="text-[#FF9398] hover:underline cursor-pointer flex items-center gap-1"
            >
              <span>{showAllBooks ? 'Ver vista compacta (15)' : `Ver todo el catálogo (${filteredFeaturedBooks.length})`}</span>
            </button>
          )}
        </div>

        {/* Grid of Books */}
        {loadingExplore ? (
          <div className="py-24 flex flex-col items-center justify-center text-stone-400 space-y-3 font-mono text-xs">
            <Loader2 className="w-8 h-8 animate-spin text-[#FF9398]" />
            <p>Cargando catálogo editorial...</p>
          </div>
        ) : visibleBooks.length === 0 ? (
          <div className="py-20 text-center bg-[#12100e] rounded-3xl border border-stone-800 p-8 space-y-3 max-w-md mx-auto">
            <BookOpen className="w-8 h-8 mx-auto text-stone-600" />
            <h3 className="text-base font-serif font-medium text-stone-200">
              No se encontraron historias con estos filtros
            </h3>
            <p className="text-xs text-stone-400 font-sans">
              Prueba cambiando la categoría, el idioma o limpiando el texto de búsqueda.
            </p>
            <button
              onClick={() => {
                setExploreCategory('all');
                setLanguageFilter('all');
                setFilterText('');
              }}
              className="mt-2 text-xs text-[#FF9398] font-mono hover:underline cursor-pointer"
            >
              Restablecer filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {visibleBooks.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                onSelect={(b) => openBookDetail(b)}
              />
            ))}
          </div>
        )}

        {/* Button to show all books when truncated in initial view */}
        {isDefaultView && !showAllBooks && remainingCount > 0 && (
          <div className="pt-4 flex justify-center">
            <button
              onClick={() => setShowAllBooks(true)}
              className="group px-6 py-3.5 bg-[#12100e] hover:bg-stone-900 border border-stone-800 hover:border-[#FF9398]/60 text-stone-200 rounded-2xl text-xs font-mono flex items-center gap-2 transition-all cursor-pointer shadow-lg"
            >
              <span>Ver todas las historias disponibles (+{remainingCount} más)</span>
              <ChevronDown className="w-4 h-4 text-[#FF9398] group-hover:translate-y-0.5 transition-transform" />
            </button>
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
              onClick={() => navigate('/buscar')}
              className="pill-btn outline text-[11px] cursor-pointer"
            >
              <span>Ver Todo</span>
              <span className="arr">&rarr;</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-5">
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
  );
};
