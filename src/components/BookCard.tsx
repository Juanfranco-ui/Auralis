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

  return (
    <article
      onClick={() => onSelect(book)}
      className="group relative flex flex-col bg-[#12100e] border border-stone-800/80 hover:border-[#FF9398]/60 rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-black/70"
    >
      {/* Cover Image slot with fallback container */}
      <div className="relative aspect-[3/4] w-full bg-[#0a0908] overflow-hidden flex items-center justify-center">
        {coverUrl && !imageError ? (
          <img
            src={coverUrl}
            alt={`Portada de ${book.title}`}
            onError={() => setImageError(true)}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105 group-hover:contrast-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full p-6 flex flex-col items-center justify-between text-center bg-gradient-to-b from-stone-900 via-[#0f0e0c] to-[#0a0908] border border-stone-800">
            <div className="text-[10px] font-mono tracking-[0.2em] text-[#FF9398] uppercase">
              {book.language || 'Dominio Público'}
            </div>
            <div className="space-y-1 my-auto">
              <BookOpen className="w-7 h-7 text-[#FF9398]/40 mx-auto mb-2" />
              <h4 className="font-serif text-sm font-semibold text-stone-200 line-clamp-3 leading-snug">
                {book.title}
              </h4>
              <p className="text-xs text-stone-400 font-sans line-clamp-1">{authorName}</p>
            </div>
            <div className="text-[10px] text-stone-600 font-mono tracking-widest uppercase">
              LibriVox Press
            </div>
          </div>
        )}

        {/* Favorite toggle button */}
        <button
          onClick={handleFavoriteClick}
          aria-label={isFav ? 'Quitar de favoritos' : 'Añadir a favoritos'}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all ${
            isFav
              ? 'bg-[#FF9398] text-stone-950 shadow-md'
              : 'bg-stone-950/60 text-stone-300 hover:text-white hover:bg-stone-900'
          }`}
        >
          <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-current' : ''}`} />
        </button>

        {/* Floating Quick Play Overlay (Awwwards round button) */}
        <div className="absolute inset-0 bg-stone-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
          <button
            onClick={handlePlayClick}
            aria-label={isCurrentBook && isPlaying ? 'Pausar' : 'Reproducir audiolibro'}
            className="pointer-events-auto w-12 h-12 rounded-full bg-[#FF9398] text-stone-950 flex items-center justify-center shadow-xl transform group-hover:scale-110 active:scale-95 transition-all hover:bg-white"
          >
            {isCurrentBook && isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current translate-x-0.5" />
            )}
          </button>
        </div>

        {/* Active playing indicator badge */}
        {isCurrentBook && isPlaying && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-1 bg-stone-950/90 backdrop-blur-md border border-[#FF9398]/40 rounded-full text-[#FF9398] text-[10px] font-mono tracking-wider uppercase">
            <Disc3 className="w-3 h-3 animate-spin" />
            <span>Sonando</span>
          </div>
        )}
      </div>

      {/* Card Content & Metadata */}
      <div className="p-4 flex flex-col flex-1 justify-between bg-[#12100e]">
        <div>
          <h3 className="font-serif font-medium text-stone-100 text-base leading-snug line-clamp-1 group-hover:text-[#FF9398] transition-colors">
            {book.title}
          </h3>
          <p className="text-xs text-stone-400 font-sans mt-1 line-clamp-1 font-light tracking-wide">
            {authorName}
          </p>
        </div>

        {/* Clean unboxed metadata with typographic separators */}
        <div className="mt-4 pt-3 border-t border-stone-800/80 flex items-center justify-between text-[11px] text-stone-400 font-mono">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3 h-3 text-stone-500" />
            <span className="tabular-nums">
              {book.totaltime || formatDuration(book.totaltimesecs)}
            </span>
          </div>
          <div className="flex items-center gap-1 text-stone-400">
            <span>{book.num_sections || '1'} cap.</span>
            <span aria-hidden="true">&middot;</span>
            <span className="text-[#FF9398]/90">
              {book.language === 'Spanish' ? 'ES' : book.language === 'English' ? 'EN' : 'LIB'}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
};
