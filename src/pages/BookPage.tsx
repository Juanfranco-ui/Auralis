import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Play,
  Pause,
  Heart,
  Clock,
  BookOpen,
  ExternalLink,
  Volume2,
  ListMusic,
  Share2,
  Check,
  Loader2,
  ArrowLeft,
  Disc3,
} from 'lucide-react';
import { SeoHead } from '../components/SeoHead';
import { Book, Section } from '../types/audiobook';
import { useAudioPlayer } from '../context/AudioPlayerContext';
import {
  getAuthorName,
  getBookCover,
  formatDuration,
  fetchBookDetails,
} from '../services/librivoxApi';

export const BookPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

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
  const [showFullDesc, setShowFullDesc] = useState<boolean>(false);

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
  const sections: Section[] = book.sections || [];

  const handlePlayFirst = () => {
    if (currentBook?.id === book.id) {
      togglePlayPause();
    } else {
      playBook(book, 0);
    }
  };

  const handlePlaySection = (index: number) => {
    if (currentBook?.id === book.id && currentSectionIndex === index) {
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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      <SeoHead
        title={`${book.title} - ${authorName} | Audiolibro en Auralis`}
        description={cleanDescriptionSnippet}
        canonicalPath={`/libro/${encodeURIComponent(book.id)}`}
        ogType="book"
        ogImage={coverUrl}
        schemaJson={structuredAudiobookSchema}
      />

      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between text-xs sm:text-sm font-mono text-stone-300 border-b border-stone-800 pb-4 font-medium">
        <Link
          to="/"
          className="flex items-center gap-2 hover:text-[#FF9398] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al Catálogo</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-900 border border-stone-700 hover:text-white transition-colors cursor-pointer text-xs sm:text-sm font-mono font-medium"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
            <span>{copied ? '¡Enlace copiado!' : 'Compartir'}</span>
          </button>
        </div>
      </div>

      {/* Main Book Lockup Card */}
      <div className="p-6 sm:p-10 bg-[#12100e] border border-stone-700 rounded-3xl shadow-xl flex flex-col md:flex-row gap-8 items-start">
        {/* Cover Art */}
        <div className="w-44 sm:w-64 aspect-[3/4] bg-[#0c0a09] rounded-2xl overflow-hidden border border-stone-700 shrink-0 shadow-2xl mx-auto md:mx-0">
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

        {/* Book Details */}
        <div className="flex-1 space-y-4 w-full">
          <div>
            <div className="text-xs font-mono tracking-wider text-[#FF9398] uppercase mb-1 font-bold">
              FICHA DEL ARCHIVO &middot; ID #{book.id}
            </div>
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-serif font-light text-stone-100 leading-tight">
              {book.title}
            </h1>
            <p className="text-base sm:text-xl text-[#FF9398] font-sans font-medium mt-1">
              {authorName}
            </p>
          </div>

          {/* Metadata Badges */}
          <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm font-mono text-stone-300 font-medium">
            <span>{book.language || 'Dominio Público'}</span>
            <span aria-hidden="true">&middot;</span>
            {book.copyright_year && (
              <>
                <span>Año {book.copyright_year}</span>
                <span aria-hidden="true">&middot;</span>
              </>
            )}
            <span>
              {book.totaltime || formatDuration(book.totaltimesecs)}
            </span>
            <span aria-hidden="true">&middot;</span>
            <span>{sections.length || book.num_sections || 1} capítulos</span>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={handlePlayFirst}
              className="pill-btn coral text-xs sm:text-sm py-3 px-6 cursor-pointer shadow-xl font-bold"
            >
              {isCurrentlyPlayingThisBook ? (
                <>
                  <Pause className="w-4 h-4 fill-current" />
                  <span>Pausar reproducción</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current translate-x-0.5" />
                  <span>
                    {currentBook?.id === book.id
                      ? 'Reanudar audiolibro'
                      : 'Comenzar a escuchar'}
                  </span>
                </>
              )}
              <span className="arr">&rarr;</span>
            </button>

            <button
              onClick={() => toggleFavorite(book)}
              className={`pill-btn ${isFav ? 'coral' : 'outline'} text-xs sm:text-sm py-2.5 px-5 cursor-pointer font-bold`}
            >
              <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
              <span>{isFav ? 'En tu colección' : 'Añadir a colección'}</span>
            </button>

            {currentBook?.id === book.id && (
              <button
                onClick={() => setIsExpanded(true)}
                className="pill-btn outline text-xs sm:text-sm py-2.5 px-4 text-[#FF9398] cursor-pointer font-bold"
              >
                <Volume2 className="w-4 h-4" />
                <span>Abrir reproductor</span>
              </button>
            )}
          </div>

          {/* External links */}
          <div className="flex flex-wrap items-center gap-4 pt-2 text-xs sm:text-sm text-stone-300 font-mono font-medium">
            {book.url_text_source && (
              <a
                href={book.url_text_source}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 hover:text-[#FF9398] transition-colors"
              >
                <BookOpen className="w-4 h-4" />
                <span>Texto en Gutenberg</span>
                <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
              </a>
            )}
            {book.url_librivox && (
              <a
                href={book.url_librivox}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 hover:text-[#FF9398] transition-colors"
              >
                <span>Ficha en LibriVox.org</span>
                <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Synopsis Section */}
      {book.description && (
        <div className="p-6 sm:p-8 bg-[#12100e] border border-stone-700 rounded-3xl space-y-3">
          <h2 className="text-xs sm:text-sm font-mono tracking-wider uppercase text-stone-200 font-bold">
            Sinopsis & Contexto Histórico
          </h2>
          <p
            className={`text-sm sm:text-base text-stone-200 leading-relaxed font-sans font-light whitespace-pre-line ${
              !showFullDesc && book.description.length > 400 ? 'line-clamp-4' : ''
            }`}
          >
            {book.description}
          </p>
          {book.description.length > 400 && (
            <button
              onClick={() => setShowFullDesc(!showFullDesc)}
              className="text-xs sm:text-sm font-mono text-[#FF9398] font-bold hover:underline cursor-pointer pt-1"
            >
              {showFullDesc ? 'Leer menos' : 'Leer descripción completa...'}
            </button>
          )}
        </div>
      )}

      {/* Chapter Index */}
      <div className="p-6 sm:p-8 bg-[#12100e] border border-stone-700 rounded-3xl space-y-4">
        <div className="flex items-center justify-between border-b border-stone-800 pb-4">
          <div className="flex items-center gap-2">
            <ListMusic className="w-5 h-5 text-[#FF9398]" />
            <h2 className="text-lg sm:text-xl font-serif font-medium text-stone-100">
              Índice de Capítulos ({sections.length || book.num_sections || 0})
            </h2>
          </div>
          <span className="text-xs sm:text-sm font-mono text-stone-300 font-medium">
            Streaming MP3 libre
          </span>
        </div>

        {sections.length > 0 ? (
          <div className="divide-y divide-stone-800 border border-stone-700 rounded-2xl overflow-hidden bg-[#0c0a09]">
            {sections.map((section, idx) => {
              const isCurrentSection =
                currentBook?.id === book.id && currentSectionIndex === idx;
              const isSectionPlaying = isCurrentSection && isPlaying;
              const readerName = section.readers?.[0]?.display_name;

              return (
                <div
                  key={section.id || idx}
                  onClick={() => handlePlaySection(idx)}
                  className={`flex items-center justify-between p-3.5 sm:p-4 hover:bg-stone-900 transition-colors cursor-pointer group ${
                    isCurrentSection ? 'bg-[#FF9398]/15' : ''
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0 pr-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlaySection(idx);
                      }}
                      aria-label={`Reproducir pista ${idx + 1}: ${section.title || ''}`}
                      className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-transform cursor-pointer ${
                        isCurrentSection
                          ? 'bg-[#FF9398] text-stone-950 scale-105'
                          : 'bg-stone-800 text-stone-200 group-hover:bg-[#FF9398] group-hover:text-stone-950'
                      }`}
                    >
                      {isSectionPlaying ? (
                        <Pause className="w-4 h-4 fill-current" />
                      ) : (
                        <Play className="w-4 h-4 fill-current translate-x-0.5" />
                      )}
                    </button>

                    <div className="min-w-0">
                      <h3
                        className={`text-sm sm:text-base truncate font-sans ${
                          isCurrentSection ? 'text-[#FF9398] font-semibold' : 'text-stone-100 font-medium'
                        }`}
                      >
                        {section.title || `Capítulo ${idx + 1}`}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-stone-400 font-mono mt-0.5">
                        <span className="font-semibold">Pista {idx + 1}</span>
                        {readerName && (
                          <>
                            <span aria-hidden="true">&middot;</span>
                            <span className="truncate text-stone-300">Voz: {readerName}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-xs sm:text-sm font-mono text-stone-300 tabular-nums shrink-0 font-medium">
                    {section.playtime ? formatDuration(section.playtime) : ''}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center bg-[#0c0a09] rounded-2xl border border-stone-800">
            <p className="text-xs sm:text-sm font-mono text-stone-300">
              Haz clic en &ldquo;Comenzar a escuchar&rdquo; para reproducir la primera pista.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
