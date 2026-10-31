import React, { useState, useEffect } from 'react';
import {
  X,
  Play,
  Pause,
  Heart,
  Clock,
  BookOpen,
  ExternalLink,
  Volume2,
  ListMusic,
  Share2,
  Check,
  Loader2,
  Maximize2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Book, Section } from '../types/audiobook';
import { useAudioPlayer } from '../context/AudioPlayerContext';
import {
  getAuthorName,
  getBookCover,
  formatDuration,
  fetchBookDetails,
} from '../services/librivoxApi';

interface BookDetailModalProps {
  book: Book | null;
  onClose: () => void;
}

export const BookDetailModal: React.FC<BookDetailModalProps> = ({ book, onClose }) => {
  const navigate = useNavigate();
  const {
    currentBook,
    currentSectionIndex,
    isPlaying,
    playBook,
    togglePlayPause,
    toggleFavorite,
    isFavorite,
    setIsExpanded,
  } = useAudioPlayer();

  const [fullBook, setFullBook] = useState<Book | null>(book);
  const [loadingSections, setLoadingSections] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [showFullDesc, setShowFullDesc] = useState<boolean>(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (book) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [book, onClose]);

  useEffect(() => {
    if (!book) {
      setFullBook(null);
      return;
    }

    setFullBook(book);

    if (!book.sections || book.sections.length === 0) {
      setLoadingSections(true);
      fetchBookDetails(book.id, book)
        .then((detail) => {
          if (detail) {
            setFullBook(detail);
          }
        })
        .finally(() => setLoadingSections(false));
    }
  }, [book]);

  if (!book || !fullBook) return null;

  const isFav = isFavorite(book.id);
  const isCurrentlyPlayingThisBook = currentBook?.id === book.id && isPlaying;
  const authorName = getAuthorName(fullBook);
  const coverUrl = getBookCover(fullBook);
  const sections: Section[] = fullBook.sections || [];

  const handlePlayFirst = () => {
    if (currentBook?.id === book.id) {
      togglePlayPause();
    } else {
      playBook(fullBook, 0);
    }
  };

  const handlePlaySection = (index: number) => {
    if (currentBook?.id === book.id && currentSectionIndex === index) {
      togglePlayPause();
    } else {
      playBook(fullBook, index);
    }
  };

  const handleShare = () => {
    const bookUrl = `${window.location.origin}/libro/${encodeURIComponent(book.id)}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(bookUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleGoToFullPage = () => {
    onClose();
    navigate(`/libro/${encodeURIComponent(book.id)}`);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-950/90 backdrop-blur-md overflow-hidden animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl max-h-[90dvh] sm:max-h-[88dvh] flex flex-col bg-[#12100e] border border-stone-700 rounded-3xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={`Detalles de ${fullBook.title}`}
      >
        {/* Sticky Header Bar */}
        <div className="flex items-center justify-between px-5 sm:px-7 py-4 border-b border-stone-800 bg-[#0c0a09] shrink-0 z-20">
          <div className="flex items-center gap-2 text-xs font-mono tracking-wider text-[#FF9398] uppercase font-bold truncate pr-2">
            <span>FICHA DEL ARCHIVO</span>
            <span aria-hidden="true">&middot;</span>
            <span className="truncate">ID #{book.id}</span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleGoToFullPage}
              className="p-2.5 text-stone-300 hover:text-white rounded-xl hover:bg-stone-800 border border-stone-800 transition-colors cursor-pointer"
              title="Abrir página dedicada (URL permanente)"
              aria-label="Abrir página completa con URL permanente"
            >
              <Maximize2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button
              onClick={handleShare}
              className="p-2.5 text-stone-300 hover:text-white rounded-xl hover:bg-stone-800 border border-stone-800 transition-colors cursor-pointer"
              title="Copiar enlace"
              aria-label="Copiar enlace del audiolibro"
            >
              {copied ? <Check className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" /> : <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />}
            </button>
            <button
              onClick={onClose}
              className="p-2.5 text-stone-200 hover:text-white rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-700 transition-colors cursor-pointer"
              title="Cerrar ficha"
              aria-label="Cerrar ventana de detalles"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="overflow-y-auto p-5 sm:p-8 space-y-6 sm:space-y-8 flex-1 overscroll-contain">
          {/* Top Hero Section */}
          <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 items-start">
            {/* Book Cover */}
            <div className="w-36 sm:w-56 aspect-[3/4] bg-[#0c0a09] rounded-2xl overflow-hidden border border-stone-700 shrink-0 shadow-2xl mx-auto sm:mx-0">
              {coverUrl ? (
                <img
                  src={coverUrl}
                  alt={fullBook.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-[#0c0a09]">
                  <BookOpen className="w-10 h-10 text-[#FF9398] mb-2" />
                  <span className="font-serif text-sm font-semibold text-stone-200 line-clamp-3">
                    {fullBook.title}
                  </span>
                </div>
              )}
            </div>

            {/* Title & Metadata */}
            <div className="flex-1 space-y-3.5 w-full">
              <div>
                <h2 className="text-2xl sm:text-4xl font-serif font-light text-stone-100 leading-tight">
                  {fullBook.title}
                </h2>
                <p className="text-base sm:text-lg text-[#FF9398] font-sans font-medium mt-1">
                  {authorName}
                </p>
              </div>

              {/* Unboxed metadata tags */}
              <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm font-mono text-stone-300 font-medium">
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
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={handlePlayFirst}
                  className="pill-btn coral text-xs sm:text-sm py-2.5 px-5 cursor-pointer shadow-xl font-bold"
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
                        {currentBook?.id === book.id
                          ? 'Reanudar'
                          : 'Comenzar a escuchar'}
                      </span>
                    </>
                  )}
                  <span className="arr">&rarr;</span>
                </button>

                <button
                  onClick={() => toggleFavorite(book)}
                  className={`pill-btn ${isFav ? 'coral' : 'outline'} text-xs sm:text-sm py-2.5 px-4 cursor-pointer font-bold`}
                  aria-label={isFav ? 'Quitar de favoritos' : 'Añadir a mi colección'}
                >
                  <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
                  <span>{isFav ? 'Guardado' : 'Añadir a colección'}</span>
                </button>

                {currentBook?.id === book.id && (
                  <button
                    onClick={() => setIsExpanded(true)}
                    className="pill-btn outline text-xs sm:text-sm py-2.5 px-3.5 text-[#FF9398] cursor-pointer font-bold"
                  >
                    <Volume2 className="w-4 h-4" />
                    <span>Reproductor</span>
                  </button>
                )}
              </div>

              {/* External source links */}
              <div className="flex flex-wrap items-center gap-4 pt-1 text-xs sm:text-sm text-stone-300 font-mono font-medium">
                {fullBook.url_text_source && (
                  <a
                    href={fullBook.url_text_source}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 hover:text-[#FF9398] transition-colors"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Gutenberg</span>
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
                    <span>LibriVox.org</span>
                    <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Synopsis */}
          {fullBook.description && (
            <div className="space-y-2.5">
              <h3 className="text-xs sm:text-sm font-mono tracking-wider uppercase text-stone-300 font-bold">
                Sinopsis & Contexto
              </h3>
              <p
                className={`text-sm sm:text-base text-stone-200 leading-relaxed font-sans font-light whitespace-pre-line ${
                  !showFullDesc && fullBook.description.length > 300 ? 'line-clamp-4' : ''
                }`}
              >
                {fullBook.description}
              </p>
              {fullBook.description.length > 300 && (
                <button
                  onClick={() => setShowFullDesc(!showFullDesc)}
                  className="text-xs sm:text-sm font-mono text-[#FF9398] font-bold hover:underline cursor-pointer pt-0.5"
                >
                  {showFullDesc ? 'Leer menos' : 'Leer descripción completa...'}
                </button>
              )}
            </div>
          )}

          {/* Chapter / Section List */}
          <div className="space-y-3.5 pt-4 border-t border-stone-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ListMusic className="w-5 h-5 text-[#FF9398]" />
                <h3 className="text-base sm:text-lg font-serif font-medium text-stone-100">
                  Índice de Capítulos ({sections.length || fullBook.num_sections || 0})
                </h3>
              </div>
              {loadingSections && (
                <div className="flex items-center gap-2 text-xs font-mono text-stone-300 font-medium">
                  <Loader2 className="w-4 h-4 animate-spin text-[#FF9398]" />
                  <span>Cargando pistas de audio...</span>
                </div>
              )}
            </div>

            {loadingSections && sections.length === 0 ? (
              <div className="p-8 text-center bg-[#0c0a09] rounded-2xl border border-stone-800">
                <Loader2 className="w-8 h-8 animate-spin text-[#FF9398] mx-auto mb-2" />
                <p className="text-xs sm:text-sm font-mono text-stone-300">
                  Obteniendo capítulos y pistas MP3 desde Internet Archive...
                </p>
              </div>
            ) : sections.length > 0 ? (
              <div className="divide-y divide-stone-800 border border-stone-700 rounded-2xl overflow-hidden bg-[#0c0a09] max-h-80 overflow-y-auto">
                {sections.map((section, idx) => {
                  const isCurrentSection =
                    currentBook?.id === fullBook.id && currentSectionIndex === idx;
                  const isSectionPlaying = isCurrentSection && isPlaying;
                  const readerName = section.readers?.[0]?.display_name;

                  return (
                    <div
                      key={section.id || idx}
                      onClick={() => handlePlaySection(idx)}
                      className={`flex items-center justify-between p-3.5 sm:p-4 hover:bg-stone-900 transition-colors cursor-pointer group ${
                        isCurrentSection ? 'bg-[#FF9398]/15' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0 pr-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePlaySection(idx);
                          }}
                          aria-label={`Reproducir pista ${idx + 1}: ${section.title || ''}`}
                          className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-transform cursor-pointer ${
                            isCurrentSection
                              ? 'bg-[#FF9398] text-stone-950 scale-105'
                              : 'bg-stone-800 text-stone-200 group-hover:bg-[#FF9398] group-hover:text-stone-950'
                          }`}
                        >
                          {isSectionPlaying ? (
                            <Pause className="w-4 h-4 fill-current" />
                          ) : (
                            <Play className="w-4 h-4 fill-current translate-x-0.5" />
                          )}
                        </button>

                        <div className="min-w-0">
                          <h4
                            className={`text-sm sm:text-base truncate font-sans ${
                              isCurrentSection ? 'text-[#FF9398] font-semibold' : 'text-stone-100 font-medium'
                            }`}
                          >
                            {section.title || `Capítulo ${idx + 1}`}
                          </h4>
                          <div className="flex items-center gap-2 text-xs text-stone-400 font-mono mt-0.5">
                            <span className="font-semibold">Pista {idx + 1}</span>
                            {readerName && (
                              <>
                                <span aria-hidden="true">&middot;</span>
                                <span className="truncate text-stone-300">Voz: {readerName}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="text-xs sm:text-sm font-mono text-stone-300 tabular-nums shrink-0 font-medium">
                        {section.playtime ? formatDuration(section.playtime) : ''}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-6 text-center bg-[#0c0a09] rounded-2xl border border-stone-800">
                <p className="text-xs sm:text-sm font-mono text-stone-300">
                  Haz clic en &ldquo;Comenzar a escuchar&rdquo; para iniciar el streaming directo.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Sticky Footer */}
        <div className="flex items-center justify-between px-5 sm:px-7 py-3.5 border-t border-stone-800 bg-[#0c0a09] shrink-0 text-xs sm:text-sm font-mono text-stone-300">
          <button
            onClick={handleGoToFullPage}
            className="text-stone-300 hover:text-[#FF9398] transition-colors flex items-center gap-1.5 cursor-pointer font-medium"
          >
            <span>Ver página completa y compartir</span>
            <ExternalLink className="w-4 h-4" />
          </button>

          <button
            onClick={onClose}
            className="pill-btn outline text-xs sm:text-sm py-2 px-5 cursor-pointer font-bold"
          >
            <span>Cerrar</span>
          </button>
        </div>
      </div>
    </div>
  );
};
