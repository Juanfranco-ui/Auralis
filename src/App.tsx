import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import {
  AudioPlayerProvider,
  useAudioPlayer,
} from './context/AudioPlayerContext';
import { AccessibilityProvider } from './context/AccessibilityContext';
import { Navbar } from './components/Navbar';
import { PlayerBar } from './components/PlayerBar';
import { ExpandedPlayerModal } from './components/ExpandedPlayerModal';
import { BookDetailModal } from './components/BookDetailModal';
import { AboutModal } from './components/AboutModal';
import { AccessibilityModal } from './components/AccessibilityModal';
import { AuralisLogo } from './components/AuralisLogo';
import { Type } from 'lucide-react';

// Pages
import { CatalogPage } from './pages/CatalogPage';
import { SearchPage } from './pages/SearchPage';
import { CollectionPage } from './pages/CollectionPage';
import { ManifestoPage } from './pages/ManifestoPage';
import { BookPage } from './pages/BookPage';

const AppLayout: React.FC = () => {
  const { currentBook, selectedBookForDetail, closeBookDetail } = useAudioPlayer();
  const [aboutModalOpen, setAboutModalOpen] = useState(false);
  const [accessibilityModalOpen, setAccessibilityModalOpen] = useState(false);

  return (
    <div
      className={`min-h-screen flex flex-col relative bg-[#0c0a09] ${
        currentBook ? 'pb-24 sm:pb-30' : 'pb-14'
      }`}
    >
      {/* Skip to Main Content Link (WCAG 2.4.1 Bypass Blocks) */}
      <a href="#main-content" className="skip-link">
        Saltar al contenido principal
      </a>

      {/* Film grain overlay */}
      <div className="grain" aria-hidden="true" />

      {/* Top Navigation */}
      <Navbar onOpenAbout={() => setAboutModalOpen(true)} />

      {/* Main Multi-Page Routed Content */}
      <main id="main-content" tabIndex={-1} className="flex-1 relative z-10 focus:outline-none">
        <Routes>
          <Route path="/" element={<CatalogPage />} />
          <Route path="/explorar" element={<CatalogPage />} />
          <Route path="/buscar" element={<SearchPage />} />
          <Route path="/coleccion" element={<CollectionPage />} />
          <Route path="/manifiesto" element={<ManifestoPage />} />
          <Route path="/libro/:id" element={<BookPage />} />
          <Route path="/audiolibro/:id" element={<BookPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Footer Colophon */}
      <footer className="border-t border-stone-800 bg-[#0c0a09] py-14 px-4 text-center text-xs sm:text-sm text-stone-300 space-y-5 relative z-10">
        <div className="flex justify-center">
          <Link to="/" aria-label="Auralis página de inicio">
            <AuralisLogo size="md" withSubtitle={true} />
          </Link>
        </div>

        <nav aria-label="Navegación de pie de página" className="flex flex-wrap justify-center items-center gap-4 text-xs sm:text-sm font-mono text-stone-300 font-medium pt-1">
          <Link to="/" className="hover:text-[#FF9398] transition-colors">
            Catálogo
          </Link>
          <span aria-hidden="true">&middot;</span>
          <Link to="/buscar" className="hover:text-[#FF9398] transition-colors">
            Buscador
          </Link>
          <span aria-hidden="true">&middot;</span>
          <Link to="/coleccion" className="hover:text-[#FF9398] transition-colors">
            Mi Colección
          </Link>
          <span aria-hidden="true">&middot;</span>
          <Link to="/manifiesto" className="hover:text-[#FF9398] transition-colors">
            Manifiesto
          </Link>
          <span aria-hidden="true">&middot;</span>
          <button
            onClick={() => setAccessibilityModalOpen(true)}
            className="hover:text-[#FF9398] transition-colors inline-flex items-center gap-1 cursor-pointer"
          >
            <Type className="w-3.5 h-3.5 text-[#FF9398]" />
            <span>Opciones de Accesibilidad</span>
          </button>
        </nav>

        <p className="font-sans font-light max-w-lg mx-auto text-stone-300 text-xs sm:text-sm leading-relaxed">
          Audiolibros libres en streaming directo. Grabaciones abiertas de{' '}
          <a
            href="https://librivox.org"
            target="_blank"
            rel="noopener noreferrer"
            className="text-stone-100 font-medium hover:text-[#FF9398] underline transition-colors"
          >
            LibriVox.org
          </a>{' '}
          y preservación universal en{' '}
          <a
            href="https://archive.org"
            target="_blank"
            rel="noopener noreferrer"
            className="text-stone-100 font-medium hover:text-[#FF9398] underline transition-colors"
          >
            Internet Archive
          </a>
          .
        </p>
        <p className="text-xs font-mono tracking-wider uppercase text-stone-400 font-medium">
          Auralis Audio &middot; Dominio Público &middot; 2026
        </p>
      </footer>

      {/* Persistent Docked Audio Player */}
      <PlayerBar />

      {/* Full-Screen Immersive Audio Player */}
      <ExpandedPlayerModal />

      {/* Quick Chapter / Book Detail Modal */}
      <BookDetailModal
        book={selectedBookForDetail}
        onClose={closeBookDetail}
      />

      {/* About & Manifesto Quick Modal */}
      <AboutModal
        isOpen={aboutModalOpen}
        onClose={() => setAboutModalOpen(false)}
      />

      {/* Accessibility Settings Modal */}
      <AccessibilityModal
        isOpen={accessibilityModalOpen}
        onClose={() => setAccessibilityModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AccessibilityProvider>
        <AudioPlayerProvider>
          <AppLayout />
        </AudioPlayerProvider>
      </AccessibilityProvider>
    </BrowserRouter>
  );
}
