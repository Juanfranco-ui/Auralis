import React, { useEffect, useState } from 'react';
import {
  Bookmark as BookmarkIcon,
  BookmarkPlus,
  Check,
  ChevronDown,
  Clock,
  Info,
  ListMusic,
  Loader2,
  Moon,
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  SkipBack,
  SkipForward,
  Trash2,
} from 'lucide-react';
import { useAudioPlayer } from '../context/AudioPlayerContext';
import {
  decodeHtmlEntities,
  getAuthorName,
  getBookCover,
  formatPlayerTime,
  formatDuration,
} from '../services/librivoxApi';
import { SleepTimerOption } from '../types/audiobook';

const speedOptions = [0.75, 1, 1.25, 1.5, 1.75, 2];
const sleepOptions: { label: string; value: SleepTimerOption }[] = [
  { label: 'Off', value: 0 },
  { label: '15 min', value: 15 },
  { label: '30 min', value: 30 },
  { label: '45 min', value: 45 },
  { label: '60 min', value: 60 },
  { label: 'Al terminar capítulo', value: 'end_of_chapter' },
];

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
  const [activeSetting, setActiveSetting] = useState<'speed' | 'sleep' | null>(null);
  const [newBookmarkNote, setNewBookmarkNote] = useState('');
  const [showAddBookmark, setShowAddBookmark] = useState(false);
  const [bookmarkSaved, setBookmarkSaved] = useState(false);

  useEffect(() => {
    if (!isExpanded) return;

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsExpanded(false);
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isExpanded, setIsExpanded]);

  useEffect(() => {
    if (!bookmarkSaved) return;
    const timeout = window.setTimeout(() => setBookmarkSaved(false), 2000);
    return () => window.clearTimeout(timeout);
  }, [bookmarkSaved]);

  if (!isExpanded || !currentBook) return null;

  const authorName = getAuthorName(currentBook);
  const coverUrl = getBookCover(currentBook);
  const sections = currentBook.sections || [];
  const totalSections = sections.length || currentBook.num_sections || 1;
  const currentChapterTitle =
    decodeHtmlEntities(currentSection?.title) || `Capítulo ${currentSectionIndex + 1}`;
  const bookBookmarks = bookmarks.filter((bookmark) => bookmark.bookId === currentBook.id);
  const timerLabel =
    sleepTimerSeconds !== null
      ? `${Math.ceil(sleepTimerSeconds / 60)} min restantes`
      : sleepTimerOption === 'end_of_chapter'
        ? 'Al terminar capítulo'
        : sleepTimerOption
          ? `${sleepTimerOption} min`
          : 'Desactivado';

  const handleSaveBookmark = (event: React.FormEvent) => {
    event.preventDefault();
    addBookmark(newBookmarkNote);
    setNewBookmarkNote('');
    setShowAddBookmark(false);
    setBookmarkSaved(true);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Reproductor ampliado para ${currentBook.title}`}
      className="fixed inset-0 z-[60] flex flex-col overflow-hidden bg-[#0c0a09] text-stone-100"
      style={{
        height: '100dvh',
        paddingTop: 'env(safe-area-inset-top, 0px)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <header className="flex shrink-0 items-center justify-between border-b border-stone-800 px-4 py-2.5 sm:px-6 sm:py-3">
        <button
          type="button"
          onClick={() => setIsExpanded(false)}
          className="flex h-11 w-11 items-center justify-center rounded-full text-stone-300 transition-colors hover:bg-stone-900 hover:text-white"
          aria-label="Minimizar reproductor"
          title="Volver a la biblioteca"
        >
          <ChevronDown className="h-5 w-5" />
        </button>

        <p className="text-xs font-mono font-medium uppercase tracking-[0.18em] text-stone-300">
          Ahora escuchas
        </p>

        <div className="flex h-11 min-w-11 items-center justify-end">
          {sleepTimerSeconds !== null && sleepTimerSeconds > 0 && (
            <span className="flex items-center gap-1.5 text-xs font-mono tabular-nums text-[#FF9398]">
              <Moon className="h-4 w-4" />
              {Math.ceil(sleepTimerSeconds / 60)}m
            </span>
          )}
        </div>
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-start gap-5 px-5 py-5 sm:px-8 sm:py-8 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:items-center md:gap-10 lg:gap-16">
          <div className="flex justify-center">
            <div className="aspect-[3/4] w-[min(49vw,15rem)] max-h-[31dvh] overflow-hidden border border-stone-700 bg-[#12100e] shadow-2xl md:w-[min(28vw,22rem)] md:max-h-[54dvh]">
              {coverUrl ? (
                <img
                  src={coverUrl}
                  alt={`Portada de ${currentBook.title}`}
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-3 p-5 text-center">
                  <BookmarkIcon className="h-9 w-9 text-[#FF9398]" aria-hidden="true" />
                  <p className="font-serif text-lg leading-tight">{currentBook.title}</p>
                  <p className="text-sm text-stone-300">{authorName}</p>
                </div>
              )}
            </div>
          </div>

          <section className="mx-auto w-full max-w-2xl space-y-5 md:max-w-none">
            <div className="space-y-2 text-center md:text-left">
              <h1 className="font-serif text-2xl font-light leading-tight text-stone-100 sm:text-3xl lg:text-4xl">
                {currentBook.title}
              </h1>
              <p className="text-sm text-[#FF9398] sm:text-base">{authorName}</p>
              <div className="flex flex-wrap items-baseline justify-center gap-x-2 gap-y-1 text-xs text-stone-300 md:justify-start sm:text-sm">
                <span className="font-mono tabular-nums">
                  Pista {currentSectionIndex + 1} de {totalSections}
                </span>
                <span aria-hidden="true" className="text-stone-600">·</span>
                <span className="min-w-0 max-w-full truncate">{currentChapterTitle}</span>
              </div>
            </div>

            <div className="space-y-2">
              <input
                type="range"
                min={0}
                max={duration || 100}
                step={1}
                value={Math.min(currentTime, duration || currentTime)}
                onChange={(event) => seekTo(Number(event.target.value))}
                className="h-2 w-full cursor-pointer"
                aria-label="Posición de reproducción actual"
                aria-valuetext={`${formatPlayerTime(currentTime)} de ${formatPlayerTime(duration)}`}
              />
              <div className="flex justify-between font-mono text-xs tabular-nums text-stone-300">
                <span>{formatPlayerTime(currentTime)}</span>
                <span>
                  {duration > 0
                    ? `-${formatPlayerTime(Math.max(0, duration - currentTime))}`
                    : formatPlayerTime(duration)}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-1 sm:gap-3">
              <button
                type="button"
                onClick={prevChapter}
                disabled={currentSectionIndex === 0 && currentTime <= 4}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-stone-300 transition-colors hover:bg-stone-900 hover:text-white disabled:cursor-not-allowed disabled:opacity-30 sm:h-12 sm:w-12"
                aria-label="Capítulo anterior"
              >
                <SkipBack className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => skipBackward(15)}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-stone-300 transition-colors hover:bg-stone-900 hover:text-white"
                aria-label="Retroceder 15 segundos"
              >
                <RotateCcw className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={togglePlayPause}
                disabled={isLoading}
                className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#FF9398] text-[#0c0a09] transition-colors hover:bg-white disabled:opacity-70 sm:h-[4.5rem] sm:w-[4.5rem]"
                aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
              >
                {isLoading ? (
                  <Loader2 className="h-7 w-7 animate-spin" />
                ) : isPlaying ? (
                  <Pause className="h-7 w-7 fill-current" />
                ) : (
                  <Play className="h-7 w-7 translate-x-0.5 fill-current" />
                )}
              </button>
              <button
                type="button"
                onClick={() => skipForward(15)}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-stone-300 transition-colors hover:bg-stone-900 hover:text-white"
                aria-label="Adelantar 15 segundos"
              >
                <RotateCw className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={nextChapter}
                disabled={!sections.length || currentSectionIndex >= sections.length - 1}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-stone-300 transition-colors hover:bg-stone-900 hover:text-white disabled:cursor-not-allowed disabled:opacity-30 sm:h-12 sm:w-12"
                aria-label="Siguiente capítulo"
              >
                <SkipForward className="h-5 w-5" />
              </button>
            </div>

            <section aria-label="Ajustes de reproducción" className="space-y-3 border-t border-stone-800 pt-4">
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setActiveSetting(activeSetting === 'speed' ? null : 'speed')}
                  aria-expanded={activeSetting === 'speed'}
                  className="flex min-h-11 items-center justify-between gap-2 border-b border-stone-800 px-1 text-left transition-colors hover:border-stone-500"
                >
                  <span className="text-sm text-stone-300">Velocidad</span>
                  <span className="font-mono text-sm text-[#FF9398]">{playbackRate}x</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSetting(activeSetting === 'sleep' ? null : 'sleep')}
                  aria-expanded={activeSetting === 'sleep'}
                  className="flex min-h-11 items-center justify-between gap-2 border-b border-stone-800 px-1 text-left transition-colors hover:border-stone-500"
                >
                  <span className="text-sm text-stone-300">Temporizador</span>
                  <span className="max-w-[55%] truncate font-mono text-xs text-[#FF9398]">
                    {timerLabel}
                  </span>
                </button>
              </div>

              {activeSetting === 'speed' && (
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                  {speedOptions.map((speed) => (
                    <button
                      type="button"
                      key={speed}
                      onClick={() => {
                        setPlaybackSpeed(speed);
                        setActiveSetting(null);
                      }}
                      aria-pressed={playbackRate === speed}
                      className={`min-h-11 rounded-sm px-2 font-mono text-xs transition-colors ${
                        playbackRate === speed
                          ? 'bg-[#FF9398] font-bold text-[#0c0a09]'
                          : 'bg-stone-900 text-stone-300 hover:text-white'
                      }`}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>
              )}

              {activeSetting === 'sleep' && (
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                  {sleepOptions.map((option) => (
                    <button
                      type="button"
                      key={String(option.value)}
                      onClick={() => {
                        setSleepTimer(option.value);
                        setActiveSetting(null);
                      }}
                      aria-pressed={sleepTimerOption === option.value}
                      className={`min-h-11 rounded-sm px-2 text-xs transition-colors ${
                        sleepTimerOption === option.value
                          ? 'bg-[#FF9398] font-bold text-[#0c0a09]'
                          : 'bg-stone-900 text-stone-300 hover:text-white'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </section>

            <section aria-label="Contenido del audiolibro" className="border-t border-stone-800 pt-4">
              <div role="tablist" aria-label="Contenido del reproductor" className="flex border-b border-stone-800">
                <button
                  type="button"
                  id="player-tab-chapters"
                  role="tab"
                  aria-selected={activeTab === 'chapters'}
                  aria-controls="player-panel"
                  onClick={() => setActiveTab('chapters')}
                  className={`flex min-h-11 flex-1 items-center justify-center gap-1.5 border-b-2 px-2 text-xs transition-colors sm:text-sm ${
                    activeTab === 'chapters'
                      ? 'border-[#FF9398] text-[#FF9398]'
                      : 'border-transparent text-stone-300 hover:text-white'
                  }`}
                >
                  <ListMusic className="h-4 w-4" />
                  Pistas ({sections.length || totalSections})
                </button>
                <button
                  type="button"
                  id="player-tab-bookmarks"
                  role="tab"
                  aria-selected={activeTab === 'bookmarks'}
                  aria-controls="player-panel"
                  onClick={() => setActiveTab('bookmarks')}
                  className={`flex min-h-11 flex-1 items-center justify-center gap-1.5 border-b-2 px-2 text-xs transition-colors sm:text-sm ${
                    activeTab === 'bookmarks'
                      ? 'border-[#FF9398] text-[#FF9398]'
                      : 'border-transparent text-stone-300 hover:text-white'
                  }`}
                >
                  <BookmarkIcon className="h-4 w-4" />
                  Notas ({bookBookmarks.length})
                </button>
                <button
                  type="button"
                  id="player-tab-info"
                  role="tab"
                  aria-selected={activeTab === 'info'}
                  aria-controls="player-panel"
                  onClick={() => setActiveTab('info')}
                  className={`flex min-h-11 flex-1 items-center justify-center gap-1.5 border-b-2 px-2 text-xs transition-colors sm:text-sm ${
                    activeTab === 'info'
                      ? 'border-[#FF9398] text-[#FF9398]'
                      : 'border-transparent text-stone-300 hover:text-white'
                  }`}
                >
                  <Info className="h-4 w-4" />
                  Ficha
                </button>
              </div>

              <div
                id="player-panel"
                role="tabpanel"
                aria-labelledby={`player-tab-${activeTab}`}
                className="max-h-64 overflow-y-auto overscroll-contain py-3 md:max-h-[30dvh]"
              >
                {activeTab === 'chapters' && (
                  <div className="space-y-1">
                    {sections.length > 0 ? (
                      sections.map((section, index) => {
                        const isCurrentSection = currentSectionIndex === index;
                        return (
                          <button
                            type="button"
                            key={section.id || index}
                            onClick={() => playBook(currentBook, index)}
                            aria-current={isCurrentSection ? 'true' : undefined}
                            className={`flex min-h-11 w-full min-w-0 items-center justify-between gap-3 px-2 text-left text-sm transition-colors ${
                              isCurrentSection
                                ? 'text-[#FF9398]'
                                : 'text-stone-300 hover:text-white'
                            }`}
                          >
                            <span className="flex min-w-0 items-center gap-3">
                              <span className="w-6 shrink-0 font-mono text-xs tabular-nums text-stone-500">
                                {index + 1}
                              </span>
                              <span className="truncate">
                                {decodeHtmlEntities(section.title) || `Capítulo ${index + 1}`}
                              </span>
                            </span>
                            <span className="shrink-0 font-mono text-xs tabular-nums text-stone-400">
                              {section.playtime ? formatDuration(section.playtime) : ''}
                            </span>
                          </button>
                        );
                      })
                    ) : (
                      <p className="py-5 text-center text-sm text-stone-300">
                        Cargando índice de pistas...
                      </p>
                    )}
                  </div>
                )}

                {activeTab === 'bookmarks' && (
                  <div className="space-y-2">
                    {bookBookmarks.length > 0 ? (
                      bookBookmarks.map((bookmark) => (
                        <div
                          key={bookmark.id}
                          className="flex items-center gap-2 border-b border-stone-800 py-2"
                        >
                          <button
                            type="button"
                            onClick={() =>
                              playBook(currentBook, bookmark.sectionIndex, bookmark.timestamp)
                            }
                            className="min-h-11 min-w-0 flex-1 text-left"
                            aria-label={`Reproducir marcador ${formatPlayerTime(bookmark.timestamp)}: ${bookmark.note}`}
                          >
                            <span className="flex min-w-0 items-center gap-2 text-xs font-mono text-[#FF9398]">
                              <Clock className="h-3.5 w-3.5 shrink-0" />
                              <span>{formatPlayerTime(bookmark.timestamp)}</span>
                              <span aria-hidden="true">·</span>
                              <span className="truncate text-stone-300">{bookmark.sectionTitle}</span>
                            </span>
                            <span className="mt-1 block truncate text-sm text-stone-100">
                              {bookmark.note}
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={() => removeBookmark(bookmark.id)}
                            className="flex h-11 w-11 shrink-0 items-center justify-center text-stone-400 transition-colors hover:text-rose-300"
                            aria-label="Eliminar marcador"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="py-4 text-sm text-stone-300">
                        Todavía no guardaste notas para este audiolibro.
                      </p>
                    )}
                  </div>
                )}

                {activeTab === 'info' && (
                  <div className="space-y-4 py-1 text-sm leading-relaxed">
                    <div>
                      <h2 className="mb-1 font-serif text-base text-stone-100">Sinopsis</h2>
                      <p className="whitespace-pre-line text-stone-300">
                        {currentBook.description || 'Sin descripción disponible.'}
                      </p>
                    </div>
                    <dl className="grid grid-cols-2 gap-x-4 gap-y-3 border-t border-stone-800 pt-3 text-xs">
                      <div>
                        <dt className="text-stone-400">Idioma</dt>
                        <dd className="text-stone-100">{currentBook.language || 'Dominio Público'}</dd>
                      </div>
                      <div>
                        <dt className="text-stone-400">Año</dt>
                        <dd className="text-stone-100">{currentBook.copyright_year || 'Clásico'}</dd>
                      </div>
                      <div>
                        <dt className="text-stone-400">Duración</dt>
                        <dd className="font-mono text-stone-100">
                          {currentBook.totaltime || formatDuration(currentBook.totaltimesecs)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-stone-400">Archivo</dt>
                        <dd className="text-[#FF9398]">LibriVox</dd>
                      </div>
                    </dl>
                  </div>
                )}
              </div>

              {showAddBookmark ? (
                <form onSubmit={handleSaveBookmark} className="border-t border-stone-800 pt-3">
                  <label htmlFor="player-bookmark-note" className="mb-2 block text-sm text-stone-300">
                    Nota para {formatPlayerTime(currentTime)}
                  </label>
                  <input
                    id="player-bookmark-note"
                    type="text"
                    value={newBookmarkNote}
                    onChange={(event) => setNewBookmarkNote(event.target.value)}
                    placeholder="Escribe una nota..."
                    className="min-h-11 w-full border border-stone-700 bg-[#12100e] px-3 text-sm text-stone-100 placeholder:text-stone-400 focus:border-[#FF9398] focus:outline-none"
                  />
                  <div className="mt-2 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setShowAddBookmark(false)}
                      className="min-h-11 px-3 text-sm text-stone-300 hover:text-white"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="min-h-11 bg-[#FF9398] px-4 text-sm font-semibold text-[#0c0a09] hover:bg-white"
                    >
                      Guardar
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex min-h-11 items-center justify-between border-t border-stone-800 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddBookmark(true)}
                    className="flex min-h-11 items-center gap-2 text-sm text-stone-300 transition-colors hover:text-[#FF9398]"
                  >
                    <BookmarkPlus className="h-4 w-4" />
                    Guardar nota
                  </button>
                  {bookmarkSaved && (
                    <span role="status" className="flex items-center gap-1.5 text-sm text-[#FF9398]">
                      <Check className="h-4 w-4" />
                      Guardada
                    </span>
                  )}
                </div>
              )}
            </section>
          </section>
        </div>
      </main>
    </div>
  );
};
