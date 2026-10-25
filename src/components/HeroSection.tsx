import React from 'react';
import { Search } from 'lucide-react';

interface HeroSectionProps {
  onSearchClick: () => void;
  onExploreGenre: (genre: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onSearchClick,
  onExploreGenre,
}) => {
  return (
    <section className="relative overflow-hidden border-b border-stone-800/80 bg-[#0c0a09]">
      {/* Background imagery with measured cinematic scrim */}
      <div className="absolute inset-0 z-0">
        <img
          src="/src/assets/images/hero_audiobook_curation_1792886113377.jpg"
          alt="Biblioteca y audífonos clásicos"
          className="w-full h-full object-cover object-center opacity-20 filter grayscale contrast-125"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0c0a09] via-[#0c0a09]/85 to-[#0c0a09]/60" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        {/* Issue numbering lockup (Awwwards-mcp fallow-press signature) */}
        <div className="flex items-center gap-3 text-xs tracking-[0.28em] text-[#FF9398] uppercase font-mono mb-6">
          <span>AURALIS ARCHIVE</span>
          <i className="w-8 h-[1px] bg-[#FF9398]/50 not-italic" />
          <span>LIBRIVOX OPEN AUDIO</span>
          <i className="w-8 h-[1px] bg-[#FF9398]/50 not-italic" />
          <span>VOL. 2026</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
          {/* Main Headline (Fraunces editorial display) */}
          <div className="lg:col-span-8 space-y-6">
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif font-light text-stone-100 tracking-tight leading-[1.08] text-balance">
              Grandes historias de la <span className="italic font-normal text-[#FF9398]">literatura</span>, narradas en voz alta.
            </h1>

            <p className="text-base sm:text-lg text-stone-300 font-sans leading-relaxed max-w-2xl font-light">
              La literatura no pertenece a los muros de pago. Explora miles de audiolibros grabados por voluntarios de <strong className="text-stone-100 font-medium">LibriVox</strong> y preservados eternamente en los servidores libres de <strong className="text-stone-100 font-medium">Internet Archive</strong>.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <button
                onClick={onSearchClick}
                className="pill-btn coral cursor-pointer shadow-lg"
              >
                <span>Explorar Archivo</span>
                <span className="arr">&rarr;</span>
              </button>

              <button
                onClick={() => onExploreGenre('Spanish')}
                className="pill-btn outline cursor-pointer"
              >
                <span>Audiolibros en Español</span>
                <span className="arr">&rarr;</span>
              </button>
            </div>
          </div>

          {/* Right Column Editorial Caption / Feature Card */}
          <div className="lg:col-span-4 border-t lg:border-t-0 lg:border-l border-stone-800 pt-6 lg:pt-0 lg:pl-8 space-y-4">
            <div className="text-[11px] tracking-[0.24em] uppercase text-stone-400 font-mono">
              MANIFIESTO TÉCNICO
            </div>
            <p className="text-xs sm:text-sm text-stone-300 font-light leading-relaxed">
              Consumo directo de la API pública <span className="font-mono text-[#FF9398]">/api/feed/audiobooks</span>, streaming directo MP3 sin intermediarios y reproducción sin costo.
            </p>

            {/* Quick Filter Buttons */}
            <div className="pt-2 space-y-2">
              <div className="text-[10px] tracking-[0.2em] uppercase text-stone-400 font-mono">
                Rutas de lectura:
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                <button
                  onClick={() => onExploreGenre('Misterio')}
                  className="px-3 py-1.5 bg-stone-900 border border-stone-800 hover:border-[#FF9398]/50 text-stone-300 hover:text-white rounded-full transition-all cursor-pointer"
                >
                  Misterio & Terror
                </button>
                <button
                  onClick={() => onExploreGenre('Aventura')}
                  className="px-3 py-1.5 bg-stone-900 border border-stone-800 hover:border-[#FF9398]/50 text-stone-300 hover:text-white rounded-full transition-all cursor-pointer"
                >
                  Aventura Clásica
                </button>
                <button
                  onClick={() => onExploreGenre('Spanish')}
                  className="px-3 py-1.5 bg-stone-900 border border-stone-800 hover:border-[#FF9398]/50 text-stone-300 hover:text-white rounded-full transition-all cursor-pointer"
                >
                  Siglo de Oro & Poesía
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footnote Strip with Hairline Divider */}
        <div className="mt-16 pt-8 border-t border-stone-800/80 grid grid-cols-2 sm:grid-cols-4 gap-6 text-xs">
          <div>
            <div className="text-stone-400 font-mono tracking-wider text-[11px] uppercase">
              FONDO DOCUMENTAL
            </div>
            <div className="text-xl sm:text-2xl font-serif text-stone-100 mt-1">40.000+</div>
            <div className="text-stone-400 text-[11px] mt-0.5">Grabaciones libres</div>
          </div>
          <div>
            <div className="text-stone-400 font-mono tracking-wider text-[11px] uppercase">
              ACCESO
            </div>
            <div className="text-xl sm:text-2xl font-serif text-stone-100 mt-1">Libre & Abierto</div>
            <div className="text-stone-400 text-[11px] mt-0.5">Sin anuncios ni cookies</div>
          </div>
          <div>
            <div className="text-stone-400 font-mono tracking-wider text-[11px] uppercase">
              SERVIDOR DE ORIGEN
            </div>
            <div className="text-xl sm:text-2xl font-serif text-[#FF9398] mt-1">Archive.org</div>
            <div className="text-stone-400 text-[11px] mt-0.5">Streaming directo MP3</div>
          </div>
          <div>
            <div className="text-stone-400 font-mono tracking-wider text-[11px] uppercase">
              EDITORIAL
            </div>
            <div className="text-xl sm:text-2xl font-serif text-stone-100 mt-1">Project Gutenberg</div>
            <div className="text-stone-400 text-[11px] mt-0.5">Textos originales</div>
          </div>
        </div>
      </div>
    </section>
  );
};
