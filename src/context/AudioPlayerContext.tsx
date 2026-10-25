import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  ReactNode,
} from 'react';
import {
  Book,
  Section,
  Bookmark,
  HistoryItem,
  SleepTimerOption,
} from '../types/audiobook';
import { fetchBookDetails, getAuthorName, getBookCover } from '../services/librivoxApi';

interface AudioPlayerContextType {
  currentBook: Book | null;
  currentSection: Section | null;
  currentSectionIndex: number;
  isPlaying: boolean;
  isLoading: boolean;
  currentTime: number;
  duration: number;
  playbackRate: number;
  volume: number;
  isMuted: boolean;
  isExpanded: boolean;
  error: string | null;
  sleepTimerOption: SleepTimerOption;
  sleepTimerSeconds: number | null;
  bookmarks: Bookmark[];
  favorites: Book[];
  history: HistoryItem[];
  selectedBookForDetail: Book | null;

  // Actions
  playBook: (book: Book, sectionIndex?: number, startAtTime?: number) => Promise<void>;
  togglePlayPause: () => void;
  seekTo: (seconds: number) => void;
  skipForward: (seconds?: number) => void;
  skipBackward: (seconds?: number) => void;
  nextChapter: () => void;
  prevChapter: () => void;
  setPlaybackSpeed: (speed: number) => void;
  setAudioVolume: (vol: number) => void;
  toggleMute: () => void;
  setSleepTimer: (option: SleepTimerOption) => void;
  addBookmark: (note?: string) => void;
  removeBookmark: (id: string) => void;
  toggleFavorite: (book: Book) => void;
  isFavorite: (bookId: string) => boolean;
  setIsExpanded: (expanded: boolean) => void;
  openBookDetail: (book: Book) => void;
  closeBookDetail: () => void;
}

const AudioPlayerContext = createContext<AudioPlayerContextType | undefined>(undefined);

const STORAGE_KEY_FAVORITES = 'librivox_favs_v1';
const STORAGE_KEY_HISTORY = 'librivox_history_v1';
const STORAGE_KEY_BOOKMARKS = 'librivox_bookmarks_v1';
const STORAGE_KEY_LAST_STATE = 'librivox_last_state_v1';

