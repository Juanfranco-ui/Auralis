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
          <div className="text-[10px] font-mono tracking-[0.28em] text-[#FF9398] uppercase">
            REGISTRO PERSONAL
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-light text-stone-100 mt-1">
            Mi Colección
          </h2>
          <p className="text-sm text-stone-400 font-sans font-light mt-1">
            Historial de audición, marcadores y obras guardadas en el navegador.
          </p>
        </div>

        {/* Subtabs Filter */}
        <div className="flex items-center gap-2 p-1.5 bg-[#12100e] border border-stone-800 rounded-2xl self-start sm:self-auto text-xs font-mono">
          <button
            onClick={() => setActiveSubTab('history')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all cursor-pointer ${
              activeSubTab === 'history'
                ? 'bg-[#FF9398] text-stone-950 font-bold shadow-md'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Continuar ({history.length})</span>
          </button>
          <button
            onClick={() => setActiveSubTab('favorites')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all cursor-pointer ${
              activeSubTab === 'favorites'
                ? 'bg-[#FF9398] text-stone-950 font-bold shadow-md'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Heart className="w-3.5 h-3.5" />
            <span>Favoritos ({favorites.length})</span>
          </button>
          <button
            onClick={() => setActiveSubTab('bookmarks')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all cursor-pointer ${
              activeSubTab === 'bookmarks'
                ? 'bg-[#FF9398] text-stone-950 font-bold shadow-md'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <BookmarkIcon className="w-3.5 h-3.5" />
            <span>Notas ({bookmarks.length})</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Continue Listening / History */}
      {activeSubTab === 'history' && (
        <div>
          {history.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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
                    className="p-5 bg-[#12100e] border border-stone-800 rounded-2xl hover:border-[#FF9398]/50 transition-all flex gap-4 group"
                  >
                    <div
                      onClick={() => onSelectBook(book)}
                      className="w-20 h-28 bg-[#0c0a09] rounded-xl overflow-hidden shrink-0 border border-stone-800 cursor-pointer shadow-md"
                    >
                      {coverUrl ? (
                        <img
                          src={coverUrl}
                          alt={book.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#FF9398]/50 text-xs font-mono">
                          Audio
                        </div>
                      )}
                    </div>

                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        <h3
                          onClick={() => onSelectBook(book)}
                          className="font-serif font-medium text-stone-100 text-sm truncate hover:text-[#FF9398] cursor-pointer transition-colors"
                        >
                          {book.title}
                        </h3>
                        <p className="text-xs text-stone-400 font-sans truncate mt-0.5">
                          {authorName}
                        </p>
                        <div className="text-[10px] text-[#FF9398] font-mono mt-1.5 truncate">
                          Pista {item.currentSectionIndex + 1}: {currentSecTitle}
                        </div>
                      </div>

                      <div className="space-y-2 mt-3">
                        {/* Progress Bar */}
                        <div className="w-full bg-stone-900 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-[#FF9398] h-full rounded-full"
                            style={{ width: `${Math.min(100, Math.max(3, item.completedPercentage))}%` }}
                          />
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-stone-500 font-mono">
                          <span>
                            {formatPlayerTime(item.currentTime)}
                          </span>
                          <button
                            onClick={() =>
                              playBook(book, item.currentSectionIndex, item.currentTime)
                            }
                            className="flex items-center gap-1.5 px-3 py-1 bg-[#FF9398] text-stone-950 font-bold rounded-lg transition-transform hover:scale-105 cursor-pointer text-xs"
                          >
                            <Play className="w-3 h-3 fill-current" />
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
            <div className="text-center py-20 bg-[#12100e] rounded-3xl border border-stone-800 p-8 space-y-4 max-w-md mx-auto">
              <History className="w-10 h-10 mx-auto text-stone-600" />
              <h3 className="text-lg font-serif font-medium text-stone-200">
                Aún no has comenzado a escuchar
              </h3>
              <p className="text-xs text-stone-400 font-sans leading-relaxed">
                Elige cualquier audiolibro de la colección abierta y tu progreso se guardará automáticamente en este panel para que nunca pierdas el hilo.
              </p>
              <button
                onClick={onExploreClick}
                className="pill-btn coral text-xs cursor-pointer"
              >
                <span>Explorar audiolibros</span>
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
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {favorites.map((book) => (
                <BookCard key={book.id} book={book} onSelect={onSelectBook} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-[#12100e] rounded-3xl border border-stone-800 p-8 space-y-4 max-w-md mx-auto">
              <Heart className="w-10 h-10 mx-auto text-stone-600" />
              <h3 className="text-lg font-serif font-medium text-stone-200">
                Tu lista de favoritos está vacía
              </h3>
              <p className="text-xs text-stone-400 font-sans leading-relaxed">
                Marca el icono de corazón en la portada de cualquier audiolibro para guardarlo permanentemente en tu biblioteca.
              </p>
              <button
                onClick={onExploreClick}
                className="pill-btn coral text-xs cursor-pointer"
              >
                <span>Descubrir títulos</span>
                <span className="arr">&rarr;</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Bookmarks */}
      {activeSubTab === 'bookmarks' && (
        <div>
          {bookmarks.length > 0 ? (
            <div className="space-y-3 max-w-3xl">
              {bookmarks.map((bm) => (
                <div
                  key={bm.id}
                  className="p-5 bg-[#12100e] border border-stone-800 rounded-2xl hover:border-[#FF9398]/50 transition-all flex items-center justify-between gap-4 group"
                >
                  <div
                    onClick={() => {
                      const book = history.find((h) => h.book.id === bm.bookId)?.book || {
                        id: bm.bookId,
                        title: bm.bookTitle,
                        num_sections: 1,
                        language: 'Español',
                        authors: [{ first_name: '', last_name: 'Autor' }],
                        description: '',
                      };
                      playBook(book, bm.sectionIndex, bm.timestamp);
                    }}
                    className="cursor-pointer flex-1 min-w-0"
                  >
                    <div className="flex items-center gap-2 text-xs font-mono text-[#FF9398]">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{formatPlayerTime(bm.timestamp)}</span>
                      <span className="text-stone-600">&middot;</span>
                      <span className="text-stone-200 font-serif font-medium">{bm.bookTitle}</span>
                      <span className="text-stone-600">&middot;</span>
                      <span className="text-stone-400 truncate">{bm.sectionTitle}</span>
                    </div>
                    <p className="text-sm text-stone-100 mt-1 font-sans font-light">{bm.note}</p>
                    <div className="text-[10px] text-stone-500 font-mono mt-1">
                      Guardado el {new Date(bm.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => removeBookmark(bm.id)}
                      className="p-2 text-stone-500 hover:text-rose-400 rounded-xl hover:bg-stone-900 transition-colors cursor-pointer"
                      title="Eliminar marcador"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-[#12100e] rounded-3xl border border-stone-800 p-8 space-y-4 max-w-md mx-auto">
              <BookmarkIcon className="w-10 h-10 mx-auto text-stone-600" />
              <h3 className="text-lg font-serif font-medium text-stone-200">
                Sin notas ni marcadores
              </h3>
              <p className="text-xs text-stone-400 font-sans leading-relaxed">
                Durante la reproducción de cualquier capítulo, pulsa el botón de marcador en la barra inferior para guardar una marca temporal con tus apuntes.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
