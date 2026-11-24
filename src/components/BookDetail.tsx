import React, { useState } from 'react';
import {
  Play,
  Pause,
  Heart,
  BookOpen,
  ExternalLink,
  Volume2,
  ListMusic,
  Loader2,
} from 'lucide-react';
import { Book, Section } from '../types/audiobook';
import {
  decodeHtmlEntities,
  getAuthorName,
  getBookCover,
  formatDuration,
} from '../services/librivoxApi';

interface BookDetailProps {
  book: Book;
  fullBook: Book;
  isFav: boolean;
  isCurrentlyPlayingThisBook: boolean;
  currentSectionIndex: number;
  isPlaying: boolean;
  loadingSections?: boolean;
  onPlayFirst: () => void;
  onPlaySection: (index: number) => void;
  onToggleFavorite: () => void;
  onOpenPlayer?: () => void;
  showOpenPlayer?: boolean;
  variant?: 'page' | 'modal';
  currentBookId?: string | null;
}

export const BookDetail: React.FC<BookDetailProps> = ({
  book,
  fullBook,
  isFav,
  isCurrentlyPlayingThisBook,
  currentSectionIndex,
  isPlaying,
  loadingSections,
  onPlayFirst,
  onPlaySection,
  onToggleFavorite,
  onOpenPlayer,
  showOpenPlayer = true,
  variant = 'page',
  currentBookId,
}) => {
  const [showFullDesc, setShowFullDesc] = useState(false);

  const authorName = getAuthorName(fullBook);
  const coverUrl = getBookCover(fullBook);
  const sections: Section[] = fullBook.sections || [];

  return (
    <>
      {/* Title & Metadata */}
      <div className="flex-1 space-y-2.5 w-full">
        <div>
          <h1 className="text-lg sm:text-2xl font-serif font-light text-stone-100 leading-tight">
            {fullBook.title}
          </h1>
          <p className="text-xs sm:text-sm text-[#FF9398] font-sans font-medium mt-0.5">
            {authorName}
          </p>
        </div>

        {/* Metadata Badges */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-stone-300 font-medium">
          <span>{fullBook.language || 'Dominio Público'}</span>
          <span aria-hidden="true">&middot;</span>
          {fullBook.copyright_year && (
            <>
              <span>Año {fullBook.copyright_year}</span>
              <span aria-hidden="true">&middot;</span>
            </>
          )}
          <span>
            {fullBook.totaltime || formatDuration(fullBook.totaltimesecs)}
          </span>
          <span aria-hidden="true">&middot;</span>
          <span>{sections.length || fullBook.num_sections || 1} capítulos</span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <button
            onClick={onPlayFirst}
            className={`pill-btn coral text-xs shadow-md font-bold py-2 px-4`}
          >
            {isCurrentlyPlayingThisBook ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                <span>Pausar reproducción</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current translate-x-0.5" />
                <span>
                  {variant === 'modal'
                    ? (currentBookId === book.id ? 'Reanudar' : 'Comenzar a escuchar')
                    : 'Comenzar a escuchar'}
                </span>
              </>
            )}
            <span className="arr">&rarr;</span>
          </button>

          <button
            onClick={onToggleFavorite}
            className={`pill-btn ${isFav ? 'coral' : 'outline'} text-xs py-2 px-4 font-bold`}
          >
            <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
            <span>{isFav ? 'En tu colección' : 'Añadir a colección'}</span>
          </button>

          {showOpenPlayer && onOpenPlayer && (
            <button
              onClick={onOpenPlayer}
              className="pill-btn outline text-xs py-2 px-3 text-[#FF9398] font-bold"
            >
              <Volume2 className="w-4 h-4" />
              <span>Abrir reproductor</span>
            </button>
          )}
        </div>

        {/* External links */}
        <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-stone-300 font-mono font-medium">
          {fullBook.url_text_source && (
            <a
              href={fullBook.url_text_source}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-[#FF9398] transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              <span>Texto en Gutenberg</span>
              <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
            </a>
          )}
          {fullBook.url_librivox && (
            <a
              href={fullBook.url_librivox}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-[#FF9398] transition-colors"
            >
              <span>Ficha en LibriVox.org</span>
              <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
            </a>
          )}
        </div>
      </div>

      {/* Synopsis Section */}
      {fullBook.description && (
        <div className="p-3 bg-[#12100e] rounded-xl space-y-1.5">
          <h2 className="text-xs font-mono text-stone-500">
            Sinopsis
          </h2>
          <p
            className={`text-sm text-stone-200 leading-relaxed font-sans font-light whitespace-pre-line ${
              !showFullDesc && fullBook.description.length > 400 ? 'line-clamp-3' : ''
            }`}
          >
            {fullBook.description}
          </p>
          {fullBook.description.length > 400 && (
            <button
              onClick={() => setShowFullDesc(!showFullDesc)}
              className="text-xs font-mono text-[#FF9398] hover:underline"
            >
              {showFullDesc ? 'Leer menos' : 'Leer más...'}
            </button>
          )}
        </div>
      )}

      {/* Chapter Index */}
      <div className="p-4 bg-[#12100e] rounded-2xl space-y-3">
        <div className="flex items-center gap-2 border-b border-stone-800 pb-2.5">
          <ListMusic className="w-4 h-4 text-[#FF9398] shrink-0" />
          <h2 className="text-sm font-serif font-medium text-stone-100">
            Capítulos ({sections.length || fullBook.num_sections || 0})
          </h2>
          {loadingSections && (
            <div className="flex items-center gap-1.5 text-xs font-mono text-stone-300 ml-auto">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#FF9398]" />
              <span>Cargando...</span>
            </div>
          )}
        </div>

        {loadingSections && sections.length === 0 ? (
          <div className="p-6 text-center bg-[#0c0a09] rounded-xl">
            <Loader2 className="w-6 h-6 animate-spin text-[#FF9398] mx-auto mb-1.5" />
            <p className="text-xs font-mono text-stone-300">
              Cargando capítulos...
            </p>
          </div>
        ) : sections.length > 0 ? (
          <div className="divide-y divide-stone-800 border border-stone-700 rounded-xl overflow-hidden bg-[#0c0a09]">
            {sections.map((section, idx) => {
              const isCurrentSection =
                book.id && currentSectionIndex === idx;
              const isSectionPlaying = isCurrentSection && isPlaying;
              const readerName = section.readers?.[0]?.display_name;

              return (
                <div
                  key={section.id || idx}
                  onClick={() => onPlaySection(idx)}
                  className={`flex items-center p-3 hover:bg-stone-900 transition-colors group ${
                    isCurrentSection ? 'bg-[#FF9398]/15' : ''
                  }`}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onPlaySection(idx);
                    }}
                    aria-label={`Reproducir pista ${idx + 1}: ${decodeHtmlEntities(section.title) || ''}`}
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-transform mr-3 ${
                      isCurrentSection
                        ? 'bg-[#FF9398] text-stone-950 scale-105'
                        : 'bg-stone-800 text-stone-200 group-hover:bg-[#FF9398] group-hover:text-stone-950'
                    }`}
                  >
                    {isSectionPlaying ? (
                      <Pause className="w-3 h-3 fill-current" />
                    ) : (
                      <Play className="w-3 h-3 fill-current translate-x-0.5" />
                    )}
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3
                        className={`text-sm truncate font-sans ${
                          isCurrentSection ? 'text-[#FF9398] font-semibold' : 'text-stone-100 font-medium'
                        }`}
                      >
                        {decodeHtmlEntities(section.title) || `Capítulo ${idx + 1}`}
                      </h3>
                      {section.playtime && (
                        <span className="text-xs font-mono text-stone-400 tabular-nums shrink-0">
                          {formatDuration(section.playtime)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-stone-500 font-mono mt-0.5">
                      <span>Pista {idx + 1}</span>
                      {readerName && (
                        <>
                          <span aria-hidden="true">&middot;</span>
                          <span className="truncate">{readerName}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-6 text-center bg-[#0c0a09] rounded-xl">
            <p className="text-xs font-mono text-stone-300">
              Presiona &ldquo;Comenzar&rdquo; para reproducir.
            </p>
          </div>
        )}
      </div>
    </>
  );
};