export const AudioPlayerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [currentBook, setCurrentBook] = useState<Book | null>(null);
  const [currentSectionIndex, setCurrentSectionIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [playbackRate, setPlaybackRateState] = useState<number>(1);
  const [volume, setVolumeState] = useState<number>(0.9);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [sleepTimerOption, setSleepTimerOption] = useState<SleepTimerOption>(0);
  const [sleepTimerSeconds, setSleepTimerSeconds] = useState<number | null>(null);

  const [selectedBookForDetail, setSelectedBookForDetail] = useState<Book | null>(null);

  // Persistent collections
  const [favorites, setFavorites] = useState<Book[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_FAVORITES);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_HISTORY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [bookmarks, setBookmarks] = useState<Bookmark[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_BOOKMARKS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Initialize Audio element once
  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'metadata';
    audioRef.current = audio;

    const handleWaiting = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);
    const handlePlaying = () => {
      setIsLoading(false);
      setIsPlaying(true);
      setError(null);
    };
    const handlePause = () => setIsPlaying(false);

    const handleTimeUpdate = () => {
      if (!audio) return;
      setCurrentTime(audio.currentTime);
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
      setIsLoading(false);
    };

    const handleError = () => {
      setIsLoading(false);
      setIsPlaying(false);
      const audioError = audio.error;
      let msg = 'No se pudo reproducir este audio. Es posible que el archivo esté temporalmente inaccesible.';
      if (audioError) {
        if (audioError.code === 2) msg = 'Error de red al cargar el audio.';
        else if (audioError.code === 3) msg = 'Error al decodificar el archivo de audio.';
        else if (audioError.code === 4) msg = 'Formato de audio no soportado o archivo no encontrado.';
      }
      setError(msg);
    };

    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('playing', handlePlaying);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('error', handleError);

    return () => {
      audio.pause();
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('playing', handlePlaying);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('error', handleError);
      audioRef.current = null;
    };
  }, []);

  // Save collections to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_FAVORITES, JSON.stringify(favorites));
    } catch (e) {
      console.warn('Failed to save favorites to localStorage', e);
    }
  }, [favorites]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(history.slice(0, 30)));
    } catch (e) {
      console.warn('Failed to save history to localStorage', e);
    }
  }, [history]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_BOOKMARKS, JSON.stringify(bookmarks));
    } catch (e) {
      console.warn('Failed to save bookmarks to localStorage', e);
    }
  }, [bookmarks]);

  // Current section getter
  const currentSection: Section | null =
    currentBook?.sections && currentBook.sections.length > currentSectionIndex
      ? currentBook.sections[currentSectionIndex]
      : null;

  // Track progress and update history
  const updateHistoryRef = useRef<() => void>(() => {});
  updateHistoryRef.current = () => {
    if (!currentBook || !currentBook.id) return;
    const progress = duration > 0 ? Math.min(100, Math.round((currentTime / duration) * 100)) : 0;

    setHistory((prev) => {
      const filtered = prev.filter((item) => item.book.id !== currentBook.id);
      const newItem: HistoryItem = {
        book: currentBook,
        currentSectionIndex,
        currentTime,
        duration: duration || (currentSection ? Number(currentSection.playtime) || 0 : 0),
        lastPlayedAt: Date.now(),
        completedPercentage: progress,
      };
      return [newItem, ...filtered];
    });

    // Also persist last active state
    try {
      localStorage.setItem(
        STORAGE_KEY_LAST_STATE,
        JSON.stringify({
          bookId: currentBook.id,
          sectionIndex: currentSectionIndex,
          currentTime,
        })
      );
    } catch {
      // ignore
    }
  };

  // Periodically update history while playing
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      updateHistoryRef.current();
    }, 5000);
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Handle Chapter Ended
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      // Check sleep timer 'end_of_chapter'
      if (sleepTimerOption === 'end_of_chapter') {
        setIsPlaying(false);
        setSleepTimerOption(0);
        setSleepTimerSeconds(null);
        return;
      }

      // Next chapter if available
      if (currentBook?.sections && currentSectionIndex < currentBook.sections.length - 1) {
        const nextIndex = currentSectionIndex + 1;
        setCurrentSectionIndex(nextIndex);
        const nextSec = currentBook.sections[nextIndex];
        if (nextSec?.listen_url) {
          audio.src = nextSec.listen_url;
          audio.currentTime = 0;
          audio
            .play()
            .then(() => setIsPlaying(true))
            .catch(() => setIsPlaying(false));
        }
      } else {
        setIsPlaying(false);
      }
    };

    audio.addEventListener('ended', handleEnded);
    return () => audio.removeEventListener('ended', handleEnded);
  }, [currentBook, currentSectionIndex, sleepTimerOption]);

  // Sleep Timer Countdown
  useEffect(() => {
    if (typeof sleepTimerOption === 'number' && sleepTimerOption > 0) {
      setSleepTimerSeconds(sleepTimerOption * 60);
    } else if (sleepTimerOption === 0) {
      setSleepTimerSeconds(null);
    }
  }, [sleepTimerOption]);

  useEffect(() => {
    if (sleepTimerSeconds === null || sleepTimerSeconds <= 0) return;

    const timer = setInterval(() => {
      setSleepTimerSeconds((prev) => {
        if (prev === null) return null;
        if (prev <= 1) {
          // Time expired! Pause audio
          if (audioRef.current) {
            audioRef.current.pause();
          }
          setIsPlaying(false);
          setSleepTimerOption(0);
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [sleepTimerSeconds]);

  // Play a book and ensure full chapters are resolved
  const playBook = useCallback(
    async (book: Book, sectionIndex: number = 0, startAtTime?: number) => {
      setError(null);
      setIsLoading(true);

      let targetBook = book;
      // If sections aren't loaded, empty, or missing listen_urls, fetch full detail
      const hasValidSections =
        targetBook.sections &&
        targetBook.sections.length > 0 &&
        targetBook.sections.some((s) => !!s.listen_url);

      if (!hasValidSections) {
        try {
          const fullBook = await fetchBookDetails(book.id, book);
          if (fullBook && fullBook.sections && fullBook.sections.length > 0) {
            targetBook = fullBook;
          }
        } catch (err) {
          console.warn('Failed to load full book details:', err);
        }
      }

      setCurrentBook(targetBook);
      const safeIndex =
        targetBook.sections && targetBook.sections.length > 0
          ? Math.max(0, Math.min(sectionIndex, targetBook.sections.length - 1))
          : 0;
      setCurrentSectionIndex(safeIndex);

      const targetSection = targetBook.sections?.[safeIndex];
      const audio = audioRef.current;

      if (!audio) {
        setIsLoading(false);
        return;
      }

      // Stop any previously playing track cleanly before loading new audio
      try {
        audio.pause();
      } catch {
        // ignore
      }

      if (!targetSection?.listen_url) {
        setError('Este audiolibro no tiene un enlace de reproducción válido disponible.');
        setIsLoading(false);
        return;
      }

      try {
        audio.src = targetSection.listen_url;
        audio.playbackRate = playbackRate;
        audio.volume = isMuted ? 0 : volume;

        if (startAtTime && startAtTime > 0) {
          audio.currentTime = startAtTime;
          setCurrentTime(startAtTime);
        } else {
          audio.currentTime = 0;
          setCurrentTime(0);
        }

        await audio.play();
        setIsPlaying(true);
      } catch (err: any) {
        console.error('Audio play error:', err);
        // If autoplay blocked or file issue
        if (err.name === 'NotAllowedError') {
          setError('Haz clic en Reproducir para comenzar (el navegador requiere interacción directa).');
        } else {
          setError('No se pudo iniciar la reproducción del audio.');
        }
        setIsPlaying(false);
      } finally {
        setIsLoading(false);
      }
    },
    [playbackRate, volume, isMuted]
  );

  const togglePlayPause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      updateHistoryRef.current();
    } else {
      if (audio.src) {
        audio
          .play()
          .then(() => setIsPlaying(true))
          .catch((err) => {
            console.error('Play error:', err);
            setError('Error al reanudar la reproducción.');
          });
      } else if (currentBook) {
        playBook(currentBook, currentSectionIndex, currentTime);
      }
    }
  }, [isPlaying, currentBook, currentSectionIndex, currentTime, playBook]);

  const seekTo = useCallback((seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    const safeTime = Math.max(0, Math.min(seconds, audio.duration || seconds));
    audio.currentTime = safeTime;
    setCurrentTime(safeTime);
  }, []);

  const skipForward = useCallback((seconds: number = 15) => {
    const audio = audioRef.current;
    if (!audio) return;
    const newTime = Math.min(audio.currentTime + seconds, audio.duration || audio.currentTime + seconds);
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  }, []);

  const skipBackward = useCallback((seconds: number = 15) => {
    const audio = audioRef.current;
    if (!audio) return;
    const newTime = Math.max(0, audio.currentTime - seconds);
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  }, []);

  const nextChapter = useCallback(() => {
    if (!currentBook?.sections) return;
    if (currentSectionIndex < currentBook.sections.length - 1) {
      playBook(currentBook, currentSectionIndex + 1);
    }
  }, [currentBook, currentSectionIndex, playBook]);

  const prevChapter = useCallback(() => {
    if (!currentBook?.sections) return;
    if (currentTime > 4) {
      // If played more than 4 seconds, restart current chapter
      seekTo(0);
    } else if (currentSectionIndex > 0) {
      playBook(currentBook, currentSectionIndex - 1);
    }
  }, [currentBook, currentSectionIndex, currentTime, playBook, seekTo]);

  const setPlaybackSpeed = useCallback((speed: number) => {
    setPlaybackRateState(speed);
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  }, []);

  const setAudioVolume = useCallback((vol: number) => {
    const clamped = Math.max(0, Math.min(1, vol));
    setVolumeState(clamped);
    setIsMuted(clamped === 0);
    if (audioRef.current) {
      audioRef.current.volume = clamped;
    }
  }, []);

  const toggleMute = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isMuted) {
      audio.volume = volume || 0.8;
      setIsMuted(false);
    } else {
      audio.volume = 0;
      setIsMuted(true);
    }
  }, [isMuted, volume]);

  const setSleepTimer = useCallback((option: SleepTimerOption) => {
    setSleepTimerOption(option);
  }, []);

  const addBookmark = useCallback(
    (note: string = '') => {
      if (!currentBook) return;
      const secTitle = currentSection?.title || `Capítulo ${currentSectionIndex + 1}`;
      const newBookmark: Bookmark = {
        id: `bm_${Date.now()}`,
        bookId: currentBook.id,
        bookTitle: currentBook.title,
        coverUrl: getBookCover(currentBook),
        sectionIndex: currentSectionIndex,
        sectionTitle: secTitle,
        timestamp: Math.round(currentTime),
        note: note.trim() || 'Marcador guardado',
        createdAt: Date.now(),
      };
      setBookmarks((prev) => [newBookmark, ...prev]);
    },
    [currentBook, currentSection, currentSectionIndex, currentTime]
  );

  const removeBookmark = useCallback((id: string) => {
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
  }, []);

  const toggleFavorite = useCallback((book: Book) => {
    setFavorites((prev) => {
      const exists = prev.some((b) => b.id === book.id);
      if (exists) {
        return prev.filter((b) => b.id !== book.id);
      } else {
        return [book, ...prev];
      }
    });
  }, []);

  const isFavorite = useCallback(
    (bookId: string): boolean => {
      return favorites.some((b) => b.id === bookId);
    },
    [favorites]
  );

  const openBookDetail = useCallback((book: Book) => {
    setSelectedBookForDetail(book);
  }, []);

  const closeBookDetail = useCallback(() => {
    setSelectedBookForDetail(null);
  }, []);

  return (
    <AudioPlayerContext.Provider
      value={{
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
        error,
        sleepTimerOption,
        sleepTimerSeconds,
        bookmarks,
        favorites,
        history,
        selectedBookForDetail,

        playBook,
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
        toggleFavorite,
        isFavorite,
        setIsExpanded,
        openBookDetail,
        closeBookDetail,
      }}
    >
      {children}
    </AudioPlayerContext.Provider>
  );
};

export const useAudioPlayer = (): AudioPlayerContextType => {
  const context = useContext(AudioPlayerContext);
  if (!context) {
    throw new Error('useAudioPlayer must be used within an AudioPlayerProvider');
  }
  return context;
};
