import React, { useState } from 'react';
import { Search, X, SlidersHorizontal, ArrowRight, Loader2 } from 'lucide-react';
import { SearchFilters } from '../types/audiobook';

interface SearchBarProps {
  filters: SearchFilters;
  onSearch: (filters: SearchFilters) => void;
  isLoading: boolean;
  totalResults?: number;
}

const POPULAR_SUGGESTIONS = [
  { label: 'Don Quijote', type: 'title', lang: 'Spanish' },
  { label: 'Sherlock Holmes', type: 'title', lang: 'all' },
  { label: 'Edgar Allan Poe', type: 'author', lang: 'all' },
  { label: 'Rimas y Leyendas', type: 'title', lang: 'Spanish' },
  { label: 'Franz Kafka', type: 'author', lang: 'all' },
  { label: 'Dracula', type: 'title', lang: 'English' },
  { label: 'Julio Verne', type: 'author', lang: 'Spanish' },
  { label: 'Frankenstein', type: 'title', lang: 'English' },
  { label: 'Cervantes', type: 'author', lang: 'Spanish' },
];

export const SearchBar: React.FC<SearchBarProps> = ({
  filters,
  onSearch,
  isLoading,
  totalResults,
}) => {
  const [localQuery, setLocalQuery] = useState(filters.query);
  const [searchType, setSearchType] = useState<SearchFilters['searchType']>(filters.searchType);
  const [language, setLanguage] = useState<SearchFilters['language']>(filters.language);
  const [showFilters, setShowFilters] = useState(false);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onSearch({
      query: localQuery,
      searchType,
      language,
    });
  };

  const handleClear = () => {
    setLocalQuery('');
    onSearch({
      query: '',
      searchType,
      language,
    });
  };

  const handleSelectSuggestion = (s: typeof POPULAR_SUGGESTIONS[0]) => {
    setLocalQuery(s.label);
    const newFilters: SearchFilters = {
      query: s.label,
      searchType: s.type as any,
      language: s.lang as any,
    };
    setSearchType(newFilters.searchType);
    setLanguage(newFilters.language);
    onSearch(newFilters);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      {/* Search Bar Form */}
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <div className="absolute left-4 pointer-events-none text-stone-300">
          <Search className="w-5 h-5" />
        </div>

        <input
          type="text"
          value={localQuery}
          onChange={(e) => setLocalQuery(e.target.value)}
          placeholder="Buscar por título, autor o palabra clave (ej: Quijote, Poe, Verne, Sherlock)..."
          aria-label="Término de búsqueda de audiolibros"
          className="w-full pl-13 pr-32 py-4 sm:py-5 bg-[#12100e] border border-stone-700 focus:border-[#FF9398] rounded-2xl text-stone-100 placeholder-stone-400 focus:outline-none text-base transition-all font-sans font-normal"
        />

        <div className="absolute right-3 flex items-center gap-2">
          {localQuery && (
            <button
              type="button"
              onClick={handleClear}
              className="p-2 text-stone-300 hover:text-white transition-colors cursor-pointer rounded-lg"
              title="Limpiar búsqueda"
              aria-label="Limpiar campo de búsqueda"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2.5 rounded-xl text-xs sm:text-sm font-mono transition-colors cursor-pointer ${
              showFilters || language !== 'all' || searchType !== 'all'
                ? 'bg-[#FF9398]/20 text-[#FF9398] border border-[#FF9398]/50 font-bold'
                : 'text-stone-300 hover:text-white hover:bg-stone-800 border border-stone-700'
            }`}
            title="Filtros avanzados"
            aria-label="Alternar filtros avanzados de búsqueda"
          >
            <SlidersHorizontal className="w-5 h-5" />
          </button>

          <button
            type="submit"
            disabled={isLoading || !localQuery.trim()}
            className="p-3 bg-[#FF9398] text-stone-950 rounded-xl hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer font-bold"
            title="Buscar"
            aria-label="Ejecutar búsqueda"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
          </button>
        </div>
      </form>

      {/* Advanced Filter Drawer */}
      {showFilters && (
        <div className="p-6 bg-[#12100e] border border-stone-700 rounded-3xl space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs sm:text-sm font-mono">
            {/* Search Type Filter */}
            <div>
              <span className="text-stone-300 block mb-2 tracking-wider uppercase text-xs font-bold">
                Campo de búsqueda:
              </span>
              <div className="flex items-center gap-1.5 p-1 bg-[#0c0a09] rounded-xl border border-stone-700">
                <button
                  type="button"
                  onClick={() => setSearchType('all')}
                  className={`flex-1 py-2 text-center rounded-lg font-bold transition-colors cursor-pointer ${
                    searchType === 'all'
                      ? 'bg-[#FF9398] text-stone-950'
                      : 'text-stone-300 hover:text-white'
                  }`}
                >
                  Todo
                </button>
                <button
                  type="button"
                  onClick={() => setSearchType('title')}
                  className={`flex-1 py-2 text-center rounded-lg font-bold transition-colors cursor-pointer ${
                    searchType === 'title'
                      ? 'bg-[#FF9398] text-stone-950'
                      : 'text-stone-300 hover:text-white'
                  }`}
                >
                  Título
                </button>
                <button
                  type="button"
                  onClick={() => setSearchType('author')}
                  className={`flex-1 py-2 text-center rounded-lg font-bold transition-colors cursor-pointer ${
                    searchType === 'author'
                      ? 'bg-[#FF9398] text-stone-950'
                      : 'text-stone-300 hover:text-white'
                  }`}
                >
                  Autor
                </button>
              </div>
            </div>

            {/* Language Filter */}
            <div>
              <span className="text-stone-300 block mb-2 tracking-wider uppercase text-xs font-bold">
                Idioma del archivo:
              </span>
              <div className="flex items-center gap-1.5 p-1 bg-[#0c0a09] rounded-xl border border-stone-700">
                <button
                  type="button"
                  onClick={() => setLanguage('all')}
                  className={`flex-1 py-2 text-center rounded-lg font-bold transition-colors cursor-pointer ${
                    language === 'all'
                      ? 'bg-[#FF9398] text-stone-950'
                      : 'text-stone-300 hover:text-white'
                  }`}
                >
                  Todos
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('Spanish')}
                  className={`flex-1 py-2 text-center rounded-lg font-bold transition-colors cursor-pointer ${
                    language === 'Spanish'
                      ? 'bg-[#FF9398] text-stone-950'
                      : 'text-stone-300 hover:text-white'
                  }`}
                >
                  Español
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('English')}
                  className={`flex-1 py-2 text-center rounded-lg font-bold transition-colors cursor-pointer ${
                    language === 'English'
                      ? 'bg-[#FF9398] text-stone-950'
                      : 'text-stone-300 hover:text-white'
                  }`}
                >
                  English
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t border-stone-800">
            <button
              type="button"
              onClick={() => handleSubmit()}
              className="pill-btn coral cursor-pointer text-xs sm:text-sm py-2 px-5 font-bold"
            >
              <span>Aplicar filtros</span>
              <span className="arr">&rarr;</span>
            </button>
          </div>
        </div>
      )}

      {/* Popular Suggestions & Result Counter */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-stone-400 font-mono text-xs uppercase tracking-wider font-bold">
            Sugerencias:
          </span>
          {POPULAR_SUGGESTIONS.slice(0, 6).map((s) => (
            <button
              key={s.label}
              type="button"
              onClick={() => handleSelectSuggestion(s)}
              className="text-stone-300 hover:text-[#FF9398] transition-colors cursor-pointer font-sans font-medium"
            >
              {s.label} &middot;
            </button>
          ))}
        </div>

        {totalResults !== undefined && (
          <div className="text-stone-300 font-mono tabular-nums text-xs sm:text-sm font-semibold">
            {totalResults} {totalResults === 1 ? 'audiolibro en catálogo' : 'audiolibros en catálogo'}
          </div>
        )}
      </div>
    </div>
  );
};
