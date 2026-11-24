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
  decodeHtmlEntities,
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
    setIsExpanded,
  } = useAudioPlayer();

  if (!currentBook) {
    return null;
  }

  const authorName = getAuthorName(currentBook);
  const coverUrl = getBookCover(currentBook);
  const sectionTitle = decodeHtmlEntities(currentSection?.title) || `Capítulo ${currentSectionIndex + 1}`;
  const totalSections = currentBook.sections?.length || currentBook.num_sections || 1;
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <aside
      aria-label="Reproductor de audio principal"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-stone-800 bg-[#0c0a09] text-stone-100 shadow-2xl"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div
        className="h-0.5 w-full bg-stone-900"
        role="progressbar"
        aria-label="Progreso de reproducción"
        aria-valuenow={Math.round(progressPercent)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full bg-[#FF9398] transition-all duration-150"
          style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
        />
      </div>

      {error && (
        <div
          role="alert"
          aria-live="polite"
          className="flex items-center justify-between gap-3 border-b border-rose-800 bg-rose-950 px-3 py-2 text-xs font-mono font-medium text-rose-100 sm:px-6 sm:text-sm"
        >
          <div className="flex min-w-0 items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-300 shrink-0" />
            <span className="line-clamp-2">{error}</span>
          </div>
          <button
            type="button"
            onClick={() => togglePlayPause()}
            className="min-h-10 shrink-0 px-2 font-bold underline hover:text-white"
          >
            Reintentar
          </button>
        </div>
      )}

      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-3 py-2 sm:gap-5 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => setIsExpanded(true)}
          aria-label={`Abrir reproductor expandido para ${currentBook.title}`}
          className="flex min-w-0 flex-1 items-center gap-2.5 rounded-lg text-left focus-visible:ring-2 focus-visible:ring-[#FF9398] sm:gap-3"
        >
          <div
            className="relative h-11 w-11 shrink-0 overflow-hidden rounded-sm border border-stone-700 bg-stone-900 sm:h-12 sm:w-12"
          >
            {coverUrl ? (
              <img
                src={coverUrl}
                alt=""
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center font-serif text-xs font-bold text-[#FF9398]">
                Audio
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h4
              className="truncate font-serif text-sm font-medium leading-snug text-stone-100 sm:text-base"
              title={currentBook.title}
            >
              {currentBook.title}
            </h4>
            <p className="mt-0 truncate text-[11px] text-stone-300 sm:text-xs">
              <span>{authorName}</span>
              <span className="mx-1 text-stone-500">&middot;</span>
              <span className="font-mono text-[10px] font-medium text-[#FF9398] sm:text-[11px]">
                {currentSectionIndex + 1}/{totalSections}
              </span>
            </p>
          </div>
        </button>

        <div className="flex shrink-0 items-center gap-0.5 sm:gap-2">
          <button
            type="button"
            onClick={prevChapter}
            disabled={currentSectionIndex === 0 && currentTime <= 4}
            className="flex h-10 w-10 items-center justify-center rounded-full text-stone-300 transition-colors hover:bg-stone-900 hover:text-white disabled:cursor-not-allowed disabled:opacity-30 sm:h-11 sm:w-11"
            aria-label="Capítulo anterior"
          >
            <SkipBack className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>

          <button
            type="button"
            onClick={togglePlayPause}
            disabled={isLoading}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-[#FF9398] font-bold text-stone-950 transition-colors hover:bg-white disabled:opacity-80 sm:h-12 sm:w-12"
            title={isPlaying ? 'Pausar reproducción' : 'Reanudar reproducción'}
            aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin sm:h-6 sm:w-6" />
            ) : isPlaying ? (
              <Pause className="h-5 w-5 fill-current sm:h-6 sm:w-6" />
            ) : (
              <Play className="h-5 w-5 translate-x-0.5 fill-current sm:h-6 sm:w-6" />
            )}
          </button>

          <button
            type="button"
            onClick={nextChapter}
            disabled={
              !currentBook.sections ||
              currentSectionIndex >= currentBook.sections.length - 1
            }
            className="flex h-10 w-10 items-center justify-center rounded-full text-stone-300 transition-colors hover:bg-stone-900 hover:text-white disabled:cursor-not-allowed disabled:opacity-30 sm:h-11 sm:w-11"
            aria-label="Siguiente capítulo"
          >
            <SkipForward className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        </div>

        <div className="hidden shrink-0 items-center gap-2 text-stone-300 md:flex">
          <button
            type="button"
            onClick={toggleMute}
            className="flex h-10 w-10 items-center justify-center rounded-full text-stone-300 transition-colors hover:bg-stone-900 hover:text-white"
            title={isMuted ? 'Activar sonido' : 'Silenciar'}
            aria-label={isMuted ? 'Activar sonido' : 'Silenciar'}
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="h-4 w-4 text-stone-400 sm:h-5 sm:w-5" />
            ) : (
              <Volume2 className="h-4 w-4 sm:h-5 sm:w-5" />
            )}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.02}
            value={isMuted ? 0 : volume}
            onChange={(e) => setAudioVolume(Number(e.target.value))}
            className="h-2 w-20"
            aria-label="Volumen del reproductor"
          />
        </div>
      </div>
    </aside>
  );
};
