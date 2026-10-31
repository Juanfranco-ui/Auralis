import React, { useEffect } from 'react';
import { X, Globe, ShieldCheck, ExternalLink, Sparkles } from 'lucide-react';
import { AuralisInsignia } from './AuralisLogo';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-950/90 backdrop-blur-md overflow-hidden animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[90dvh] sm:max-h-[86dvh] flex flex-col bg-[#12100e] border border-stone-700 rounded-3xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Manifiesto y Acerca de Auralis"
      >
        {/* Sticky Header with prominent close button */}
        <div className="flex items-center justify-between px-6 py-4 sm:px-8 sm:py-5 border-b border-stone-800 bg-[#0c0a09] shrink-0">
          <div className="flex items-center gap-3">
            <AuralisInsignia size={38} />
            <div>
              <h3 className="text-xl sm:text-2xl font-light text-stone-100 font-serif leading-tight">
                <em>Auralis</em>
              </h3>
              <p className="text-xs font-mono tracking-wider text-[#FF9398] uppercase font-bold">
                Manifiesto de Dominio Público
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2.5 text-stone-200 hover:text-white rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-700 transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Scrollable Content Container */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 overscroll-contain text-sm sm:text-base text-stone-200 leading-relaxed font-sans font-light">
          <div className="p-4 sm:p-5 bg-[#0c0a09] border border-stone-700 rounded-2xl flex items-start gap-3.5">
            <Sparkles className="w-5 h-5 text-[#FF9398] shrink-0 mt-0.5" />
            <p className="text-xs sm:text-sm text-stone-200 leading-relaxed">
              Inspirada en el diseño editorial de <strong className="text-white font-medium">Awwwards</strong>, Auralis reimagina la preservación cultural transformando el catálogo libre de <strong className="text-[#FF9398] font-bold">LibriVox.org</strong> e <strong className="text-white font-medium">Internet Archive</strong> en una experiencia acústica fluida, tipográfica y de libre acceso para todo el mundo.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div className="p-4 sm:p-5 bg-[#0c0a09] rounded-2xl border border-stone-700 space-y-2">
              <div className="flex items-center gap-2 text-[#FF9398] font-mono text-xs sm:text-sm uppercase tracking-wider font-bold">
                <Globe className="w-4 h-4 shrink-0" />
                <span>Textos Originales</span>
              </div>
              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                Obras literarias de dominio público transcritas y preservadas por <span className="text-stone-100 font-medium">Project Gutenberg</span>.
              </p>
            </div>

            <div className="p-4 sm:p-5 bg-[#0c0a09] rounded-2xl border border-stone-700 space-y-2">
              <div className="flex items-center gap-2 text-[#FF9398] font-mono text-xs sm:text-sm uppercase tracking-wider font-bold">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>Alojamiento Libre</span>
              </div>
              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                Archivos de audio MP3 alojados de forma perpetua y sin restricciones en <span className="text-stone-100 font-medium">Internet Archive (archive.org)</span>.
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-1">
            <h4 className="font-mono text-xs sm:text-sm tracking-wider uppercase text-stone-200 font-bold">
              Pilares de la experiencia:
            </h4>
            <ul className="text-xs sm:text-sm text-stone-300 space-y-2.5 font-mono divide-y divide-stone-800">
              <li className="pt-2 flex items-start gap-2.5">
                <span className="text-[#FF9398] font-bold">&bull;</span>
                <span>Streaming directo de audio en alta resolución sin cuentas ni publicidad.</span>
              </li>
              <li className="pt-2 flex items-start gap-2.5">
                <span className="text-[#FF9398] font-bold">&bull;</span>
                <span>Resolución dinámica de capítulos con metadatos de locutores y tiempos exactos.</span>
              </li>
              <li className="pt-2 flex items-start gap-2.5">
                <span className="text-[#FF9398] font-bold">&bull;</span>
                <span>Control de velocidad variable (0.75x a 2x) y temporizador de apagado para la noche.</span>
              </li>
              <li className="pt-2 flex items-start gap-2.5">
                <span className="text-[#FF9398] font-bold">&bull;</span>
                <span>Persistencia local en el dispositivo del usuario sin almacenamiento externo de datos.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Sticky Footer always visible */}
        <div className="flex items-center justify-between px-6 py-4 sm:px-8 sm:py-4.5 border-t border-stone-800 bg-[#0c0a09] shrink-0 text-xs sm:text-sm text-stone-300 font-mono">
          <div className="flex items-center gap-3 text-xs sm:text-sm font-medium">
            <a
              href="https://librivox.org"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#FF9398] transition-colors flex items-center gap-1"
            >
              <span>LibriVox</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <span>&middot;</span>
            <a
              href="https://archive.org"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#FF9398] transition-colors flex items-center gap-1"
            >
              <span>Internet Archive</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <button
            onClick={onClose}
            className="pill-btn coral text-xs sm:text-sm py-2 px-6 cursor-pointer shadow-md font-bold"
          >
            <span>Cerrar</span>
          </button>
        </div>
      </div>
    </div>
  );
};
