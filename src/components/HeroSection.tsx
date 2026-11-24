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
      {/* Background imagery with measured cinematic scrim */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/hero_audiobook_curation.jpg"
          alt="Biblioteca y audífonos clásicos"
          className="w-full h-full object-cover object-center opacity-20 filter grayscale contrast-125"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0c0a09] via-[#0c0a09]/90 to-[#0c0a09]/70" />
      </div>

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
          </div>
        </div>
      </div>
    </section>
  );
};
