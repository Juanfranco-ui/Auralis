import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Share2,
  Check,
  Loader2,
  ArrowLeft,
  BookOpen,
} from 'lucide-react';
import { SeoHead } from '../components/SeoHead';
import { BookDetail } from '../components/BookDetail';
import { Book } from '../types/audiobook';
import { useAudioPlayer } from '../context/AudioPlayerContext';
import {
  getAuthorName,
  getBookCover,
  formatDuration,
  fetchBookDetails,
} from '../services/librivoxApi';

export const BookPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const {
    currentBook,
    currentSectionIndex,
    isPlaying,
    playBook,
    togglePlayPause,
    toggleFavorite,
    isFavorite,
    setIsExpanded,
  } = useAudioPlayer();

  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (!id) return;
    let isMounted = true;
    setLoading(true);
    setError(null);

    fetchBookDetails(id)
      .then((data) => {
        if (!isMounted) return;
        if (data) {
          setBook(data);
        } else {
          setError('No pudimos localizar este audiolibro en los archivos.');
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error('Error fetching book page:', err);
        setError('Error al conectar con los servidores de LibriVox e Internet Archive.');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-24 flex flex-col items-center justify-center text-stone-300 space-y-4 font-mono text-sm">
        <Loader2 className="w-8 h-8 animate-spin text-[#FF9398]" />
        <p>Cargando ficha del audiolibro y resolviendo capítulos...</p>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="p-8 bg-[#12100e] border border-stone-700 rounded-3xl space-y-3">
          <BookOpen className="w-10 h-10 mx-auto text-stone-500" />
          <h2 className="text-xl font-serif text-stone-100">Audiolibro no encontrado</h2>
          <p className="text-sm text-stone-300 leading-relaxed font-sans">
            {error || 'El identificador solicitado no coincide con ningún registro del catálogo.'}
          </p>
          <div className="pt-2">
            <Link to="/buscar" className="pill-btn coral text-xs sm:text-sm inline-flex font-bold">
              <span>Explorar otros libros</span>
              <span className="arr">&rarr;</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isFav = isFavorite(book.id);
  const isCurrentlyPlayingThisBook = currentBook?.id === book.id && isPlaying;
  const authorName = getAuthorName(book);
  const coverUrl = getBookCover(book);

  const handlePlayFirst = () => {
    if (currentBook?.id === book.id) {
      setIsExpanded(true);
      togglePlayPause();
    } else {
      playBook(book, 0);
    }
  };

  const handlePlaySection = (index: number) => {
    if (currentBook?.id === book.id && currentSectionIndex === index) {
      setIsExpanded(true);
      togglePlayPause();
    } else {
      playBook(book, index);
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const cleanDescriptionSnippet = book.description
    ? book.description.slice(0, 155).replace(/\s+/g, ' ').trim() + '...'
    : `Escucha el audiolibro completo de ${book.title} de ${authorName} gratis en Auralis.`;

  const structuredAudiobookSchema = {
    '@context': 'https://schema.org',
    '@type': 'Audiobook',
    name: book.title,
    author: {
      '@type': 'Person',
      name: authorName,
    },
    description: book.description || cleanDescriptionSnippet,
    image: coverUrl,
    inLanguage: book.language || 'es',
    duration: book.totaltime || formatDuration(book.totaltimesecs),
    encodingFormat: 'audio/mpeg',
    publisher: {
      '@type': 'Organization',
      name: 'LibriVox / Internet Archive',
    },
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    },
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-5">
      <SeoHead
        title={`${book.title} - ${authorName} | Audiolibro en Auralis`}
        description={cleanDescriptionSnippet}
        canonicalPath={`/libro/${encodeURIComponent(book.id)}`}
        ogType="book"
        ogImage={coverUrl}
        schemaJson={structuredAudiobookSchema}
      />

      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between text-xs font-mono text-stone-400 border-b border-stone-800 pb-3">
        <Link
          to="/"
          className="flex items-center gap-1.5 hover:text-[#FF9398] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Volver</span>
        </Link>

        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-stone-800 hover:text-white transition-colors text-xs font-mono text-stone-400"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copiado' : 'Compartir'}</span>
        </button>
      </div>

      {/* Book Cover */}
      <div className="flex justify-center">
        <div className="w-32 sm:w-40 aspect-[3/4] bg-[#0c0a09] rounded-xl overflow-hidden border border-stone-700 shadow-lg">
          {coverUrl ? (
            <img
              src={coverUrl}
              alt={book.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-[#0c0a09]">
              <BookOpen className="w-10 h-10 text-[#FF9398] mb-2" />
              <span className="font-serif text-sm font-semibold text-stone-200 line-clamp-3">
                {book.title}
              </span>
            </div>
          )}
        </div>
      </div>

      <BookDetail
        book={book}
        fullBook={book}
        isFav={isFav}
        isCurrentlyPlayingThisBook={isCurrentlyPlayingThisBook}
        currentSectionIndex={currentSectionIndex}
        isPlaying={isPlaying}
        onPlayFirst={handlePlayFirst}
        onPlaySection={handlePlaySection}
        onToggleFavorite={() => toggleFavorite(book)}
        onOpenPlayer={() => setIsExpanded(true)}
        showOpenPlayer={currentBook?.id === book.id}
      />
    </div>
  );
};
