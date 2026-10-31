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
  Sliders,
  Type,
} from 'lucide-react';
import { useAudioPlayer } from '../context/AudioPlayerContext';
import { AuralisLogo } from './AuralisLogo';
import { AccessibilityModal } from './AccessibilityModal';

interface NavbarProps {
  onOpenAbout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAbout }) => {
  const location = useLocation();
  const { currentBook, isPlaying, setIsExpanded } = useAudioPlayer();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accessibilityModalOpen, setAccessibilityModalOpen] = useState(false);

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
      <header className="sticky top-0 z-40 bg-[#0c0a09]/95 backdrop-blur-md border-b border-stone-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 sm:h-20 flex items-center justify-between gap-4">
          {/* Zone 1: Brand Insignia & Wordmark */}
          <Link
            to="/"
            className="hover:opacity-90 transition-opacity cursor-pointer whitespace-nowrap shrink-0 group flex items-center focus-visible:ring-2 focus-visible:ring-[#FF9398] rounded-xl"
            aria-label="Página principal de Auralis Audiolibros"
          >
            <AuralisLogo size="md" withSubtitle={true} />
          </Link>

          {/* Zone 2: Desktop Navigation Links (Accessible typography) */}
          <nav
            aria-label="Navegación principal"
            className="hidden md:flex items-center gap-7 lg:gap-9 text-sm tracking-wide font-medium"
          >
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  `whitespace-nowrap shrink-0 transition-all cursor-pointer relative py-2.5 focus-visible:ring-2 focus-visible:ring-[#FF9398] rounded-lg ${
                    isActive
                      ? 'text-[#FF9398] font-bold'
                      : 'text-stone-300 hover:text-white'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span>{link.label}</span>
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#FF9398]" />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Zone 3: Actions & Accessibility Controls */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Accessibility Settings Button */}
            <button
              onClick={() => setAccessibilityModalOpen(true)}
              className="p-2 sm:px-3 sm:py-2 rounded-xl text-stone-200 hover:text-white bg-[#12100e] hover:bg-stone-800 border border-stone-700 transition-all flex items-center gap-1.5 cursor-pointer text-xs font-mono font-medium"
              title="Ajustes de accesibilidad (tamaño de texto y contraste)"
              aria-label="Abrir panel de opciones de accesibilidad"
            >
              <Type className="w-4 h-4 text-[#FF9398]" />
              <span className="hidden lg:inline">Accesibilidad</span>
            </button>

            {/* Desktop Now Playing / Explore button */}
            <div className="hidden sm:flex items-center">
              {currentBook ? (
                <button
                  onClick={() => setIsExpanded(true)}
                  className="pill-btn outline flex items-center gap-2 cursor-pointer py-2 px-4 text-xs font-semibold"
                  aria-label={`Reproduciendo actualmente: ${currentBook.title}. Abrir reproductor.`}
                >
                  <Disc3
                    className={`w-4 h-4 text-[#FF9398] ${
                      isPlaying ? 'animate-spin' : ''
                    }`}
                  />
                  <span className="truncate max-w-[120px] lg:max-w-[160px]">
                    {currentBook.title}
                  </span>
                  <span className="arr text-[#FF9398]">&rarr;</span>
                </button>
              ) : (
                <Link
                  to="/buscar"
                  className="pill-btn coral cursor-pointer shadow-sm text-xs py-2 px-4.5 font-bold"
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
                className="sm:hidden p-2.5 text-[#FF9398] bg-[#FF9398]/15 border border-[#FF9398]/40 rounded-xl cursor-pointer"
                aria-label={`Reproduciendo ${currentBook.title}. Abrir reproductor.`}
              >
                <Disc3 className={`w-5 h-5 ${isPlaying ? 'animate-spin' : ''}`} />
              </button>
            )}

            {/* Mobile Hamburger Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2.5 rounded-xl text-stone-200 hover:text-white bg-[#12100e] hover:bg-stone-800 border border-stone-700 transition-colors cursor-pointer"
              aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú de navegación'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Slide-Over Navigation Menu */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 md:hidden bg-stone-950/85 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="fixed inset-y-0 right-0 w-full max-w-xs sm:max-w-sm bg-[#12100e] border-l border-stone-700 shadow-2xl flex flex-col p-6 animate-in slide-in-from-right duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-stone-800 pb-5">
              <AuralisLogo size="sm" withSubtitle={false} />
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 text-stone-300 hover:text-white rounded-xl bg-stone-900 border border-stone-700 transition-colors"
                aria-label="Cerrar menú"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 py-5 space-y-2.5 overflow-y-auto">
              <div className="text-xs font-mono font-bold tracking-wider text-[#FF9398] uppercase px-3 mb-2">
                MENÚ DE NAVEGACIÓN
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
                        ? 'bg-[#FF9398]/20 border border-[#FF9398]/50 text-[#FF9398]'
                        : 'text-stone-200 hover:bg-stone-900 hover:text-white'
                    }`}
                  >
                    <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${isActive ? 'text-[#FF9398]' : 'text-stone-400'}`} />
                    <div className="min-w-0">
                      <div className="font-serif text-base font-medium tracking-wide">
                        {link.label}
                      </div>
                      <div className="text-xs text-stone-400 font-sans mt-0.5">
                        {link.desc}
                      </div>
                    </div>
                  </NavLink>
                );
              })}

              {/* Mobile Accessibility Button */}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setAccessibilityModalOpen(true);
                }}
                className="w-full flex items-center gap-3.5 p-3.5 rounded-2xl text-stone-200 hover:bg-stone-900 hover:text-white border border-stone-800 text-left transition-colors cursor-pointer mt-4"
              >
                <Type className="w-5 h-5 text-[#FF9398] shrink-0" />
                <div className="min-w-0">
                  <div className="font-serif text-base font-medium">Accesibilidad</div>
                  <div className="text-xs text-stone-400 font-sans mt-0.5">
                    Tamaño de letra y alto contraste
                  </div>
                </div>
              </button>
            </nav>

            {/* Now Playing card inside mobile drawer */}
            {currentBook && (
              <div className="p-4 bg-[#0c0a09] border border-stone-700 rounded-2xl space-y-3 mb-4">
                <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-[#FF9398] font-bold">
                  <span>En Reproducción</span>
                  <Volume2 className="w-4 h-4" />
                </div>
                <div className="flex items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-serif text-stone-100 font-medium truncate">
                      {currentBook.title}
                    </h4>
                    <p className="text-xs text-stone-300 truncate">
                      {currentBook.authors?.[0]?.last_name || 'LibriVox'}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setIsExpanded(true);
                    }}
                    className="pill-btn coral text-xs py-2 px-3.5 cursor-pointer shrink-0 font-bold"
                  >
                    <span>Abrir</span>
                  </button>
                </div>
              </div>
            )}

            {/* Drawer Footer Colophon */}
            <div className="pt-4 border-t border-stone-800 text-xs font-mono text-stone-300 flex items-center justify-between">
              <span>LibriVox &middot; Dominio Público</span>
              <span className="text-[#FF9398] font-bold">&hearts; Auralis</span>
            </div>
          </div>
        </div>
      )}

      {/* Accessibility Modal */}
      <AccessibilityModal
        isOpen={accessibilityModalOpen}
        onClose={() => setAccessibilityModalOpen(false)}
      />
    </>
  );
};
