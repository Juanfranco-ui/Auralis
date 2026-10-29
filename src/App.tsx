import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import {
  AudioPlayerProvider,
  useAudioPlayer,
} from './context/AudioPlayerContext';
import { Navbar } from './components/Navbar';
import { PlayerBar } from './components/PlayerBar';
import { ExpandedPlayerModal } from './components/ExpandedPlayerModal';
import { BookDetailModal } from './components/BookDetailModal';
import { AboutModal } from './components/AboutModal';
import { AuralisLogo } from './components/AuralisLogo';

// Pages
import { CatalogPage } from './pages/CatalogPage';
import { SearchPage } from './pages/SearchPage';
import { CollectionPage } from './pages/CollectionPage';
import { ManifestoPage } from './pages/ManifestoPage';
import { BookPage } from './pages/BookPage';

const AppLayout: React.FC = () => {
  const { currentBook, selectedBookForDetail, closeBookDetail } = useAudioPlayer();
  const [aboutModalOpen, setAboutModalOpen] = useState(false);

  return (
    <div
      className={`min-h-screen flex flex-col relative bg-[#0c0a09] ${
        currentBook ? 'pb-24 sm:pb-28' : 'pb-12'
      }`}
    >
      {/* Film grain overlay (Awwwards signature analog texture) */}
      <div className="grain" aria-hidden="true" />

      {/* Top Navigation */}
      <Navbar onOpenAbout={() => setAboutModalOpen(true)} />

      {/* Main Multi-Page Routed Content */}
      <main className="flex-1 relative z-10">
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
      <footer className="border-t border-stone-800/80 bg-[#0c0a09] py-12 px-4 text-center text-xs text-stone-500 space-y-4 relative z-10">
        <div className="flex justify-center">
          <Link to="/" aria-label="Auralis">
            <AuralisLogo size="md" withSubtitle={true} />
          </Link>
        </div>

        <nav className="flex flex-wrap justify-center items-center gap-4 text-xs font-mono text-stone-400 pt-1">
          <Link to="/" className="hover:text-[#FF9398] transition-colors">
            Catálogo
          </Link>
          <span>&middot;</span>
          <Link to="/buscar" className="hover:text-[#FF9398] transition-colors">
            Buscador
          </Link>
          <span>&middot;</span>
          <Link to="/coleccion" className="hover:text-[#FF9398] transition-colors">
            Mi Colección
          </Link>
          <span>&middot;</span>
          <Link to="/manifiesto" className="hover:text-[#FF9398] transition-colors">
            Manifiesto
          </Link>
        </nav>

        <p className="font-sans font-light max-w-md mx-auto text-stone-400 text-xs">
          Audiolibros libres en streaming directo. Grabaciones abiertas de{' '}
          <a
            href="https://librivox.org"
            target="_blank"
            rel="noopener noreferrer"
            className="text-stone-300 hover:text-[#FF9398] transition-colors"
          >
            LibriVox.org
          </a>{' '}
          y preservación universal en{' '}
          <a
            href="https://archive.org"
            target="_blank"
            rel="noopener noreferrer"
            className="text-stone-300 hover:text-[#FF9398] transition-colors"
          >
            Internet Archive
          </a>
          .
        </p>
        <p className="text-[10px] font-mono tracking-widest uppercase text-stone-600">
          Auralis Audio &middot; Diseñado con estética editorial de Awwwards &middot; 2026
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
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AudioPlayerProvider>
        <AppLayout />
      </AudioPlayerProvider>
    </BrowserRouter>
  );
}
