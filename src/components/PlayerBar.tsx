import React, { useState } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Maximize2,
  Moon,
  BookmarkPlus,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { useAudioPlayer } from '../context/AudioPlayerContext';
import {
  getAuthorName,
  getBookCover,
  formatPlayerTime,
} from '../services/librivoxApi';
import { SleepTimerOption } from '../types/audiobook';

export const PlayerBar: React.FC = () => {
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
    error,
    sleepTimerOption,
    sleepTimerSeconds,
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
    setIsExpanded,
    openBookDetail,
  } = useAudioPlayer();

  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showSleepMenu, setShowSleepMenu] = useState(false);
  const [showBookmarkSuccess, setShowBookmarkSuccess] = useState(false);

  if (!currentBook) {
    return null;
  }

  const authorName = getAuthorName(currentBook);
  const coverUrl = getBookCover(currentBook);
  const sectionTitle = currentSection?.title || `Capítulo ${currentSectionIndex + 1}`;
  const totalSections = currentBook.sections?.length || currentBook.num_sections || 1;

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleBookmarkClick = () => {
    addBookmark();
    setShowBookmarkSuccess(true);
    setTimeout(() => setShowBookmarkSuccess(false), 2000);
  };

  const speedOptions = [0.75, 1, 1.25, 1.5, 1.75, 2];
  const sleepOptions: { label: string; value: SleepTimerOption }[] = [
    { label: 'Desactivado', value: 0 },
    { label: '5 min', value: 5 },
    { label: '15 min', value: 15 },
    { label: '30 min', value: 30 },
    { label: '45 min', value: 45 },
    { label: '60 min', value: 60 },
    { label: 'Fin de capítulo', value: 'end_of_chapter' },
  ];

  return (
    <aside
      aria-label="Reproductor de audio"
      className="fixed bottom-0 inset-x-0 z-40 bg-[#0c0a09]/95 backdrop-blur-xl border-t border-stone-800 text-stone-100 shadow-2xl transition-all"
    >
      {/* Top coral micro progress line */}
      <div className="w-full h-[2px] bg-stone-900">
        <div
          className="h-full bg-[#FF9398] transition-all duration-150"
          style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
        />
      </div>

      {/* Error notification if stream fails */}
      {error && (
        <div className="bg-rose-950/90 text-rose-200 text-xs px-4 py-1.5 flex items-center justify-between border-b border-rose-900 font-mono">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span className="truncate">{error}</span>
          </div>
          <button
            onClick={() => togglePlayPause()}
            className="underline hover:text-white font-medium ml-4 shrink-0 cursor-pointer"
          >
            Reintentar
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2 sm:py-3.5 flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Book & Chapter metadata */}
        <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 max-w-[42%] sm:max-w-[28%]">
          <div
            onClick={() => setIsExpanded(true)}
            className="w-10 h-10 sm:w-12 sm:h-12 bg-stone-900 rounded-lg overflow-hidden shrink-0 border border-stone-800 cursor-pointer shadow-md group relative"
          >
            {coverUrl ? (
              <img
                src={coverUrl}
                alt={currentBook.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[#FF9398]/60 font-serif text-[10px] sm:text-xs">
                Audio
              </div>
            )}
            <div className="absolute inset-0 bg-stone-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <Maximize2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" />
            </div>
          </div>

          <div className="min-w-0">
            <h4
              onClick={() => openBookDetail(currentBook)}
              className="text-xs sm:text-sm font-serif font-medium text-stone-100 truncate hover:text-[#FF9398] cursor-pointer transition-colors leading-tight"
              title={currentBook.title}
            >
              {currentBook.title}
            </h4>
            <p className="text-[11px] sm:text-xs text-stone-400 font-light truncate mt-0.5">
              {authorName}
            </p>
            {/* Desktop track detail */}
            <div className="hidden sm:flex items-center gap-1.5 text-[10px] text-[#FF9398] truncate font-mono mt-0.5">
              <span>Pista {currentSectionIndex + 1}/{totalSections}</span>
              <span aria-hidden="true">&middot;</span>
              <span className="truncate">{sectionTitle}</span>
            </div>
          </div>
        </div>

        {/* Center: Playback Controls & Scrubber */}
        <div className="flex-1 max-w-2xl flex flex-col items-center gap-1">
          {/* Main buttons - on mobile ONLY -15s, Play/Pause, and +15s (prev/next chapter hidden on mobile) */}
          <div className="flex items-center gap-2 sm:gap-5">
            {/* Prev Chapter: HIDDEN on mobile for minimalist footprint */}
            <button
              onClick={prevChapter}
              disabled={currentSectionIndex === 0 && currentTime <= 4}
              className="hidden sm:inline-flex p-1.5 text-stone-400 hover:text-stone-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              title="Capítulo anterior"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            {/* Rewind 15s */}
            <button
              onClick={() => skipBackward(15)}
              className="p-1.5 text-stone-400 hover:text-stone-100 transition-colors flex items-center justify-center relative group cursor-pointer"
              title="Retroceder 15 segundos"
            >
              <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="absolute -bottom-1.5 sm:-bottom-2 text-[8px] sm:text-[9px] font-mono text-stone-400 group-hover:text-[#FF9398]">
                15
              </span>
            </button>

            {/* Main Play / Pause */}
            <button
              onClick={togglePlayPause}
              disabled={isLoading}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#FF9398] hover:bg-white text-stone-950 flex items-center justify-center shadow-lg transition-all hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-80"
              title={isPlaying ? 'Pausar' : 'Reproducir'}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
              ) : isPlaying ? (
                <Pause className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
              ) : (
                <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current translate-x-0.5" />
              )}
            </button>

            {/* Forward 15s */}
            <button
              onClick={() => skipForward(15)}
              className="p-1.5 text-stone-400 hover:text-stone-100 transition-colors flex items-center justify-center relative group cursor-pointer"
              title="Adelantar 15 segundos"
            >
              <RotateCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="absolute -bottom-1.5 sm:-bottom-2 text-[8px] sm:text-[9px] font-mono text-stone-400 group-hover:text-[#FF9398]">
                15
              </span>
            </button>

            {/* Next Chapter: HIDDEN on mobile for minimalist footprint */}
            <button
              onClick={nextChapter}
              disabled={
                !currentBook.sections ||
                currentSectionIndex >= currentBook.sections.length - 1
              }
              className="hidden sm:inline-flex p-1.5 text-stone-400 hover:text-stone-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              title="Siguiente capítulo"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>

          {/* Scrubber slider bar */}
          <div className="w-full flex items-center gap-2 sm:gap-3 text-[10px] sm:text-[11px] font-mono text-stone-400">
            <span className="tabular-nums w-8 sm:w-10 text-right">
              {formatPlayerTime(currentTime)}
            </span>

            <input
              type="range"
              min={0}
              max={duration || 100}
              step={1}
              value={currentTime}
              onChange={(e) => seekTo(Number(e.target.value))}
              className="w-full h-1 sm:h-1.5 bg-stone-900 rounded-lg appearance-none cursor-pointer focus:outline-none"
              aria-label="Posición de reproducción"
            />

            <span className="tabular-nums w-8 sm:w-10 text-left">
              {duration > 0
                ? `-${formatPlayerTime(Math.max(0, duration - currentTime))}`
                : formatPlayerTime(duration)}
            </span>
          </div>
        </div>

        {/* Right: Speed, Sleep Timer, Volume, Fullscreen */}
        <div className="flex items-center gap-1 sm:gap-3 text-stone-400 shrink-0">
          {/* Speed button & menu */}
          <div className="relative">
            <button
              onClick={() => {
                setShowSpeedMenu(!showSpeedMenu);
                setShowSleepMenu(false);
              }}
              className="px-1.5 sm:px-2 py-1 text-[11px] sm:text-xs font-mono rounded hover:bg-stone-900 hover:text-stone-100 transition-colors cursor-pointer"
              title="Velocidad"
            >
              {playbackRate}x
            </button>

            {showSpeedMenu && (
              <div className="absolute bottom-11 right-0 p-1.5 bg-[#12100e] border border-stone-800 rounded-xl shadow-2xl flex flex-col gap-1 min-w-[70px] z-50">
                {speedOptions.map((speed) => (
                  <button
                    key={speed}
                    onClick={() => {
                      setPlaybackSpeed(speed);
                      setShowSpeedMenu(false);
                    }}
                    className={`px-3 py-1 text-xs font-mono rounded text-center transition-colors cursor-pointer ${
                      playbackRate === speed
                        ? 'bg-[#FF9398] text-stone-950 font-bold'
                        : 'text-stone-300 hover:bg-stone-800'
                    }`}
                  >
                    {speed}x
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sleep Timer & menu */}
          <div className="relative">
            <button
              onClick={() => {
                setShowSleepMenu(!showSleepMenu);
                setShowSpeedMenu(false);
              }}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer relative ${
                sleepTimerOption !== 0
                  ? 'text-[#FF9398] bg-[#FF9398]/10'
                  : 'hover:text-stone-100 hover:bg-stone-900'
              }`}
              title="Temporizador de apagado"
            >
              <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              {sleepTimerSeconds !== null && sleepTimerSeconds > 0 && (
                <span className="absolute -top-1 -right-2 px-1 text-[8px] sm:text-[9px] font-mono bg-[#FF9398] text-stone-950 rounded-full font-bold">
                  {Math.ceil(sleepTimerSeconds / 60)}m
                </span>
              )}
            </button>

            {showSleepMenu && (
              <div className="absolute bottom-11 right-0 p-2 bg-[#12100e] border border-stone-800 rounded-xl shadow-2xl flex flex-col gap-1 min-w-[150px] z-50 text-xs">
                <div className="px-2 py-1 text-[10px] text-stone-500 font-mono uppercase tracking-wider">
                  Temporizador
                </div>
                {sleepOptions.map((opt) => (
                  <button
                    key={String(opt.value)}
                    onClick={() => {
                      setSleepTimer(opt.value);
                      setShowSleepMenu(false);
                    }}
                    className={`px-3 py-1.5 text-left rounded-md transition-colors cursor-pointer font-mono ${
                      sleepTimerOption === opt.value
                        ? 'bg-[#FF9398] text-stone-950 font-semibold'
                        : 'text-stone-300 hover:bg-stone-800'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Bookmark button - hidden on small mobile for maximum minimal footprint */}
          <button
            onClick={handleBookmarkClick}
            className="hidden sm:inline-flex p-1.5 rounded-lg hover:text-stone-100 hover:bg-stone-900 transition-colors relative cursor-pointer"
            title="Guardar marcador"
          >
            <BookmarkPlus className="w-4 h-4" />
            {showBookmarkSuccess && (
              <span className="absolute -top-7 -left-12 px-2 py-0.5 bg-[#FF9398] text-stone-950 text-[10px] rounded font-medium shadow-md whitespace-nowrap font-mono">
                &iexcl;Nota guardada!
              </span>
            )}
          </button>

          {/* Volume Control - desktop only */}
          <div className="hidden md:flex items-center gap-1.5">
            <button
              onClick={toggleMute}
              className="p-1.5 rounded-lg hover:text-stone-100 hover:bg-stone-900 transition-colors cursor-pointer"
              title={isMuted ? 'Activar sonido' : 'Silenciar'}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4 text-stone-600" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.02}
              value={isMuted ? 0 : volume}
              onChange={(e) => setAudioVolume(Number(e.target.value))}
              className="w-16 h-1 bg-stone-900 rounded-lg appearance-none cursor-pointer focus:outline-none"
              aria-label="Volumen"
            />
          </div>

          {/* Expand Full Player */}
          <button
            onClick={() => setIsExpanded(true)}
            className="p-1.5 rounded-lg hover:text-stone-100 hover:bg-stone-900 transition-colors cursor-pointer"
            title="Expandir reproductor completo"
          >
            <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
