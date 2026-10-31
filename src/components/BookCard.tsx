import React, { useState } from 'react';
import { Play, Pause, Heart, Clock, BookOpen, Disc3 } from 'lucide-react';
import { Book } from '../types/audiobook';
import { useAudioPlayer } from '../context/AudioPlayerContext';
import { getAuthorName, getBookCover, formatDuration } from '../services/librivoxApi';

interface BookCardProps {
  book: Book;
  onSelect: (book: Book) => void;
}

export const BookCard: React.FC<BookCardProps> = ({ book, onSelect }) => {
  const { currentBook, isPlaying, playBook, togglePlayPause, toggleFavorite, isFavorite } =
    useAudioPlayer();

  const [imageError, setImageError] = useState(false);
  const isCurrentBook = currentBook?.id === book.id;
  const isFav = isFavorite(book.id);
  const coverUrl = getBookCover(book);
  const authorName = getAuthorName(book);

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCurrentBook) {
      togglePlayPause();
    } else {
      playBook(book);
    }
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(book);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(book);
    }
  };

  return (
    <article
      onClick={() => onSelect(book)}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`Ver detalles de ${book.title} de ${authorName}`}
      className="group relative flex flex-col bg-[#12100e] border border-stone-700/80 hover:border-[#FF9398] rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/80 focus-visible:ring-2 focus-visible:ring-[#FF9398] focus-visible:outline-none max-w-sm sm:max-w-none mx-auto w-full"
    >
      {/* Cover Image slot with accessible fallback */}
      <div className="relative aspect-[3/4] w-full bg-[#0a0908] overflow-hidden flex items-center justify-center">
        {coverUrl && !imageError ? (
          <img
            src={coverUrl}
            alt={`Portada ilustrada de ${book.title}`}
            onError={() => setImageError(true)}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105 group-hover:contrast-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full p-5 flex flex-col items-center justify-between text-center bg-gradient-to-b from-stone-900 via-[#0f0e0c] to-[#0a0908] border border-stone-800">
            <div className="text-xs font-mono tracking-wider text-[#FF9398] uppercase font-bold">
              {book.language || 'Dominio Público'}
            </div>
            <div className="space-y-1.5 my-auto">
              <BookOpen className="w-8 h-8 text-[#FF9398] mx-auto mb-2 opacity-80" />
              <h4 className="font-serif text-sm sm:text-base font-semibold text-stone-100 line-clamp-3 leading-snug">
                {book.title}
              </h4>
              <p className="text-xs sm:text-sm text-stone-300 font-sans line-clamp-1">{authorName}</p>
            </div>
            <div className="text-xs text-stone-400 font-mono tracking-wider uppercase font-semibold">
              LibriVox Press
            </div>
          </div>
        )}

        {/* Favorite toggle button (44x44px touch target) */}
        <button
          onClick={handleFavoriteClick}
          aria-label={isFav ? `Quitar ${book.title} de favoritos` : `Guardar ${book.title} en favoritos`}
          className={`absolute top-2.5 right-2.5 w-11 h-11 flex items-center justify-center rounded-full backdrop-blur-md transition-all focus-visible:ring-2 focus-visible:ring-[#FF9398] cursor-pointer ${
            isFav
              ? 'bg-[#FF9398] text-stone-950 shadow-lg'
              : 'bg-stone-950/80 text-stone-200 hover:text-white hover:bg-stone-900 border border-stone-700/60'
          }`}
        >
          <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
        </button>

        {/* Floating Quick Play Overlay */}
        <div className="absolute inset-0 bg-stone-950/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
          <button
            onClick={handlePlayClick}
            aria-label={isCurrentBook && isPlaying ? `Pausar ${book.title}` : `Reproducir ${book.title}`}
            className="pointer-events-auto w-14 h-14 rounded-full bg-[#FF9398] text-stone-950 flex items-center justify-center shadow-2xl transform group-hover:scale-105 active:scale-95 transition-all hover:bg-white cursor-pointer font-bold"
          >
            {isCurrentBook && isPlaying ? (
              <Pause className="w-6 h-6 fill-current" />
            ) : (
              <Play className="w-6 h-6 fill-current translate-x-0.5" />
            )}
          </button>
        </div>

        {/* Active playing indicator badge */}
        {isCurrentBook && isPlaying && (
          <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5 px-3 py-1 bg-stone-950/95 backdrop-blur-md border border-[#FF9398] rounded-full text-[#FF9398] text-xs font-mono font-bold tracking-wider uppercase shadow-md">
            <Disc3 className="w-3.5 h-3.5 animate-spin" />
            <span>Sonando</span>
          </div>
        )}
      </div>

      {/* Card Content & Metadata */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between bg-[#12100e]">
        <div>
          <h3 className="font-serif font-medium text-stone-100 text-base sm:text-lg leading-snug line-clamp-2 group-hover:text-[#FF9398] transition-colors">
            {book.title}
          </h3>
          <p className="text-xs sm:text-sm text-stone-300 font-sans mt-1 line-clamp-1 font-normal tracking-wide">
            {authorName}
          </p>
        </div>

        {/* Clean unboxed metadata with high contrast */}
        <div className="mt-4 pt-3 border-t border-stone-800 flex items-center justify-between text-xs text-stone-300 font-mono font-medium">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-stone-400" />
            <span className="tabular-nums">
              {book.totaltime || formatDuration(book.totaltimesecs)}
            </span>
          </div>
          <div className="flex items-center gap-1 text-stone-300">
            <span>{book.num_sections || '1'} cap.</span>
            <span aria-hidden="true">&middot;</span>
            <span className="text-[#FF9398] font-bold">
              {book.language === 'Spanish' ? 'ES' : book.language === 'English' ? 'EN' : 'LIB'}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
};
