import React from 'react';
import { Disc3 } from 'lucide-react';
import { ActiveTab } from '../types/audiobook';
import { useAudioPlayer } from '../context/AudioPlayerContext';
import { AuralisLogo } from './AuralisLogo';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenAbout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenAbout,
}) => {
  const { currentBook, isPlaying, setIsExpanded } = useAudioPlayer();

  return (
    <header className="sticky top-0 z-40 bg-[#0c0a09]/90 backdrop-blur-md border-b border-stone-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-8">
        {/* Zone 1: Auralis Brand Insignia & Wordmark */}
        <button
          onClick={() => setActiveTab('explore')}
          className="text-left hover:opacity-90 transition-opacity cursor-pointer whitespace-nowrap shrink-0 group"
        >
          <AuralisLogo size="md" withSubtitle={true} />
        </button>

        {/* Zone 2: Navigation Links (Awwwards tracked style) */}
        <nav className="hidden md:flex items-center gap-10 text-xs tracking-[0.24em] uppercase font-medium">
          <button
            onClick={() => setActiveTab('explore')}
            className={`whitespace-nowrap shrink-0 transition-all cursor-pointer relative py-2 ${
              activeTab === 'explore'
                ? 'text-[#FF9398] font-semibold'
                : 'text-stone-400 hover:text-stone-100'
            }`}
          >
            <span>Catálogo</span>
            {activeTab === 'explore' && (
              <span className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-[#FF9398]" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('search')}
            className={`whitespace-nowrap shrink-0 transition-all cursor-pointer relative py-2 ${
              activeTab === 'search'
                ? 'text-[#FF9398] font-semibold'
                : 'text-stone-400 hover:text-stone-100'
            }`}
          >
            <span>Buscador</span>
            {activeTab === 'search' && (
              <span className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-[#FF9398]" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('library')}
            className={`whitespace-nowrap shrink-0 transition-all cursor-pointer relative py-2 ${
              activeTab === 'library'
                ? 'text-[#FF9398] font-semibold'
                : 'text-stone-400 hover:text-stone-100'
            }`}
          >
            <span>Mi Colección</span>
            {activeTab === 'library' && (
              <span className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-[#FF9398]" />
            )}
          </button>
          <button
            onClick={onOpenAbout}
            className="whitespace-nowrap shrink-0 text-stone-400 hover:text-stone-100 transition-colors cursor-pointer py-2"
          >
            <span>Manifiesto</span>
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action (pill-btn with arrow) */}
        <div className="flex items-center gap-3 shrink-0">
          {currentBook ? (
            <button
              onClick={() => setIsExpanded(true)}
              className="pill-btn outline flex items-center gap-2 cursor-pointer"
            >
              <Disc3 className={`w-3.5 h-3.5 text-[#FF9398] ${isPlaying ? 'animate-spin' : ''}`} />
              <span className="truncate max-w-[130px]">{currentBook.title}</span>
              <span className="arr text-[#FF9398]">&rarr;</span>
            </button>
          ) : (
            <button
              onClick={() => setActiveTab('explore')}
              className="pill-btn coral cursor-pointer shadow-sm"
            >
              <span>Explorar</span>
              <span className="arr">&rarr;</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile subnav row */}
      <div className="md:hidden flex items-center justify-around border-t border-stone-800/80 py-2.5 px-3 text-[11px] tracking-[0.2em] uppercase font-medium bg-[#0c0a09]">
        <button
          onClick={() => setActiveTab('explore')}
          className={`px-3 py-1.5 rounded-full transition-colors ${
            activeTab === 'explore' ? 'text-[#FF9398] bg-stone-900 font-semibold' : 'text-stone-400'
          }`}
        >
          Catálogo
        </button>
        <button
          onClick={() => setActiveTab('search')}
          className={`px-3 py-1.5 rounded-full transition-colors ${
            activeTab === 'search' ? 'text-[#FF9398] bg-stone-900 font-semibold' : 'text-stone-400'
          }`}
        >
          Buscar
        </button>
        <button
          onClick={() => setActiveTab('library')}
          className={`px-3 py-1.5 rounded-full transition-colors ${
            activeTab === 'library' ? 'text-[#FF9398] bg-stone-900 font-semibold' : 'text-stone-400'
          }`}
        >
          Colección
        </button>
        <button
          onClick={onOpenAbout}
          className="px-2 py-1.5 text-stone-400 hover:text-stone-200"
        >
          Info
        </button>
      </div>
    </header>
  );
};
