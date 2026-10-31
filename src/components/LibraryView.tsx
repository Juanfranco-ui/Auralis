import React, { useState } from 'react';
import {
  History,
  Heart,
  Bookmark as BookmarkIcon,
  Play,
  Trash2,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { useAudioPlayer } from '../context/AudioPlayerContext';
import { BookCard } from './BookCard';
import {
  getAuthorName,
  getBookCover,
  formatPlayerTime,
} from '../services/librivoxApi';
import { Book } from '../types/audiobook';

interface LibraryViewProps {
  onSelectBook: (book: Book) => void;
  onExploreClick: () => void;
}

export const LibraryView: React.FC<LibraryViewProps> = ({
  onSelectBook,
  onExploreClick,
}) => {
  const { history, favorites, bookmarks, playBook, removeBookmark } = useAudioPlayer();
  const [activeSubTab, setActiveSubTab] = useState<'history' | 'favorites' | 'bookmarks'>(
    'history'
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header Lockup */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-stone-800 pb-6">
        <div>
          <div className="text-xs font-mono tracking-wider text-[#FF9398] uppercase font-bold">
            REGISTRO PERSONAL
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-light text-stone-100 mt-1">
            Mi Colección
          </h2>
          <p className="text-sm sm:text-base text-stone-300 font-sans font-light mt-1">
            Historial de audición, marcadores y obras guardadas en el navegador.
          </p>
        </div>

        {/* Subtabs Filter */}
        <div className="flex items-center gap-2 p-1.5 bg-[#12100e] border border-stone-700 rounded-2xl self-start sm:self-auto text-xs sm:text-sm font-mono">
          <button
            onClick={() => setActiveSubTab('history')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer font-bold ${
              activeSubTab === 'history'
                ? 'bg-[#FF9398] text-stone-950 shadow-md'
                : 'text-stone-300 hover:text-white'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Continuar ({history.length})</span>
          </button>
          <button
            onClick={() => setActiveSubTab('favorites')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer font-bold ${
              activeSubTab === 'favorites'
                ? 'bg-[#FF9398] text-stone-950 shadow-md'
                : 'text-stone-300 hover:text-white'
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>Favoritos ({favorites.length})</span>
          </button>
          <button
            onClick={() => setActiveSubTab('bookmarks')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer font-bold ${
              activeSubTab === 'bookmarks'
                ? 'bg-[#FF9398] text-stone-950 shadow-md'
                : 'text-stone-300 hover:text-white'
            }`}
          >
            <BookmarkIcon className="w-4 h-4" />
            <span>Notas ({bookmarks.length})</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Continue Listening / History */}
      {activeSubTab === 'history' && (
        <div>
          {history.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {history.map((item) => {
                const book = item.book;
                const authorName = getAuthorName(book);
                const coverUrl = getBookCover(book);
                const currentSecTitle =
                  book.sections?.[item.currentSectionIndex]?.title ||
                  `Capítulo ${item.currentSectionIndex + 1}`;

                return (
                  <div
                    key={book.id}
                    className="p-5 bg-[#12100e] border border-stone-700 rounded-2xl hover:border-[#FF9398] transition-all flex gap-4 group shadow-md"
                  >
                    <div
                      onClick={() => onSelectBook(book)}
                      className="w-22 h-30 bg-[#0c0a09] rounded-xl overflow-hidden shrink-0 border border-stone-700 cursor-pointer shadow-md"
                    >
                      {coverUrl ? (
                        <img
                          src={coverUrl}
                          alt={book.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#FF9398] text-xs font-mono font-bold">
                          Audio
                        </div>
                      )}
                    </div>

                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        <h3
                          onClick={() => onSelectBook(book)}
                          className="font-serif font-medium text-stone-100 text-base truncate hover:text-[#FF9398] cursor-pointer transition-colors"
                        >
                          {book.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-stone-300 font-sans truncate mt-0.5">
                          {authorName}
                        </p>
                        <div className="text-xs text-[#FF9398] font-mono font-bold mt-1.5 truncate">
                          Pista {item.currentSectionIndex + 1}: {currentSecTitle}
                        </div>
                      </div>

                      <div className="space-y-2 mt-3">
                        {/* Progress Bar */}
                        <div className="w-full bg-stone-800 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-[#FF9398] h-full rounded-full"
                            style={{ width: `${Math.min(100, Math.max(3, item.completedPercentage))}%` }}
                          />
                        </div>

                        <div className="flex items-center justify-between text-xs sm:text-sm text-stone-300 font-mono font-medium">
                          <span>
                            {formatPlayerTime(item.currentTime)}
                          </span>
                          <button
                            onClick={() =>
                              playBook(book, item.currentSectionIndex, item.currentTime)
                            }
                            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#FF9398] text-stone-950 font-bold rounded-lg transition-transform hover:scale-105 cursor-pointer text-xs"
                          >
                            <Play className="w-3.5 h-3.5 fill-current" />
                            <span>Reanudar</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20 bg-[#12100e] rounded-3xl border border-stone-700 p-8 space-y-4 max-w-md mx-auto">
              <History className="w-10 h-10 mx-auto text-stone-500" />
              <h3 className="text-lg font-serif font-medium text-stone-100">
                Tu historial de audición está vacío
              </h3>
              <p className="text-sm text-stone-300 font-sans">
                Cuando comiences a reproducir historias, guardaremos tu progreso exacto automáticamente aquí.
              </p>
              <button
                onClick={onExploreClick}
                className="pill-btn coral text-xs sm:text-sm py-2 px-5 cursor-pointer font-bold inline-flex"
              >
                <span>Explorar catálogo</span>
                <span className="arr">&rarr;</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Favorites */}
      {activeSubTab === 'favorites' && (
        <div>
          {favorites.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
              {favorites.map((book) => (
                <BookCard
                  key={book.id}
                  book={book}
                  onSelect={onSelectBook}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-[#12100e] rounded-3xl border border-stone-700 p-8 space-y-4 max-w-md mx-auto">
              <Heart className="w-10 h-10 mx-auto text-stone-500" />
              <h3 className="text-lg font-serif font-medium text-stone-100">
                Aún no tienes favoritos
              </h3>
              <p className="text-sm text-stone-300 font-sans">
                Haz clic en el icono del corazón en cualquier audiolibro para guardarlo en tu colección permanente.
              </p>
              <button
                onClick={onExploreClick}
                className="pill-btn coral text-xs sm:text-sm py-2 px-5 cursor-pointer font-bold inline-flex"
              >
                <span>Descubrir audiolibros</span>
                <span className="arr">&rarr;</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Bookmarks & Notes */}
      {activeSubTab === 'bookmarks' && (
        <div>
          {bookmarks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bookmarks.map((bm) => (
                <div
                  key={bm.id}
                  className="p-5 bg-[#12100e] border border-stone-700 rounded-2xl flex items-start justify-between gap-4"
                >
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#FF9398]">
                      <Clock className="w-4 h-4 shrink-0" />
                      <span>{formatPlayerTime(bm.timestamp)}</span>
                      <span className="text-stone-500">&middot;</span>
                      <span className="truncate text-stone-300">{bm.sectionTitle}</span>
                    </div>

                    <h4 className="text-base font-serif font-medium text-stone-100 truncate">
                      {bm.bookTitle}
                    </h4>

                    {bm.note && (
                      <p className="text-sm text-stone-300 font-sans bg-[#0c0a09] p-3 rounded-xl border border-stone-800">
                        {bm.note}
                      </p>
                    )}

                    <div className="pt-1">
                      <button
                        onClick={() => {
                          const matchingBook = history.find((h) => h.book.id === bm.bookId)?.book ||
                            favorites.find((f) => f.id === bm.bookId);
                          if (matchingBook) {
                            playBook(matchingBook, bm.sectionIndex, bm.timestamp);
                          }
                        }}
                        className="text-xs sm:text-sm font-mono text-[#FF9398] font-bold hover:underline cursor-pointer flex items-center gap-1"
                      >
                        <span>Escuchar desde este momento</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => removeBookmark(bm.id)}
                    className="p-2.5 text-stone-400 hover:text-rose-400 rounded-xl hover:bg-stone-900 transition-colors cursor-pointer"
                    title="Eliminar marcador"
                    aria-label="Eliminar marcador"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-[#12100e] rounded-3xl border border-stone-700 p-8 space-y-4 max-w-md mx-auto">
              <BookmarkIcon className="w-10 h-10 mx-auto text-stone-500" />
              <h3 className="text-lg font-serif font-medium text-stone-100">
                No tienes notas ni marcadores
              </h3>
              <p className="text-sm text-stone-300 font-sans">
                Puedes guardar cualquier segundo exacto con notas de audio personales desde el reproductor.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
