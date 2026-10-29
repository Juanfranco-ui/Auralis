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
        className="relative w-full max-w-4xl max-h-[88dvh] sm:max-h-[86dvh] flex flex-col bg-[#12100e] border border-stone-800 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={`Detalles de ${fullBook.title}`}
      >
        {/* Sticky Header Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-stone-800/80 bg-[#0c0a09] shrink-0 z-20">
          <div className="flex items-center gap-2 text-[10px] font-mono tracking-[0.24em] text-[#FF9398] uppercase truncate pr-2">
            <span>FICHA DEL ARCHIVO</span>
            <span aria-hidden="true">&middot;</span>
            <span className="truncate">ID #{book.id}</span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={handleGoToFullPage}
              className="p-2 text-stone-400 hover:text-stone-200 rounded-lg hover:bg-stone-900 transition-colors cursor-pointer"
              title="Abrir página dedicada (URL permanente)"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleShare}
              className="p-2 text-stone-400 hover:text-stone-200 rounded-lg hover:bg-stone-900 transition-colors cursor-pointer"
              title="Copiar enlace"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 text-stone-300 hover:text-white rounded-lg bg-stone-900 hover:bg-stone-800 transition-colors cursor-pointer"
              title="Cerrar ficha"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="overflow-y-auto p-4 sm:p-8 space-y-6 sm:space-y-8 flex-1 overscroll-contain">
          {/* Top Hero Section */}
          <div className="flex flex-col sm:flex-row gap-5 sm:gap-8 items-start">
            {/* Book Cover */}
            <div className="w-32 sm:w-52 aspect-[3/4] bg-[#0c0a09] rounded-2xl overflow-hidden border border-stone-800 shrink-0 shadow-2xl mx-auto sm:mx-0">
              {coverUrl ? (
                <img
                  src={coverUrl}
                  alt={fullBook.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-[#0c0a09]">
                  <BookOpen className="w-8 h-8 text-[#FF9398]/40 mb-2" />
                  <span className="font-serif text-xs font-semibold text-stone-300 line-clamp-3">
                    {fullBook.title}
                  </span>
                </div>
              )}
            </div>

            {/* Title & Metadata */}
            <div className="flex-1 space-y-3 w-full">
              <div>
                <h2 className="text-xl sm:text-3xl font-serif font-light text-stone-100 leading-tight">
                  {fullBook.title}
                </h2>
                <p className="text-sm sm:text-base text-[#FF9398] font-sans font-medium mt-1">
                  {authorName}
                </p>
              </div>

              {/* Unboxed metadata tags */}
              <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-stone-400">
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
              <div className="flex flex-wrap items-center gap-2.5 pt-2">
                <button
                  onClick={handlePlayFirst}
                  className="pill-btn coral text-xs py-2.5 px-5 cursor-pointer shadow-xl"
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
                  className={`pill-btn ${isFav ? 'coral' : 'outline'} text-xs py-2 px-4 cursor-pointer`}
                >
                  <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-current' : ''}`} />
                  <span>{isFav ? 'Guardado' : 'Añadir a colección'}</span>
                </button>

                {currentBook?.id === book.id && (
                  <button
                    onClick={() => setIsExpanded(true)}
                    className="pill-btn outline text-xs py-2 px-3 text-[#FF9398] cursor-pointer"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Reproductor</span>
                  </button>
                )}
              </div>

              {/* External source links */}
              <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-stone-400 font-mono">
                {fullBook.url_text_source && (
                  <a
                    href={fullBook.url_text_source}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:text-[#FF9398] transition-colors"
                  >
                    <BookOpen className="w-3 h-3" />
                    <span>Gutenberg</span>
                    <ExternalLink className="w-3 h-3 ml-0.5" />
                  </a>
                )}
                {fullBook.url_librivox && (
                  <a
                    href={fullBook.url_librivox}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:text-[#FF9398] transition-colors"
                  >
                    <span>LibriVox.org</span>
                    <ExternalLink className="w-3 h-3 ml-0.5" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Synopsis */}
          {fullBook.description && (
            <div className="space-y-2">
              <h3 className="text-xs font-mono tracking-wider uppercase text-stone-400 font-semibold">
                Sinopsis & Contexto
              </h3>
              <p
                className={`text-sm text-stone-300 leading-relaxed font-sans font-light whitespace-pre-line ${
                  !showFullDesc && fullBook.description.length > 300 ? 'line-clamp-4' : ''
                }`}
              >
                {fullBook.description}
              </p>
              {fullBook.description.length > 300 && (
                <button
                  onClick={() => setShowFullDesc(!showFullDesc)}
                  className="text-xs font-mono text-[#FF9398] hover:underline cursor-pointer pt-0.5"
                >
                  {showFullDesc ? 'Leer menos' : 'Leer descripción completa...'}
                </button>
              )}
            </div>
          )}

          {/* Chapter / Section List */}
          <div className="space-y-3 pt-3 border-t border-stone-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ListMusic className="w-4 h-4 text-[#FF9398]" />
                <h3 className="text-base font-serif font-medium text-stone-200">
                  Índice de Capítulos ({sections.length || fullBook.num_sections || 0})
                </h3>
              </div>
              {loadingSections && (
                <div className="flex items-center gap-2 text-xs font-mono text-stone-400">
                  <Loader2 className="w-3 h-3 animate-spin text-[#FF9398]" />
                  <span>Cargando pistas de audio...</span>
                </div>
              )}
            </div>

            {loadingSections && sections.length === 0 ? (
              <div className="p-8 text-center bg-[#0c0a09] rounded-2xl border border-stone-800">
                <Loader2 className="w-6 h-6 animate-spin text-[#FF9398] mx-auto mb-2" />
                <p className="text-xs font-mono text-stone-400">
                  Obteniendo capítulos y pistas MP3 desde Internet Archive...
                </p>
              </div>
            ) : sections.length > 0 ? (
              <div className="divide-y divide-stone-800/80 border border-stone-800 rounded-2xl overflow-hidden bg-[#0c0a09] max-h-72 overflow-y-auto">
                {sections.map((section, idx) => {
                  const isCurrentSection =
                    currentBook?.id === fullBook.id && currentSectionIndex === idx;
                  const isSectionPlaying = isCurrentSection && isPlaying;
                  const readerName = section.readers?.[0]?.display_name;

                  return (
                    <div
                      key={section.id || idx}
                      onClick={() => handlePlaySection(idx)}
                      className={`flex items-center justify-between p-3.5 hover:bg-stone-900 transition-colors cursor-pointer group ${
                        isCurrentSection ? 'bg-[#FF9398]/10' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0 pr-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePlaySection(idx);
                          }}
                          className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform cursor-pointer ${
                            isCurrentSection
                              ? 'bg-[#FF9398] text-stone-950 scale-105'
                              : 'bg-stone-800 text-stone-300 group-hover:bg-[#FF9398] group-hover:text-stone-950'
                          }`}
                        >
                          {isSectionPlaying ? (
                            <Pause className="w-3.5 h-3.5 fill-current" />
                          ) : (
                            <Play className="w-3.5 h-3.5 fill-current translate-x-0.5" />
                          )}
                        </button>

                        <div className="min-w-0">
                          <h4
                            className={`text-sm truncate font-sans ${
                              isCurrentSection ? 'text-[#FF9398] font-medium' : 'text-stone-200'
                            }`}
                          >
                            {section.title || `Capítulo ${idx + 1}`}
                          </h4>
                          <div className="flex items-center gap-2 text-[11px] text-stone-500 font-mono mt-0.5">
                            <span>Pista {idx + 1}</span>
                            {readerName && (
                              <>
                                <span aria-hidden="true">&middot;</span>
                                <span className="truncate">Voz: {readerName}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="text-xs font-mono text-stone-400 tabular-nums shrink-0">
                        {section.playtime ? formatDuration(section.playtime) : ''}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-6 text-center bg-[#0c0a09] rounded-2xl border border-stone-800">
                <p className="text-xs font-mono text-stone-400">
                  Haz clic en &ldquo;Comenzar a escuchar&rdquo; para iniciar el streaming directo.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Sticky Footer */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-t border-stone-800 bg-[#0c0a09] shrink-0 text-xs font-mono text-stone-400">
          <button
            onClick={handleGoToFullPage}
            className="text-stone-400 hover:text-[#FF9398] transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span>Ver página completa y compartir</span>
            <ExternalLink className="w-3 h-3" />
          </button>

          <button
            onClick={onClose}
            className="pill-btn outline text-xs py-1.5 px-4 cursor-pointer"
          >
            <span>Cerrar</span>
          </button>
        </div>
      </div>
    </div>
  );
};
