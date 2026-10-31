import React, { useState } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  SkipBack,
  SkipForward,
  Moon,
  BookmarkPlus,
  Bookmark as BookmarkIcon,
  ListMusic,
  Info,
  Clock,
  Trash2,
  Loader2,
  Check,
  Disc3,
  X,
} from 'lucide-react';
import { useAudioPlayer } from '../context/AudioPlayerContext';
import {
  getAuthorName,
  getBookCover,
  formatPlayerTime,
  formatDuration,
} from '../services/librivoxApi';
import { SleepTimerOption } from '../types/audiobook';

export const ExpandedPlayerModal: React.FC = () => {
  const {
    currentBook,
    currentSection,
    currentSectionIndex,
    isPlaying,
    isLoading,
    currentTime,
    duration,
    playbackRate,
    isExpanded,
    sleepTimerOption,
    sleepTimerSeconds,
    bookmarks,
    setIsExpanded,
    togglePlayPause,
    seekTo,
    skipForward,
    skipBackward,
    nextChapter,
    prevChapter,
    setPlaybackSpeed,
    setSleepTimer,
    addBookmark,
    removeBookmark,
    playBook,
  } = useAudioPlayer();

  const [activeTab, setActiveTab] = useState<'chapters' | 'bookmarks' | 'info'>('chapters');
  const [newBookmarkNote, setNewBookmarkNote] = useState('');
  const [showAddBookmark, setShowAddBookmark] = useState(false);
  const [copiedBookmark, setCopiedBookmark] = useState(false);

  if (!isExpanded || !currentBook) return null;

  const authorName = getAuthorName(currentBook);
  const coverUrl = getBookCover(currentBook);
  const sections = currentBook.sections || [];
  const totalSections = sections.length || currentBook.num_sections || 1;
  const currentChapterTitle = currentSection?.title || `Capítulo ${currentSectionIndex + 1}`;

  const bookBookmarks = bookmarks.filter((b) => b.bookId === currentBook.id);

  const speedOptions = [0.75, 1, 1.25, 1.5, 1.75, 2];
  const sleepOptions: { label: string; value: SleepTimerOption }[] = [
    { label: 'Off', value: 0 },
    { label: '15m', value: 15 },
    { label: '30m', value: 30 },
    { label: '45m', value: 45 },
    { label: '60m', value: 60 },
    { label: 'Fin cap.', value: 'end_of_chapter' },
  ];

  const handleSaveBookmark = (e: React.FormEvent) => {
    e.preventDefault();
    addBookmark(newBookmarkNote);
    setNewBookmarkNote('');
    setShowAddBookmark(false);
    setCopiedBookmark(true);
    setTimeout(() => setCopiedBookmark(false), 2000);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Reproductor ampliado para ${currentBook.title}`}
      className="fixed inset-0 z-50 bg-[#0c0a09]/98 backdrop-blur-2xl flex flex-col overflow-hidden animate-in fade-in duration-300"
    >
      {/* Top Bar with minimize button */}
      <div className="px-4 sm:px-6 py-4 flex items-center justify-between border-b border-stone-800 bg-[#0c0a09] shrink-0">
        <button
          onClick={() => setIsExpanded(false)}
          className="pill-btn outline text-xs cursor-pointer flex items-center gap-1.5 py-2 px-4 font-bold"
          aria-label="Minimizar reproductor a barra inferior"
        >
          <span>&darr; Minimizar</span>
        </button>

        <div className="text-center px-2 min-w-0">
          <div className="text-xs font-mono tracking-wider text-[#FF9398] uppercase font-bold">
            AUDIOLIBRO EN REPRODUCCIÓN
          </div>
          <div className="text-sm sm:text-base text-stone-200 truncate max-w-[200px] sm:max-w-md font-serif font-medium mt-0.5">
            {currentBook.title}
          </div>
        </div>

        <div className="w-20 sm:w-28 flex justify-end items-center gap-2">
          {sleepTimerSeconds !== null && sleepTimerSeconds > 0 && (
            <div className="flex items-center gap-1 px-3 py-1 bg-[#FF9398]/15 border border-[#FF9398]/40 rounded-full text-[#FF9398] text-xs font-mono font-bold">
              <Moon className="w-3.5 h-3.5" />
              <span>{Math.ceil(sleepTimerSeconds / 60)}m</span>
            </div>
          )}
          <button
            onClick={() => setIsExpanded(false)}
            className="p-2 text-stone-300 hover:text-white rounded-xl hover:bg-stone-800 border border-stone-800 transition-colors sm:hidden cursor-pointer"
            aria-label="Cerrar reproductor"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-10 items-center overscroll-contain">
        {/* Left Column: Visual Artwork & Central Player (7 cols) */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center max-w-xl mx-auto w-full space-y-5 sm:space-y-6">
          {/* Cover Art */}
          <div className="relative group">
            <div
              className={`w-48 h-48 sm:w-76 sm:h-76 rounded-3xl overflow-hidden shadow-2xl border border-stone-700 bg-[#12100e] transition-all duration-700 ${
                isPlaying ? 'shadow-[#FF9398]/15 border-[#FF9398]' : ''
              }`}
            >
              {coverUrl ? (
                <img
                  src={coverUrl}
                  alt={currentBook.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-[#0f0e0c]">
                  <Disc3 className="w-12 h-12 text-[#FF9398] mb-3 animate-spin" />
                  <span className="text-stone-100 font-serif text-lg sm:text-xl font-bold">
                    {currentBook.title}
                  </span>
                  <span className="text-sm text-stone-300 mt-2 font-mono">{authorName}</span>
                </div>
              )}
            </div>

            {/* Stylized Audio Waveform Indicator */}
            {isPlaying && (
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex items-end gap-1.5 px-4 py-1.5 bg-[#0c0a09] border border-stone-700 rounded-full shadow-2xl">
                {[5, 14, 9, 18, 12, 16, 7, 14, 9].map((h, i) => (
                  <div
                    key={i}
                    className="w-1 bg-[#FF9398] rounded-full animate-pulse"
                    style={{
                      height: `${h}px`,
                      animationDelay: `${i * 120}ms`,
                      animationDuration: '750ms',
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Book & Chapter Headings */}
          <div className="text-center space-y-2 w-full px-4 pt-1">
            <h2 className="text-2xl sm:text-4xl font-serif font-light text-stone-100 line-clamp-2 leading-tight">
              {currentBook.title}
            </h2>
            <p className="text-sm sm:text-lg text-[#FF9398] font-sans font-medium tracking-wide">
              {authorName}
            </p>
            <div className="text-xs sm:text-sm text-stone-300 font-mono mt-0.5 tracking-wide uppercase truncate font-medium">
              Pista {currentSectionIndex + 1} de {totalSections} &middot; {currentChapterTitle}
            </div>
          </div>

          {/* Progress Bar & Timers */}
          <div className="w-full space-y-2 px-2">
            <input
              type="range"
              min={0}
              max={duration || 100}
              step={1}
              value={currentTime}
              onChange={(e) => seekTo(Number(e.target.value))}
              className="w-full h-2 sm:h-2.5 bg-stone-800 rounded-lg appearance-none cursor-pointer focus:outline-none"
              aria-label="Posición de reproducción actual"
            />
            <div className="flex justify-between text-xs sm:text-sm font-mono text-stone-300 font-medium">
              <span className="tabular-nums">{formatPlayerTime(currentTime)}</span>
              <span className="tabular-nums">
                {duration > 0
                  ? `-${formatPlayerTime(Math.max(0, duration - currentTime))}`
                  : formatPlayerTime(duration)}
              </span>
            </div>
          </div>

          {/* Playback Controls */}
          <div className="flex items-center justify-center gap-3 sm:gap-6">
            <button
              onClick={prevChapter}
              disabled={currentSectionIndex === 0 && currentTime <= 4}
              className="hidden sm:inline-flex p-3 text-stone-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer rounded-xl"
              title="Capítulo anterior"
              aria-label="Capítulo anterior"
            >
              <SkipBack className="w-6 h-6" />
            </button>

            <button
              onClick={() => skipBackward(15)}
              className="p-3.5 bg-[#12100e] border border-stone-700 hover:border-[#FF9398] text-stone-200 hover:text-white rounded-full transition-all cursor-pointer flex items-center justify-center"
              title="Retroceder 15s"
              aria-label="Retroceder 15 segundos"
            >
              <RotateCcw className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            {/* Hero Play Button */}
            <button
              onClick={togglePlayPause}
              disabled={isLoading}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#FF9398] hover:bg-white text-stone-950 flex items-center justify-center shadow-2xl transition-all hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-80 font-bold"
              title={isPlaying ? 'Pausar' : 'Reproducir'}
              aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
            >
              {isLoading ? (
                <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 animate-spin" />
              ) : isPlaying ? (
                <Pause className="w-8 h-8 sm:w-10 sm:h-10 fill-current" />
              ) : (
                <Play className="w-8 h-8 sm:w-10 sm:h-10 fill-current translate-x-1" />
              )}
            </button>

            <button
              onClick={() => skipForward(15)}
              className="p-3.5 bg-[#12100e] border border-stone-700 hover:border-[#FF9398] text-stone-200 hover:text-white rounded-full transition-all cursor-pointer flex items-center justify-center"
              title="Adelantar 15s"
              aria-label="Adelantar 15 segundos"
            >
              <RotateCw className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            <button
              onClick={nextChapter}
              disabled={
                !currentBook.sections ||
                currentSectionIndex >= currentBook.sections.length - 1
              }
              className="hidden sm:inline-flex p-3 text-stone-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer rounded-xl"
              title="Siguiente capítulo"
              aria-label="Siguiente capítulo"
            >
              <SkipForward className="w-6 h-6" />
            </button>
          </div>

          {/* Quick Settings Bar: Speed, Sleep, Bookmark */}
          <div className="w-full flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-stone-800 px-2 text-xs sm:text-sm font-mono">
            {/* Speed buttons */}
            <div className="flex items-center gap-1.5">
              <span className="text-stone-400 font-bold uppercase text-xs">Vel:</span>
              {speedOptions.map((sp) => (
                <button
                  key={sp}
                  onClick={() => setPlaybackSpeed(sp)}
                  className={`px-2 py-1 rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer ${
                    playbackRate === sp
                      ? 'bg-[#FF9398] text-stone-950 font-bold'
                      : 'text-stone-300 hover:text-white hover:bg-stone-800'
                  }`}
                  aria-label={`Establecer velocidad en ${sp}x`}
                >
                  {sp}x
                </button>
              ))}
            </div>

            {/* Sleep options */}
            <div className="hidden sm:flex items-center gap-1.5">
              <Moon className="w-4 h-4 text-stone-400 mr-1" />
              {sleepOptions.map((opt) => (
                <button
                  key={String(opt.value)}
                  onClick={() => setSleepTimer(opt.value)}
                  className={`px-2 py-1 rounded-lg text-xs transition-colors cursor-pointer font-mono font-medium ${
                    sleepTimerOption === opt.value
                      ? 'bg-[#FF9398] text-stone-950 font-bold'
                      : 'text-stone-300 hover:text-white hover:bg-stone-800'
                  }`}
                  aria-label={`Temporizador: ${opt.label}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Bookmark button */}
            <button
              onClick={() => setShowAddBookmark(!showAddBookmark)}
              className="pill-btn outline text-xs py-1.5 px-3.5 cursor-pointer font-bold"
              aria-label="Abrir formulario para guardar nota o marcador"
            >
              <BookmarkPlus className="w-3.5 h-3.5" />
              <span>Guardar nota</span>
            </button>
          </div>

          {/* Add Bookmark Form */}
          {showAddBookmark && (
            <form
              onSubmit={handleSaveBookmark}
              className="w-full p-4 bg-[#12100e] border border-stone-700 rounded-2xl space-y-3"
            >
              <div className="text-xs sm:text-sm text-stone-200 font-mono font-medium">
                Guardar marcador en el segundo{' '}
                <span className="text-[#FF9398] font-bold">
                  {formatPlayerTime(currentTime)}
                </span>
                :
              </div>
              <input
                type="text"
                value={newBookmarkNote}
                onChange={(e) => setNewBookmarkNote(e.target.value)}
                placeholder="Escribe una nota sobre este momento..."
                className="w-full px-3.5 py-2.5 bg-[#0c0a09] border border-stone-700 rounded-xl text-xs sm:text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-[#FF9398]"
              />
              <div className="flex justify-end gap-2 font-mono">
                <button
                  type="button"
                  onClick={() => setShowAddBookmark(false)}
                  className="px-3 py-1.5 text-xs text-stone-300 hover:text-white cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="pill-btn coral text-xs py-1.5 px-4 cursor-pointer font-bold"
                >
                  <span>Guardar</span>
                </button>
              </div>
            </form>
          )}

          {copiedBookmark && (
            <div className="text-xs sm:text-sm text-emerald-400 font-bold flex items-center gap-1.5 font-mono">
              <Check className="w-4 h-4" />
              <span>&iexcl;Marcador guardado en tu colección!</span>
            </div>
          )}
        </div>

        {/* Right Column: Tabbed Chapters / Bookmarks / Details (5 cols) */}
        <div className="lg:col-span-5 h-[420px] sm:h-[520px] bg-[#12100e] border border-stone-700 rounded-2xl flex flex-col overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-stone-800 bg-[#0c0a09] text-xs sm:text-sm font-mono tracking-wider uppercase shrink-0">
            <button
              onClick={() => setActiveTab('chapters')}
              className={`flex-1 py-3.5 text-center transition-colors cursor-pointer flex items-center justify-center gap-1.5 font-semibold ${
                activeTab === 'chapters'
                  ? 'text-[#FF9398] border-b-2 border-[#FF9398] bg-[#12100e]'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              <ListMusic className="w-4 h-4" />
              <span>Pistas ({sections.length || totalSections})</span>
            </button>
            <button
              onClick={() => setActiveTab('bookmarks')}
              className={`flex-1 py-3.5 text-center transition-colors cursor-pointer flex items-center justify-center gap-1.5 font-semibold ${
                activeTab === 'bookmarks'
                  ? 'text-[#FF9398] border-b-2 border-[#FF9398] bg-[#12100e]'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              <BookmarkIcon className="w-4 h-4" />
              <span>Notas ({bookBookmarks.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('info')}
              className={`flex-1 py-3.5 text-center transition-colors cursor-pointer flex items-center justify-center gap-1.5 font-semibold ${
                activeTab === 'info'
                  ? 'text-[#FF9398] border-b-2 border-[#FF9398] bg-[#12100e]'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              <Info className="w-4 h-4" />
              <span>Ficha</span>
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-4 overscroll-contain">
            {activeTab === 'chapters' && (
              <div className="space-y-1.5">
                {sections.length > 0 ? (
                  sections.map((sec, idx) => {
                    const isSecPlaying = currentSectionIndex === idx;
                    return (
                      <button
                        key={sec.id || idx}
                        onClick={() => playBook(currentBook, idx)}
                        className={`w-full text-left p-3 rounded-xl flex items-center justify-between gap-3 text-xs sm:text-sm transition-colors cursor-pointer ${
                          isSecPlaying
                            ? 'bg-[#FF9398]/20 border border-[#FF9398]/50 text-[#FF9398] font-bold'
                            : 'hover:bg-stone-900 text-stone-200'
                        }`}
                      >
                        <div className="flex items-center gap-3 truncate">
                          <span
                            className={`w-6 font-mono text-xs tabular-nums shrink-0 font-bold ${
                              isSecPlaying ? 'text-[#FF9398]' : 'text-stone-400'
                            }`}
                          >
                            {idx + 1}
                          </span>
                          <span className="truncate font-sans font-medium">
                            {sec.title || `Capítulo ${idx + 1}`}
                          </span>
                        </div>
                        <span className="font-mono text-stone-300 tabular-nums shrink-0 text-xs">
                          {sec.playtime ? formatDuration(sec.playtime) : ''}
                        </span>
                      </button>
                    );
                  })
                ) : (
                  <div className="text-center py-12 text-stone-400 text-xs sm:text-sm font-mono">
                    Cargando índice de pistas...
                  </div>
                )}
              </div>
            )}

            {activeTab === 'bookmarks' && (
              <div className="space-y-2.5">
                {bookBookmarks.length > 0 ? (
                  bookBookmarks.map((bm) => (
                    <div
                      key={bm.id}
                      className="p-3.5 bg-[#0c0a09] border border-stone-800 rounded-xl flex items-center justify-between gap-3 text-xs sm:text-sm group"
                    >
                      <div
                        onClick={() => {
                          playBook(currentBook, bm.sectionIndex, bm.timestamp);
                        }}
                        className="cursor-pointer flex-1 min-w-0"
                      >
                        <div className="flex items-center gap-2 text-[#FF9398] font-mono text-xs font-bold">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{formatPlayerTime(bm.timestamp)}</span>
                          <span className="text-stone-500">&middot;</span>
                          <span className="truncate text-stone-300">{bm.sectionTitle}</span>
                        </div>
                        <p className="text-stone-100 mt-1 font-sans truncate font-normal">{bm.note}</p>
                      </div>

                      <button
                        onClick={() => removeBookmark(bm.id)}
                        className="p-2 text-stone-400 hover:text-rose-400 rounded-lg transition-colors cursor-pointer"
                        title="Eliminar marcador"
                        aria-label="Eliminar marcador"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-stone-300 text-xs sm:text-sm space-y-3">
                    <BookmarkIcon className="w-8 h-8 mx-auto text-stone-500" />
                    <p className="font-sans">No tienes notas guardadas en este audiolibro.</p>
                    <button
                      onClick={() => setShowAddBookmark(true)}
                      className="text-[#FF9398] underline font-mono text-xs sm:text-sm cursor-pointer font-bold"
                    >
                      Crear nota ahora
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'info' && (
              <div className="space-y-4 text-xs sm:text-sm text-stone-200 leading-relaxed font-sans font-light">
                <div>
                  <h4 className="font-serif font-medium text-stone-100 text-sm sm:text-base mb-1">Sinopsis</h4>
                  <p className="text-stone-300 whitespace-pre-line max-h-56 overflow-y-auto leading-relaxed">
                    {currentBook.description || 'Sin descripción disponible.'}
                  </p>
                </div>

                <div className="pt-3 border-t border-stone-800 grid grid-cols-2 gap-3 text-stone-300 font-mono text-xs sm:text-sm">
                  <div>
                    <span className="text-stone-400 block uppercase text-xs font-semibold">Idioma:</span>
                    <span className="text-stone-100">{currentBook.language || 'Dominio Público'}</span>
                  </div>
                  <div>
                    <span className="text-stone-400 block uppercase text-xs font-semibold">Año:</span>
                    <span className="text-stone-100">{currentBook.copyright_year || 'Clásico'}</span>
                  </div>
                  <div>
                    <span className="text-stone-400 block uppercase text-xs font-semibold">Duración:</span>
                    <span className="font-mono text-stone-100 font-medium">
                      {currentBook.totaltime || formatDuration(currentBook.totaltimesecs)}
                    </span>
                  </div>
                  <div>
                    <span className="text-stone-400 block uppercase text-xs font-semibold">Archivo:</span>
                    <span className="text-[#FF9398] font-bold">LibriVox / Internet Archive</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
