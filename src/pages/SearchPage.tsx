import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SearchBar } from '../components/SearchBar';
import { BookCard } from '../components/BookCard';
import { SeoHead } from '../components/SeoHead';
import { Book, SearchFilters } from '../types/audiobook';
import { searchAudiobooks, fetchFeaturedBooks } from '../services/librivoxApi';
import { useAudioPlayer } from '../context/AudioPlayerContext';
import { Search as SearchIcon, Loader2, Sparkles, BookOpen } from 'lucide-react';

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { openBookDetail } = useAudioPlayer();

  const queryParam = searchParams.get('q') || '';
  const langParam = (searchParams.get('lang') as any) || 'all';
  const typeParam = (searchParams.get('type') as any) || 'all';

  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    query: queryParam,
    searchType: typeParam,
    language: langParam,
  });
  const [searchResults, setSearchResults] = useState<Book[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(Boolean(queryParam.trim()));
  const [featuredBooks, setFeaturedBooks] = useState<Book[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  useEffect(() => {
    fetchFeaturedBooks().then((books) => setFeaturedBooks(books));
  }, []);

  // Sync state if URL query param changes
  useEffect(() => {
    if (queryParam.trim()) {
      const filters: SearchFilters = {
        query: queryParam,
        searchType: typeParam,
        language: langParam,
      };
      setSearchFilters(filters);
      executeSearch(filters);
    }
  }, [queryParam, langParam, typeParam]);

  const executeSearch = async (filters: SearchFilters) => {
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

  const handlePerformSearch = (filters: SearchFilters) => {
    setSearchFilters(filters);
    const newParams: Record<string, string> = {};
    if (filters.query) newParams.q = filters.query;
    if (filters.language !== 'all') newParams.lang = filters.language;
    if (filters.searchType !== 'all') newParams.type = filters.searchType;
    setSearchParams(newParams);
    executeSearch(filters);
  };

  const handleQuickTagClick = (tagQuery: string) => {
    const filters: SearchFilters = {
      query: tagQuery,
      searchType: 'all',
      language: 'all',
    };
    handlePerformSearch(filters);
  };

  // Filter curated collection when not searching
  const filteredCurated = featuredBooks.filter((book) => {
    if (activeCategory === 'all') return true;
    if (activeCategory === 'spanish') {
      return book.language?.toLowerCase().includes('span') || (book as any).category === 'spanish';
    }
    if (activeCategory === 'mystery') {
      return (book as any).category === 'mystery' || book.id.includes('dracula') || book.id.includes('baskerville');
    }
    if (activeCategory === 'tales') {
      return (book as any).category === 'tales' || book.title.toLowerCase().includes('cuento');
    }
    if (activeCategory === 'adventure') {
      return (book as any).category === 'adventure';
    }
    return true;
  });

  const pageTitle = searchFilters.query.trim()
    ? `Búsqueda: "${searchFilters.query}" · Auralis Audiolibros`
    : 'Buscador del Archivo LibriVox · Auralis';

  const quickPills = [
    'Horacio Quiroga',
    'Gustavo Adolfo Bécquer',
    'Edgar Allan Poe',
    'Julio Verne',
    'Sherlock Holmes',
    'Don Quijote',
    'Franz Kafka',
    'Vicente Blasco Ibáñez',
    'Dracula',
    'Benito Pérez Galdós',
    'Cuentos de Hadas',
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <SeoHead
        title={pageTitle}
        description="Consulta en simultáneo los servidores de LibriVox e Internet Archive. Búsqueda por título, autor o idioma en miles de audiolibros libres."
        canonicalPath="/buscar"
      />

      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="text-[10px] font-mono tracking-[0.28em] text-[#FF9398] uppercase">
          ÍNDICE COMPLETO &middot; BÚSQUEDA CRUZADA
        </div>
        <h1 className="text-3xl sm:text-5xl font-serif font-light text-stone-100">
          Buscador del Archivo
        </h1>
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

      {/* Quick Search Chips */}
      <div className="space-y-2">
        <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-stone-400 text-center">
          Búsquedas recomendadas:
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2">
          {quickPills.map((pill) => (
            <button
              key={pill}
              onClick={() => handleQuickTagClick(pill)}
              className="px-3 py-1.5 bg-[#12100e] hover:bg-stone-900 border border-stone-800 hover:border-[#FF9398]/50 text-stone-300 hover:text-white rounded-full text-xs font-sans transition-all cursor-pointer shadow-sm"
            >
              {pill}
            </button>
          ))}
        </div>
      </div>

      {/* Results Grid or Curated Browser */}
      {isSearching ? (
        <div className="py-24 flex flex-col items-center justify-center text-stone-400 space-y-3 font-mono text-xs">
          <Loader2 className="w-8 h-8 animate-spin text-[#FF9398]" />
          <p>Consultando servidores de LibriVox & Internet Archive...</p>
        </div>
      ) : hasSearched ? (
        searchResults.length > 0 ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between text-xs font-mono text-stone-400 border-b border-stone-800 pb-3">
              <span>
                Resultados para <strong className="text-stone-200">&ldquo;{searchFilters.query}&rdquo;</strong> ({searchResults.length} encontrados)
              </span>
              <button
                onClick={() => {
                  setSearchParams({});
                  setSearchFilters({ query: '', searchType: 'all', language: 'all' });
                  setHasSearched(false);
                  setSearchResults([]);
                }}
                className="text-[#FF9398] hover:underline cursor-pointer"
              >
                Limpiar búsqueda
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
              {searchResults.map((book) => (
                <BookCard
                  key={book.id}
                  book={book}
                  onSelect={(b) => openBookDetail(b)}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-20 bg-[#12100e] rounded-3xl border border-stone-800 p-8 space-y-3 max-w-md mx-auto">
            <SearchIcon className="w-10 h-10 mx-auto text-stone-600" />
            <h3 className="text-base font-serif font-medium text-stone-200">
              Sin coincidencias para &ldquo;{searchFilters.query}&rdquo;
            </h3>
            <p className="text-xs text-stone-400 font-sans leading-relaxed">
              Prueba buscando por apellido (ej: Cervantes, Quiroga, Bécquer, Doyle, Poe, Verne, Kafka) o un término temático general.
            </p>
          </div>
        )
      ) : (
        /* Pre-search: Browse Curated Collection */
        <div className="pt-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-800 pb-4">
            <div className="flex items-center gap-2 text-xs font-mono text-[#FF9398] uppercase tracking-[0.24em]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Obras Disponibles en el Catálogo ({featuredBooks.length})</span>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-mono">
              {[
                { id: 'all', label: 'Todas' },
                { id: 'spanish', label: 'En Español' },
                { id: 'tales', label: 'Cuentos' },
                { id: 'mystery', label: 'Misterio' },
                { id: 'adventure', label: 'Aventura' },
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActiveCategory(c.id)}
                  className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                    activeCategory === c.id
                      ? 'bg-[#FF9398] text-stone-950 font-bold'
                      : 'bg-stone-900 text-stone-400 hover:text-stone-200'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {filteredCurated.map((book) => (
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
  );
};
