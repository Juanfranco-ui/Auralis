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
      {/* Search Bar Form with Awwwards-mcp styling */}
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <div className="absolute left-4 pointer-events-none text-stone-400">
          <Search className="w-4 h-4" />
        </div>

        <input
          type="text"
          value={localQuery}
          onChange={(e) => setLocalQuery(e.target.value)}
          placeholder="Buscar por título, autor o palabra clave (ej: Quijote, Poe, Verne, Sherlock)..."
          className="w-full pl-12 pr-28 py-4 bg-[#12100e] border border-stone-800 focus:border-[#FF9398] rounded-2xl text-stone-100 placeholder-stone-500 focus:outline-none text-sm transition-all font-sans font-light"
        />

        <div className="absolute right-3 flex items-center gap-2">
          {localQuery && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1.5 text-stone-400 hover:text-stone-200 transition-colors cursor-pointer"
              title="Limpiar"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-xl text-xs font-mono transition-colors cursor-pointer ${
              showFilters || language !== 'all' || searchType !== 'all'
                ? 'bg-[#FF9398]/20 text-[#FF9398] border border-[#FF9398]/40'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
            }`}
            title="Filtros avanzados"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>

          <button
            type="submit"
            disabled={isLoading || !localQuery.trim()}
            className="p-2.5 bg-[#FF9398] text-stone-950 rounded-xl hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer font-medium"
            title="Buscar"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
          </button>
        </div>
      </form>

      {/* Advanced Filter Drawer */}
      {showFilters && (
        <div className="p-5 bg-[#12100e] border border-stone-800 rounded-2xl space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
            {/* Search Type Filter */}
            <div>
              <span className="text-stone-400 block mb-2 tracking-wider uppercase text-[10px]">
                Campo de búsqueda:
              </span>
              <div className="flex items-center gap-1.5 p-1 bg-[#0c0a09] rounded-xl border border-stone-800">
                <button
                  type="button"
                  onClick={() => setSearchType('all')}
                  className={`flex-1 py-1.5 text-center rounded-lg font-medium transition-colors cursor-pointer ${
                    searchType === 'all'
                      ? 'bg-[#FF9398] text-stone-950 font-bold'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  Todo
                </button>
                <button
                  type="button"
                  onClick={() => setSearchType('title')}
                  className={`flex-1 py-1.5 text-center rounded-lg font-medium transition-colors cursor-pointer ${
                    searchType === 'title'
                      ? 'bg-[#FF9398] text-stone-950 font-bold'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  Título
                </button>
                <button
                  type="button"
                  onClick={() => setSearchType('author')}
                  className={`flex-1 py-1.5 text-center rounded-lg font-medium transition-colors cursor-pointer ${
                    searchType === 'author'
                      ? 'bg-[#FF9398] text-stone-950 font-bold'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  Autor
                </button>
              </div>
            </div>

            {/* Language Filter */}
            <div>
              <span className="text-stone-400 block mb-2 tracking-wider uppercase text-[10px]">
                Idioma del archivo:
              </span>
              <div className="flex items-center gap-1.5 p-1 bg-[#0c0a09] rounded-xl border border-stone-800">
                <button
                  type="button"
                  onClick={() => setLanguage('all')}
                  className={`flex-1 py-1.5 text-center rounded-lg font-medium transition-colors cursor-pointer ${
                    language === 'all'
                      ? 'bg-[#FF9398] text-stone-950 font-bold'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  Todos
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('Spanish')}
                  className={`flex-1 py-1.5 text-center rounded-lg font-medium transition-colors cursor-pointer ${
                    language === 'Spanish'
                      ? 'bg-[#FF9398] text-stone-950 font-bold'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  Español
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('English')}
                  className={`flex-1 py-1.5 text-center rounded-lg font-medium transition-colors cursor-pointer ${
                    language === 'English'
                      ? 'bg-[#FF9398] text-stone-950 font-bold'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  English
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2 border-t border-stone-800/80">
            <button
              type="button"
              onClick={() => handleSubmit()}
              className="pill-btn coral cursor-pointer text-[10px]"
            >
              <span>Aplicar filtros</span>
              <span className="arr">&rarr;</span>
            </button>
          </div>
        </div>
      )}

      {/* Popular Suggestions & Result Counter */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-stone-500 font-mono text-[10px] uppercase tracking-wider">
            Índices:
          </span>
          {POPULAR_SUGGESTIONS.slice(0, 6).map((s) => (
            <button
              key={s.label}
              type="button"
              onClick={() => handleSelectSuggestion(s)}
              className="text-stone-400 hover:text-[#FF9398] transition-colors cursor-pointer font-sans"
            >
              {s.label} &middot;
            </button>
          ))}
        </div>

        {totalResults !== undefined && (
          <div className="text-stone-400 font-mono tabular-nums text-xs">
            {totalResults} {totalResults === 1 ? 'audiolibro en catálogo' : 'audiolibros en catálogo'}
          </div>
        )}
      </div>
    </div>
  );
};
