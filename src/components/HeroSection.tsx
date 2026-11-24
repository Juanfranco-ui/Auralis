import React from 'react';

interface HeroSectionProps {
  onSearchClick: () => void;
  onExploreGenre: (genre: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onSearchClick,
  onExploreGenre,
}) => {
  return (
    <section className="relative overflow-hidden border-b border-stone-800 bg-[#0c0a09]">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="max-w-2xl space-y-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-light text-stone-100 tracking-tight leading-[1.1] text-balance">
            Grandes historias de la <span className="italic font-normal text-[#FF9398]">literatura</span>, narradas en voz alta.
          </h1>

          <p className="text-sm sm:text-base text-stone-200 font-sans leading-relaxed max-w-xl font-light">
            La literatura no pertenece a los muros de pago. Explora audiolibros grabados por voluntarios de <strong className="text-white font-medium">LibriVox</strong> y preservados en <strong className="text-white font-medium">Internet Archive</strong>.
          </p>

          <div className="pt-1 flex flex-wrap items-center gap-3">
            <button
              onClick={onSearchClick}
              className="pill-btn coral shadow-md text-xs py-2 px-4 font-bold"
            >
              <span>Explorar</span>
              <span className="arr">&rarr;</span>
            </button>
            <button
              onClick={() => onExploreGenre('mystery')}
              className="px-3.5 py-1.5 bg-[#12100e] border border-stone-700 hover:border-[#FF9398] text-stone-200 hover:text-white rounded-full transition-all text-xs font-mono font-medium"
            >
              Misterio
            </button>
            <button
              onClick={() => onExploreGenre('adventure')}
              className="px-3.5 py-1.5 bg-[#12100e] border border-stone-700 hover:border-[#FF9398] text-stone-200 hover:text-white rounded-full transition-all text-xs font-mono font-medium"
            >
              Aventura
            </button>
            <button
              onClick={() => onExploreGenre('poetry')}
              className="px-3.5 py-1.5 bg-[#12100e] border border-stone-700 hover:border-[#FF9398] text-stone-200 hover:text-white rounded-full transition-all text-xs font-mono font-medium"
            >
              Poesía
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
