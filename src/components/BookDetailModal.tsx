import React, { useState, useEffect } from 'react';
import {
  X,
  BookOpen,
  Play,
  Pause,
  Heart,
  ListMusic,
  Loader2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Book, Section } from '../types/audiobook';
import { useAudioPlayer } from '../context/AudioPlayerContext';
import {
  decodeHtmlEntities,
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
          if (detail) setFullBook(detail);
        })
        .finally(() => setLoadingSections(false));
    }
  }, [book]);

  if (!book || !fullBook) return null;

  const isFav = isFavorite(book.id);
  const isCurrentlyPlayingThisBook = currentBook?.id === book.id && isPlaying;
  const coverUrl = getBookCover(fullBook);
  const authorName = getAuthorName(fullBook);
  const sections: Section[] = fullBook.sections || [];

  const handlePlayFirst = () => {
    if (currentBook?.id === book.id) {
      setIsExpanded(true);
      togglePlayPause();
    } else {
      playBook(fullBook, 0);
    }
  };

  const handlePlaySection = (index: number) => {
    if (currentBook?.id === book.id && currentSectionIndex === index) {
      setIsExpanded(true);
      togglePlayPause();
    } else {
      playBook(fullBook, index);
    }
  };

  const handleGoToFullPage = () => {
    onClose();
    navigate(`/libro/${encodeURIComponent(book.id)}`);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/90 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md max-h-[80dvh] flex flex-col bg-[#12100e] rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={`Detalles de ${fullBook.title}`}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-20 p-1.5 text-stone-400 hover:text-white rounded-md hover:bg-stone-800 transition-colors"
          aria-label="Cerrar"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 overscroll-contain">
          {/* Cover */}
          <div className="flex justify-center pt-6 pb-4">
            <div className="w-24 aspect-[3/4] bg-[#0c0a09] rounded-lg overflow-hidden border border-stone-700 shadow-md">
              {coverUrl ? (
                <img src={coverUrl} alt={fullBook.title} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center">
                  <BookOpen className="w-8 h-8 text-[#FF9398] mb-1.5" />
                  <span className="font-serif text-xs font-semibold text-stone-200 line-clamp-3">{fullBook.title}</span>
                </div>
              )}
            </div>
          </div>

          {/* Title & Meta */}
          <div className="px-5 space-y-3">
            <div className="text-center">
              <h2 className="text-base font-serif font-light text-stone-100 leading-snug">{fullBook.title}</h2>
              <p className="text-xs text-[#FF9398] font-medium mt-0.5">{authorName}</p>
            </div>

            <div className="flex items-center justify-center gap-2 text-xs font-mono text-stone-400">
              <span>{fullBook.language || 'Dominio Público'}</span>
              <span aria-hidden="true">·</span>
              <span>{fullBook.totaltime || formatDuration(fullBook.totaltimesecs)}</span>
              <span aria-hidden="true">·</span>
              <span>{sections.length || fullBook.num_sections || 1} capítulos</span>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={handlePlayFirst}
                className={`pill-btn coral text-xs font-bold py-1.5 px-4 shadow-md`}
              >
                {isCurrentlyPlayingThisBook ? (
                  <><Pause className="w-3.5 h-3.5 fill-current" /><span>Pausar</span></>
                ) : (
                  <><Play className="w-3.5 h-3.5 fill-current translate-x-0.5" /><span>Escuchar</span></>
                )}
              </button>
              <button
                onClick={() => toggleFavorite(book)}
                className={`pill-btn ${isFav ? 'coral' : 'outline'} text-xs py-1.5 px-3 font-bold`}
              >
                <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-current' : ''}`} />
              </button>
              {currentBook?.id === book.id && (
                <button
                  onClick={() => setIsExpanded(true)}
                  className="pill-btn outline text-xs py-1.5 px-3 text-[#FF9398] font-bold"
                >
                  Reproductor
                </button>
              )}
            </div>

            {/* Chapters */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center gap-2 pb-2">
                <ListMusic className="w-3.5 h-3.5 text-[#FF9398] shrink-0" />
                <h3 className="text-xs font-medium text-stone-200">Capítulos</h3>
                {loadingSections && (
                  <div className="flex items-center gap-1 text-xs font-mono text-stone-400 ml-auto">
                    <Loader2 className="w-3 h-3 animate-spin text-[#FF9398]" />
                  </div>
                )}
              </div>

              {loadingSections && sections.length === 0 ? (
                <div className="py-6 text-center">
                  <Loader2 className="w-5 h-5 animate-spin text-[#FF9398] mx-auto mb-1" />
                  <p className="text-xs font-mono text-stone-400">Cargando...</p>
                </div>
              ) : sections.length > 0 ? (
                <div className="space-y-0.5">
                  {sections.map((section, idx) => {
                    const isCurrentSection = book.id && currentSectionIndex === idx;
                    const isSectionPlaying = isCurrentSection && isPlaying;
                    return (
                      <div
                        key={section.id || idx}
                        onClick={() => handlePlaySection(idx)}
                        className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-stone-900/60 transition-colors cursor-pointer ${
                          isCurrentSection ? 'bg-[#FF9398]/10' : ''
                        }`}
                      >
                        <button
                          onClick={(e) => { e.stopPropagation(); handlePlaySection(idx); }}
                          className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                            isCurrentSection
                              ? 'bg-[#FF9398] text-stone-950'
                              : 'bg-stone-800 text-stone-300 hover:bg-[#FF9398] hover:text-stone-950'
                          }`}
                        >
                          {isSectionPlaying ? (
                            <Pause className="w-2.5 h-2.5 fill-current" />
                          ) : (
                            <Play className="w-2.5 h-2.5 fill-current translate-x-0.5" />
                          )}
                        </button>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className={`text-xs truncate ${
                              isCurrentSection ? 'text-[#FF9398] font-medium' : 'text-stone-200'
                            }`}>
                              {decodeHtmlEntities(section.title) || `Capítulo ${idx + 1}`}
                            </span>
                            {section.playtime && (
                              <span className="text-xs font-mono text-stone-500 tabular-nums shrink-0">
                                {formatDuration(section.playtime)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-4 text-center">
                  <p className="text-xs font-mono text-stone-400">Presiona "Escuchar" para reproducir.</p>
                </div>
              )}
            </div>

            {/* Full page link */}
            <div className="flex justify-center pt-1 pb-1">
              <button
                onClick={handleGoToFullPage}
                className="text-xs font-mono text-stone-500 hover:text-[#FF9398] transition-colors py-1.5"
              >
                Ver página completa →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
