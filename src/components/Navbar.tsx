import React, { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import {
  Menu,
  X,
  Disc3,
  BookOpen,
  Search,
  Bookmark,
  FileText,
  Volume2,
  ExternalLink,
} from 'lucide-react';
import { useAudioPlayer } from '../context/AudioPlayerContext';
import { AuralisLogo } from './AuralisLogo';

interface NavbarProps {
  onOpenAbout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAbout }) => {
  const location = useLocation();
  const { currentBook, isPlaying, setIsExpanded } = useAudioPlayer();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Prevent background scroll when mobile drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const navLinks = [
    { to: '/', label: 'Catálogo', icon: BookOpen, desc: 'Clásicos y selecciones' },
    { to: '/buscar', label: 'Buscador', icon: Search, desc: 'LibriVox & Internet Archive' },
    { to: '/coleccion', label: 'Mi Colección', icon: Bookmark, desc: 'Historial y notas' },
    { to: '/manifiesto', label: 'Manifiesto', icon: FileText, desc: 'Filosofía de dominio público' },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#0c0a09]/95 backdrop-blur-md border-b border-stone-800/80 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-4">
          {/* Zone 1: Brand Insignia & Wordmark */}
          <Link
            to="/"
            className="hover:opacity-90 transition-opacity cursor-pointer whitespace-nowrap shrink-0 group flex items-center"
            aria-label="Ir a la página principal de Auralis"
          >
            <AuralisLogo size="md" withSubtitle={true} />
          </Link>

          {/* Zone 2: Desktop Navigation Links (Awwwards tracked style) */}
          <nav className="hidden md:flex items-center gap-8 lg:gap-10 text-xs tracking-[0.24em] uppercase font-medium">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  `whitespace-nowrap shrink-0 transition-all cursor-pointer relative py-2 ${
                    isActive
                      ? 'text-[#FF9398] font-semibold'
                      : 'text-stone-400 hover:text-stone-100'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span>{link.label}</span>
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-[#FF9398]" />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Zone 3: Desktop Action & Mobile Controls */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Desktop Now Playing / Explore pill */}
            <div className="hidden sm:flex items-center">
              {currentBook ? (
                <button
                  onClick={() => setIsExpanded(true)}
                  className="pill-btn outline flex items-center gap-2 cursor-pointer py-1.5 px-3.5 text-xs"
                >
                  <Disc3
                    className={`w-3.5 h-3.5 text-[#FF9398] ${
                      isPlaying ? 'animate-spin' : ''
                    }`}
                  />
                  <span className="truncate max-w-[120px] lg:max-w-[150px]">
                    {currentBook.title}
                  </span>
                  <span className="arr text-[#FF9398]">&rarr;</span>
                </button>
              ) : (
                <Link
                  to="/buscar"
                  className="pill-btn coral cursor-pointer shadow-sm text-xs py-1.5 px-4"
                >
                  <span>Explorar</span>
                  <span className="arr">&rarr;</span>
                </Link>
              )}
            </div>

            {/* Mobile Now Playing micro indicator if playing */}
            {currentBook && (
              <button
                onClick={() => setIsExpanded(true)}
                className="sm:hidden p-2 text-[#FF9398] bg-[#FF9398]/10 border border-[#FF9398]/30 rounded-xl"
                aria-label="Abrir reproductor actual"
              >
                <Disc3 className={`w-4 h-4 ${isPlaying ? 'animate-spin' : ''}`} />
              </button>
            )}

            {/* Mobile Hamburger Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-stone-300 hover:text-white bg-stone-900/80 hover:bg-stone-800 border border-stone-800 transition-colors cursor-pointer"
              aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú de navegación'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Slide-Over Navigation Menu */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 md:hidden bg-stone-950/80 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="fixed inset-y-0 right-0 w-full max-w-xs sm:max-w-sm bg-[#12100e] border-l border-stone-800 shadow-2xl flex flex-col p-6 animate-in slide-in-from-right duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-stone-800/80 pb-5">
              <AuralisLogo size="sm" withSubtitle={false} />
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-stone-400 hover:text-white rounded-xl bg-stone-900 border border-stone-800 transition-colors"
                aria-label="Cerrar menú"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 py-6 space-y-2 overflow-y-auto">
              <div className="text-[10px] font-mono tracking-[0.28em] text-[#FF9398] uppercase px-3 mb-2">
                NAVEGACIÓN
              </div>

              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive =
                  link.to === '/'
                    ? location.pathname === '/' || location.pathname === '/explorar'
                    : location.pathname.startsWith(link.to);

                return (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-start gap-3.5 p-3.5 rounded-2xl transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#FF9398]/15 border border-[#FF9398]/40 text-[#FF9398]'
                        : 'text-stone-300 hover:bg-stone-900 hover:text-white'
                    }`}
                  >
                    <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${isActive ? 'text-[#FF9398]' : 'text-stone-400'}`} />
                    <div className="min-w-0">
                      <div className="font-serif text-base font-normal tracking-wide">
                        {link.label}
                      </div>
                      <div className="text-[11px] text-stone-500 font-sans mt-0.5">
                        {link.desc}
                      </div>
                    </div>
                  </NavLink>
                );
              })}
            </nav>

            {/* Now Playing card inside mobile drawer */}
            {currentBook && (
              <div className="p-4 bg-[#0c0a09] border border-stone-800 rounded-2xl space-y-3 mb-4">
                <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-[#FF9398]">
                  <span>En Reproducción</span>
                  <Volume2 className="w-3.5 h-3.5" />
                </div>
                <div className="flex items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-serif text-stone-200 truncate">
                      {currentBook.title}
                    </h4>
                    <p className="text-xs text-stone-400 truncate">
                      {currentBook.authors?.[0]?.last_name || 'LibriVox'}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setIsExpanded(true);
                    }}
                    className="pill-btn coral text-xs py-1.5 px-3 cursor-pointer shrink-0"
                  >
                    <span>Abrir</span>
                  </button>
                </div>
              </div>
            )}

            {/* Drawer Footer Colophon */}
            <div className="pt-4 border-t border-stone-800/80 text-[11px] font-mono text-stone-500 flex items-center justify-between">
              <span>LibriVox &middot; Public Domain</span>
              <span className="text-[#FF9398]">&hearts; Auralis</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
