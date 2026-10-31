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
          src="/src/assets/images/hero_audiobook_curation_1792886113377.jpg"
          alt="Biblioteca y audífonos clásicos"
          className="w-full h-full object-cover object-center opacity-20 filter grayscale contrast-125"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0c0a09] via-[#0c0a09]/90 to-[#0c0a09]/70" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
        {/* Issue numbering lockup */}
        <div className="flex items-center gap-3 text-xs sm:text-sm tracking-wider text-[#FF9398] uppercase font-mono font-bold mb-6">
          <span>AURALIS ARCHIVE</span>
          <i className="w-8 h-[2px] bg-[#FF9398]" not-italic="true" />
          <span>LIBRIVOX OPEN AUDIO</span>
          <i className="w-8 h-[2px] bg-[#FF9398]" not-italic="true" />
          <span>VOL. 2026</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
          {/* Main Headline */}
          <div className="lg:col-span-8 space-y-6">
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif font-light text-stone-100 tracking-tight leading-[1.08] text-balance">
              Grandes historias de la <span className="italic font-normal text-[#FF9398]">literatura</span>, narradas en voz alta.
            </h1>

            <p className="text-base sm:text-xl text-stone-200 font-sans leading-relaxed max-w-2xl font-light">
              La literatura no pertenece a los muros de pago. Explora miles de audiolibros grabados por voluntarios de <strong className="text-white font-medium">LibriVox</strong> y preservados eternamente en los servidores libres de <strong className="text-white font-medium">Internet Archive</strong>.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <button
                onClick={onSearchClick}
                className="pill-btn coral cursor-pointer shadow-lg text-sm py-3 px-6 font-bold"
              >
                <span>Explorar Archivo</span>
                <span className="arr">&rarr;</span>
              </button>

              <button
                onClick={() => onExploreGenre('Spanish')}
                className="pill-btn outline cursor-pointer text-sm py-3 px-6 font-bold"
              >
                <span>Audiolibros en Español</span>
                <span className="arr">&rarr;</span>
              </button>
            </div>
          </div>

          {/* Right Column Editorial Caption / Feature Card */}
          <div className="lg:col-span-4 border-t lg:border-t-0 lg:border-l border-stone-800 pt-6 lg:pt-0 lg:pl-8 space-y-4">
            <div className="text-xs sm:text-sm tracking-wider uppercase text-stone-200 font-mono font-bold">
              MANIFIESTO TÉCNICO
            </div>
            <p className="text-sm sm:text-base text-stone-200 font-light leading-relaxed">
              Consumo directo de la API pública <span className="font-mono text-[#FF9398] font-bold">/api/feed/audiobooks</span>, streaming directo MP3 sin intermediarios y reproducción sin costo.
            </p>

            {/* Quick Filter Buttons */}
            <div className="pt-2 space-y-2.5">
              <div className="text-xs tracking-wider uppercase text-stone-300 font-mono font-semibold">
                Rutas de lectura:
              </div>
              <div className="flex flex-wrap gap-2 text-xs sm:text-sm">
                <button
                  onClick={() => onExploreGenre('Misterio')}
                  className="px-4 py-2 bg-stone-900 border border-stone-700 hover:border-[#FF9398] text-stone-200 hover:text-white rounded-full transition-all cursor-pointer font-medium"
                >
                  Misterio & Terror
                </button>
                <button
                  onClick={() => onExploreGenre('Aventura')}
                  className="px-4 py-2 bg-stone-900 border border-stone-700 hover:border-[#FF9398] text-stone-200 hover:text-white rounded-full transition-all cursor-pointer font-medium"
                >
                  Aventura Clásica
                </button>
                <button
                  onClick={() => onExploreGenre('Spanish')}
                  className="px-4 py-2 bg-stone-900 border border-stone-700 hover:border-[#FF9398] text-stone-200 hover:text-white rounded-full transition-all cursor-pointer font-medium"
                >
                  Siglo de Oro & Poesía
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footnote Strip with Hairline Divider */}
        <div className="mt-14 pt-8 border-t border-stone-800 grid grid-cols-2 sm:grid-cols-4 gap-6 text-sm">
          <div>
            <div className="text-stone-300 font-mono tracking-wider text-xs uppercase font-bold">
              FONDO DOCUMENTAL
            </div>
            <div className="text-2xl sm:text-3xl font-serif text-stone-100 mt-1 font-light">40.000+</div>
            <div className="text-stone-400 text-xs sm:text-sm mt-0.5">Grabaciones libres</div>
          </div>
          <div>
            <div className="text-stone-300 font-mono tracking-wider text-xs uppercase font-bold">
              ACCESO
            </div>
            <div className="text-2xl sm:text-3xl font-serif text-stone-100 mt-1 font-light">Libre & Abierto</div>
            <div className="text-stone-400 text-xs sm:text-sm mt-0.5">Sin anuncios ni cookies</div>
          </div>
          <div>
            <div className="text-stone-300 font-mono tracking-wider text-xs uppercase font-bold">
              SERVIDOR DE ORIGEN
            </div>
            <div className="text-2xl sm:text-3xl font-serif text-[#FF9398] mt-1 font-light">Archive.org</div>
            <div className="text-stone-400 text-xs sm:text-sm mt-0.5">Streaming directo MP3</div>
          </div>
          <div>
            <div className="text-stone-300 font-mono tracking-wider text-xs uppercase font-bold">
              EDITORIAL
            </div>
            <div className="text-2xl sm:text-3xl font-serif text-stone-100 mt-1 font-light">Project Gutenberg</div>
            <div className="text-stone-400 text-xs sm:text-sm mt-0.5">Textos originales</div>
          </div>
        </div>
      </div>
    </section>
  );
};
