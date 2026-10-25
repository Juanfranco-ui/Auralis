import { X, Globe, ShieldCheck, ExternalLink } from 'lucide-react';
import { AuralisInsignia } from './AuralisLogo';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-stone-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-[#12100e] border border-stone-800 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-stone-800 pb-4">
          <div className="flex items-center gap-3">
            <AuralisInsignia size={38} />
            <div>
              <h3 className="text-xl font-light text-stone-100 font-serif">
                <em>Auralis</em>
              </h3>
              <p className="text-[10px] font-mono tracking-widest text-[#FF9398] uppercase">
                Colección Abierta LibriVox & Internet Archive
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-100 rounded-lg hover:bg-stone-900 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-sm text-stone-300 leading-relaxed font-sans font-light">
          <p>
            Inspirada en la estética editorial de los sitios galardonados de <strong className="text-stone-100 font-medium">Awwwards</strong>, esta aplicación transforma el catálogo libre de <strong className="text-[#FF9398] font-medium">LibriVox.org</strong> en una experiencia de lectura acústica contemporánea, tipográfica y fluida.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 bg-[#0c0a09] rounded-2xl border border-stone-800 space-y-2">
              <div className="flex items-center gap-2 text-[#FF9398] font-mono text-xs uppercase tracking-wider font-semibold">
                <Globe className="w-4 h-4" />
                <span>Textos Originales</span>
              </div>
              <p className="text-xs text-stone-400 leading-relaxed">
                Obras literarias de dominio público transcritas y verificadas por <span className="text-stone-200">Project Gutenberg</span>.
              </p>
            </div>

            <div className="p-4 bg-[#0c0a09] rounded-2xl border border-stone-800 space-y-2">
              <div className="flex items-center gap-2 text-[#FF9398] font-mono text-xs uppercase tracking-wider font-semibold">
                <ShieldCheck className="w-4 h-4" />
                <span>Alojamiento Libre</span>
              </div>
              <p className="text-xs text-stone-400 leading-relaxed">
                Archivos MP3 originales alojados de forma perpetua en la infraestructura abierta de <span className="text-stone-200">Internet Archive (archive.org)</span>.
              </p>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <h4 className="font-mono text-[11px] tracking-widest uppercase text-stone-400">
              Pilares de la integración:
            </h4>
            <ul className="text-xs text-stone-400 space-y-1.5 list-disc list-inside font-mono">
              <li>Llamadas a la API nativa de LibriVox (<code className="text-[#FF9398]">/api/feed/audiobooks</code>).</li>
              <li>Resolución de capítulos en alta fidelidad y streaming de audio MP3 continuo.</li>
              <li>Scrubber interactivo, velocidad variable de 0.75x a 2x y temporizador de sueño.</li>
              <li>Memoria persistente local en localStorage sin rastreadores ni cuentas externas.</li>
            </ul>
          </div>
        </div>

        <div className="pt-4 border-t border-stone-800 flex items-center justify-between text-xs text-stone-400 font-mono">
          <div className="flex items-center gap-3">
            <a
              href="https://librivox.org"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#FF9398] transition-colors flex items-center gap-1"
            >
              <span>LibriVox.org</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <span>&middot;</span>
            <a
              href="https://archive.org/details/librivoxaudio"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#FF9398] transition-colors flex items-center gap-1"
            >
              <span>Internet Archive</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <button
            onClick={onClose}
            className="pill-btn coral text-[10px] py-1.5 px-4 cursor-pointer"
          >
            <span>Cerrar</span>
          </button>
        </div>
      </div>
    </div>
  );
};
