import React from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { useAudioPlayer } from '../context/AudioPlayerContext';
import {
  getAuthorName,
  getBookCover,
} from '../services/librivoxApi';

export const PlayerBar: React.FC = () => {
  const {
    currentBook,
    currentSection,
    currentSectionIndex,
    isPlaying,
    isLoading,
    currentTime,
    duration,
    volume,
    isMuted,
    error,
    togglePlayPause,
    nextChapter,
    prevChapter,
    setAudioVolume,
    toggleMute,
    openBookDetail,
  } = useAudioPlayer();

  if (!currentBook) {
    return null;
  }

  const authorName = getAuthorName(currentBook);
  const coverUrl = getBookCover(currentBook);
  const sectionTitle = currentSection?.title || `Capítulo ${currentSectionIndex + 1}`;
  const totalSections = currentBook.sections?.length || currentBook.num_sections || 1;
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <aside
      aria-label="Reproductor de audio principal"
      className="fixed bottom-0 inset-x-0 z-40 bg-[#0c0a09]/98 backdrop-blur-xl border-t border-stone-800 text-stone-100 shadow-2xl transition-all"
    >
      {/* Top coral progress indicator line */}
      <div
        className="w-full h-1 bg-stone-900"
        role="progressbar"
        aria-valuenow={Math.round(progressPercent)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full bg-[#FF9398] transition-all duration-150"
          style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
        />
      </div>

      {/* Error notification if audio stream fails */}
      {error && (
        <div
          role="alert"
          aria-live="polite"
          className="bg-rose-950 text-rose-100 text-xs sm:text-sm px-4 py-2 flex items-center justify-between border-b border-rose-800 font-mono font-medium"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-300 shrink-0" />
            <span className="truncate">{error}</span>
          </div>
          <button
            onClick={() => togglePlayPause()}
            className="underline hover:text-white font-bold ml-4 shrink-0 cursor-pointer p-1"
          >
            Reintentar
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-3 sm:gap-6">
        {/* Left: Prominent Book Title, Cover & Author */}
        <div className="flex items-center gap-3 min-w-0 flex-1 sm:flex-initial sm:max-w-[45%]">
          <div
            onClick={() => openBookDetail(currentBook)}
            tabIndex={0}
            role="button"
            aria-label={`Ver detalles de ${currentBook.title}`}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') openBookDetail(currentBook);
            }}
            className="w-12 h-12 sm:w-14 sm:h-14 bg-stone-900 rounded-xl overflow-hidden shrink-0 border border-stone-700 cursor-pointer shadow-md group relative focus-visible:ring-2 focus-visible:ring-[#FF9398]"
          >
            {coverUrl ? (
              <img
                src={coverUrl}
                alt={currentBook.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[#FF9398] font-serif text-xs font-bold">
                Audio
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h4
              onClick={() => openBookDetail(currentBook)}
              className="text-sm sm:text-base md:text-lg font-serif font-bold text-stone-100 truncate hover:text-[#FF9398] cursor-pointer transition-colors leading-snug"
              title={currentBook.title}
            >
              {currentBook.title}
            </h4>
            <p className="text-xs sm:text-sm text-stone-300 font-normal truncate mt-0.5">
              <span>{authorName}</span>
              <span className="text-stone-500 mx-1.5">&middot;</span>
              <span className="text-[#FF9398] font-mono font-medium">
                Pista {currentSectionIndex + 1}/{totalSections}
              </span>
            </p>
          </div>
        </div>

        {/* Center: Playback Controls (Previous, Play/Pause, Next) */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          {/* Previous Chapter (Desktop/tablet only, hidden on mobile) */}
          <button
            onClick={prevChapter}
            disabled={currentSectionIndex === 0 && currentTime <= 4}
            className="hidden sm:inline-flex p-2 sm:p-2.5 text-stone-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-stone-900 rounded-xl transition-colors cursor-pointer"
            title="Capítulo anterior"
            aria-label="Ir al capítulo anterior"
          >
            <SkipBack className="w-5 h-5" />
          </button>

          {/* Main Play / Pause Button */}
          <button
            onClick={togglePlayPause}
            disabled={isLoading}
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#FF9398] hover:bg-white text-stone-950 flex items-center justify-center shadow-lg transition-all hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-80 font-bold"
            title={isPlaying ? 'Pausar reproducción' : 'Reanudar reproducción'}
            aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
            ) : (
              <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-current translate-x-0.5" />
            )}
          </button>

          {/* Next Chapter (Desktop/tablet only, hidden on mobile) */}
          <button
            onClick={nextChapter}
            disabled={
              !currentBook.sections ||
              currentSectionIndex >= currentBook.sections.length - 1
            }
            className="hidden sm:inline-flex p-2 sm:p-2.5 text-stone-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-stone-900 rounded-xl transition-colors cursor-pointer"
            title="Siguiente capítulo"
            aria-label="Ir al siguiente capítulo"
          >
            <SkipForward className="w-5 h-5" />
          </button>
        </div>

        {/* Right: Volume (Desktop only, hidden on mobile) */}
        <div className="hidden md:flex items-center gap-2 text-stone-300 shrink-0">
          <button
            onClick={toggleMute}
            className="p-2 sm:p-2.5 rounded-xl border border-stone-800 hover:border-stone-700 hover:text-white hover:bg-stone-900 transition-colors cursor-pointer"
            title={isMuted ? 'Activar sonido' : 'Silenciar'}
            aria-label={isMuted ? 'Activar sonido' : 'Silenciar'}
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 text-stone-400" />
            ) : (
              <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />
            )}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.02}
            value={isMuted ? 0 : volume}
            onChange={(e) => setAudioVolume(Number(e.target.value))}
            className="w-20 h-2 bg-stone-800 rounded-lg appearance-none cursor-pointer focus:outline-none"
            aria-label="Volumen del reproductor"
          />
        </div>
      </div>
    </aside>
  );
};
