import React, { useState } from 'react';
import {
  ChevronDown,
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
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
    volume,
    isMuted,
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
    setAudioVolume,
    toggleMute,
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
    <div className="fixed inset-0 z-50 bg-[#0c0a09]/98 backdrop-blur-2xl flex flex-col overflow-hidden animate-in fade-in duration-300">
      {/* Top Bar with minimize button */}
      <div className="px-6 py-5 flex items-center justify-between border-b border-stone-800/80 bg-[#0c0a09]">
        <button
          onClick={() => setIsExpanded(false)}
          className="pill-btn outline text-xs cursor-pointer"
        >
          <span>&darr; Minimizar</span>
        </button>

        <div className="text-center">
          <div className="text-[10px] font-mono tracking-[0.28em] text-[#FF9398] uppercase">
            AUDIOLIBRO EN REPRODUCCIÓN
          </div>
          <div className="text-xs text-stone-300 truncate max-w-xs sm:max-w-md font-serif mt-0.5">
            {currentBook.title}
          </div>
        </div>

        <div className="w-24 flex justify-end">
          {sleepTimerSeconds !== null && sleepTimerSeconds > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-[#FF9398]/10 border border-[#FF9398]/30 rounded-full text-[#FF9398] text-[11px] font-mono">
              <Moon className="w-3 h-3" />
              <span>{Math.ceil(sleepTimerSeconds / 60)}m</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        {/* Left Column: Visual Artwork & Central Player (7 cols) */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center max-w-xl mx-auto w-full space-y-6">
          {/* Cover Art with subtle vinyl rotation glow */}
          <div className="relative group">
            <div
              className={`w-60 h-60 sm:w-72 sm:h-72 rounded-2xl overflow-hidden shadow-2xl border border-stone-800 bg-[#12100e] transition-all duration-700 ${
                isPlaying ? 'shadow-[#FF9398]/10 border-[#FF9398]/40' : ''
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
                  <Disc3 className="w-12 h-12 text-[#FF9398]/40 mb-3 animate-spin" />
                  <span className="text-stone-200 font-serif text-lg font-bold">
                    {currentBook.title}
                  </span>
                  <span className="text-xs text-stone-500 mt-2 font-mono">{authorName}</span>
                </div>
              )}
            </div>

            {/* Stylized Audio Waveform Indicator */}
            {isPlaying && (
              <div className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 flex items-end gap-1.5 px-4 py-1.5 bg-[#0c0a09] border border-stone-800 rounded-full shadow-2xl">
                {[4, 14, 8, 18, 12, 16, 6, 14, 8].map((h, i) => (
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
          <div className="text-center space-y-2 w-full px-4 pt-2">
            <h2 className="text-2xl sm:text-3xl font-serif font-light text-stone-100 line-clamp-1 leading-tight">
              {currentBook.title}
            </h2>
            <p className="text-sm sm:text-base text-[#FF9398] font-sans font-medium tracking-wide">
              {authorName}
            </p>
            <div className="text-xs text-stone-400 font-mono mt-1 tracking-wider uppercase">
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
              className="w-full h-2 bg-stone-900 rounded-lg appearance-none cursor-pointer focus:outline-none"
            />
            <div className="flex justify-between text-xs font-mono text-stone-400">
              <span className="tabular-nums">{formatPlayerTime(currentTime)}</span>
              <span className="tabular-nums">
                {duration > 0
                  ? `-${formatPlayerTime(Math.max(0, duration - currentTime))}`
                  : formatPlayerTime(duration)}
              </span>
            </div>
          </div>

          {/* Large Tactile Playback Controls */}
          <div className="flex items-center justify-center gap-4 sm:gap-6">
            <button
              onClick={prevChapter}
              disabled={currentSectionIndex === 0 && currentTime <= 4}
              className="p-2.5 text-stone-400 hover:text-stone-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              title="Capítulo anterior"
            >
              <SkipBack className="w-6 h-6" />
            </button>

            <button
              onClick={() => skipBackward(15)}
              className="p-3.5 bg-[#12100e] border border-stone-800 hover:border-[#FF9398]/50 text-stone-300 hover:text-white rounded-full transition-all relative group cursor-pointer"
              title="Retroceder 15s"
            >
              <RotateCcw className="w-5 h-5" />
              <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-[9px] font-mono text-stone-400 group-hover:text-[#FF9398]">
                15
              </span>
            </button>

            {/* Hero Play Button */}
            <button
              onClick={togglePlayPause}
              disabled={isLoading}
              className="w-16 h-16 rounded-full bg-[#FF9398] hover:bg-white text-stone-950 flex items-center justify-center shadow-2xl transition-all hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-80"
              title={isPlaying ? 'Pausar' : 'Reproducir'}
            >
              {isLoading ? (
                <Loader2 className="w-8 h-8 animate-spin" />
              ) : isPlaying ? (
                <Pause className="w-8 h-8 fill-current" />
              ) : (
                <Play className="w-8 h-8 fill-current translate-x-1" />
              )}
            </button>

            <button
              onClick={() => skipForward(15)}
              className="p-3.5 bg-[#12100e] border border-stone-800 hover:border-[#FF9398]/50 text-stone-300 hover:text-white rounded-full transition-all relative group cursor-pointer"
              title="Adelantar 15s"
            >
              <RotateCw className="w-5 h-5" />
              <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-[9px] font-mono text-stone-400 group-hover:text-[#FF9398]">
                15
              </span>
            </button>

            <button
              onClick={nextChapter}
              disabled={
                !currentBook.sections ||
                currentSectionIndex >= currentBook.sections.length - 1
              }
              className="p-2.5 text-stone-400 hover:text-stone-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              title="Siguiente capítulo"
            >
              <SkipForward className="w-6 h-6" />
            </button>
          </div>

          {/* Quick Settings Bar: Speed, Sleep, Volume, Bookmark */}
          <div className="w-full flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-stone-900 px-2 text-xs font-mono">
            {/* Speed buttons */}
            <div className="flex items-center gap-1">
              <span className="text-stone-500 mr-1 text-[10px] uppercase">Vel:</span>
              {speedOptions.map((sp) => (
                <button
                  key={sp}
                  onClick={() => setPlaybackSpeed(sp)}
                  className={`px-2 py-1 rounded text-xs transition-colors cursor-pointer ${
                    playbackRate === sp
                      ? 'bg-[#FF9398] text-stone-950 font-bold'
                      : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
                  }`}
                >
                  {sp}x
                </button>
              ))}
            </div>

            {/* Sleep options */}
            <div className="flex items-center gap-1">
              <Moon className="w-3.5 h-3.5 text-stone-500 mr-1" />
              {sleepOptions.map((opt) => (
                <button
                  key={String(opt.value)}
                  onClick={() => setSleepTimer(opt.value)}
                  className={`px-2 py-1 rounded text-xs transition-colors cursor-pointer ${
                    sleepTimerOption === opt.value
                      ? 'bg-[#FF9398] text-stone-950 font-bold'
                      : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Bookmark button */}
            <button
              onClick={() => setShowAddBookmark(!showAddBookmark)}
              className="pill-btn outline text-[10px] py-1 px-3 cursor-pointer"
            >
              <BookmarkPlus className="w-3 h-3" />
              <span>Guardar nota</span>
            </button>
          </div>

          {/* Add Bookmark Form */}
          {showAddBookmark && (
            <form
              onSubmit={handleSaveBookmark}
              className="w-full p-4 bg-[#12100e] border border-stone-800 rounded-2xl space-y-3"
            >
              <div className="text-xs text-stone-300 font-mono">
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
                className="w-full px-3 py-2 bg-[#0c0a09] border border-stone-800 rounded-xl text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-[#FF9398]"
              />
              <div className="flex justify-end gap-2 font-mono">
                <button
                  type="button"
                  onClick={() => setShowAddBookmark(false)}
                  className="px-3 py-1 text-xs text-stone-400 hover:text-stone-200 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="pill-btn coral text-[10px] py-1 px-3 cursor-pointer"
                >
                  <span>Guardar</span>
                </button>
              </div>
            </form>
          )}

          {copiedBookmark && (
            <div className="text-xs text-emerald-400 font-medium flex items-center gap-1 font-mono">
              <Check className="w-3.5 h-3.5" />
              <span>&iexcl;Marcador guardado en tu colección!</span>
            </div>
          )}
        </div>

        {/* Right Column: Tabbed Chapters / Bookmarks / Details (5 cols) */}
        <div className="lg:col-span-5 h-[500px] bg-[#12100e] border border-stone-800 rounded-2xl flex flex-col overflow-hidden">
          {/* Tabs with Awwwards tracked style */}
          <div className="flex border-b border-stone-800 bg-[#0c0a09] text-xs font-mono tracking-wider uppercase">
            <button
              onClick={() => setActiveTab('chapters')}
              className={`flex-1 py-3.5 text-center transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'chapters'
                  ? 'text-[#FF9398] border-b-2 border-[#FF9398] bg-[#12100e] font-semibold'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <ListMusic className="w-3.5 h-3.5" />
              <span>Pistas ({sections.length || totalSections})</span>
            </button>
            <button
              onClick={() => setActiveTab('bookmarks')}
              className={`flex-1 py-3.5 text-center transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'bookmarks'
                  ? 'text-[#FF9398] border-b-2 border-[#FF9398] bg-[#12100e] font-semibold'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <BookmarkIcon className="w-3.5 h-3.5" />
              <span>Notas ({bookBookmarks.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('info')}
              className={`flex-1 py-3.5 text-center transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'info'
                  ? 'text-[#FF9398] border-b-2 border-[#FF9398] bg-[#12100e] font-semibold'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Info className="w-3.5 h-3.5" />
              <span>Ficha</span>
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {activeTab === 'chapters' && (
              <div className="space-y-1">
                {sections.length > 0 ? (
                  sections.map((sec, idx) => {
                    const isSecPlaying = currentSectionIndex === idx;
                    return (
                      <button
                        key={sec.id || idx}
                        onClick={() => playBook(currentBook, idx)}
                        className={`w-full text-left p-3 rounded-xl flex items-center justify-between gap-3 text-xs transition-colors cursor-pointer ${
                          isSecPlaying
                            ? 'bg-[#FF9398]/15 border border-[#FF9398]/30 text-[#FF9398]'
                            : 'hover:bg-stone-900 text-stone-300'
                        }`}
                      >
                        <div className="flex items-center gap-3 truncate">
                          <span
                            className={`w-5 font-mono text-[11px] tabular-nums shrink-0 ${
                              isSecPlaying ? 'text-[#FF9398] font-bold' : 'text-stone-500'
                            }`}
                          >
                            {idx + 1}
                          </span>
                          <span className="truncate font-sans font-medium">
                            {sec.title || `Capítulo ${idx + 1}`}
                          </span>
                        </div>
                        <span className="font-mono text-stone-500 tabular-nums shrink-0">
                          {sec.playtime ? formatDuration(sec.playtime) : ''}
                        </span>
                      </button>
                    );
                  })
                ) : (
                  <div className="text-center py-12 text-stone-500 text-xs font-mono">
                    Cargando índice de pistas...
                  </div>
                )}
              </div>
            )}

            {activeTab === 'bookmarks' && (
              <div className="space-y-2">
                {bookBookmarks.length > 0 ? (
                  bookBookmarks.map((bm) => (
                    <div
                      key={bm.id}
                      className="p-3 bg-[#0c0a09] border border-stone-800 rounded-xl flex items-center justify-between gap-3 text-xs group"
                    >
                      <div
                        onClick={() => {
                          playBook(currentBook, bm.sectionIndex, bm.timestamp);
                        }}
                        className="cursor-pointer flex-1 min-w-0"
                      >
                        <div className="flex items-center gap-2 text-[#FF9398] font-mono text-[11px]">
                          <Clock className="w-3 h-3" />
                          <span>{formatPlayerTime(bm.timestamp)}</span>
                          <span className="text-stone-600">&middot;</span>
                          <span className="truncate text-stone-400">{bm.sectionTitle}</span>
                        </div>
                        <p className="text-stone-200 mt-1 font-sans truncate">{bm.note}</p>
                      </div>

                      <button
                        onClick={() => removeBookmark(bm.id)}
                        className="p-1.5 text-stone-500 hover:text-rose-400 rounded transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                        title="Eliminar marcador"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-stone-500 text-xs space-y-2">
                    <BookmarkIcon className="w-8 h-8 mx-auto text-stone-700" />
                    <p className="font-sans">No tienes notas guardadas en este audiolibro.</p>
                    <button
                      onClick={() => setShowAddBookmark(true)}
                      className="text-[#FF9398] underline font-mono text-xs cursor-pointer"
                    >
                      Crear nota ahora
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'info' && (
              <div className="space-y-4 text-xs text-stone-300 leading-relaxed font-sans font-light">
                <div>
                  <h4 className="font-serif font-medium text-stone-200 text-sm mb-1">Sinopsis</h4>
                  <p className="text-stone-400 whitespace-pre-line max-h-48 overflow-y-auto leading-relaxed">
                    {currentBook.description || 'Sin descripción disponible.'}
                  </p>
                </div>

                <div className="pt-3 border-t border-stone-800 grid grid-cols-2 gap-3 text-stone-400 font-mono text-[11px]">
                  <div>
                    <span className="text-stone-500 block uppercase">Idioma:</span>
                    <span>{currentBook.language || 'Dominio Público'}</span>
                  </div>
                  <div>
                    <span className="text-stone-500 block uppercase">Año publicación:</span>
                    <span>{currentBook.copyright_year || 'Clásico'}</span>
                  </div>
                  <div>
                    <span className="text-stone-500 block uppercase">Duración total:</span>
                    <span className="font-mono text-stone-200">
                      {currentBook.totaltime || formatDuration(currentBook.totaltimesecs)}
                    </span>
                  </div>
                  <div>
                    <span className="text-stone-500 block uppercase">Archivo:</span>
                    <span className="text-[#FF9398]">LibriVox / Internet Archive</span>
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
