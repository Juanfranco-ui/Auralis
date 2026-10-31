import React, { useEffect } from 'react';
import { X, Type, Contrast, Sparkles, Check, RotateCcw } from 'lucide-react';
import { useAccessibility, FontSize } from '../context/AccessibilityContext';

interface AccessibilityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AccessibilityModal: React.FC<AccessibilityModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    fontSize,
    highContrast,
    reducedMotion,
    setFontSize,
    toggleHighContrast,
    toggleReducedMotion,
    resetFontSize,
  } = useAccessibility();

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

  const fontOptions: { id: FontSize; label: string; desc: string; sample: string }[] = [
    {
      id: 'small',
      label: 'Pequeño',
      desc: 'Tamaño estándar compacto (16px)',
      sample: 'Texto pequeño',
    },
    {
      id: 'normal',
      label: 'Normal',
      desc: 'Tamaño predeterminado optimizado para lectura cómoda (18px)',
      sample: 'Texto normal',
    },
    {
      id: 'large',
      label: 'Grande',
      desc: 'Escala ampliada para máxima legibilidad visual (20px)',
      sample: 'Texto grande',
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-950/90 backdrop-blur-md overflow-hidden animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl max-h-[90dvh] flex flex-col bg-[#12100e] border border-stone-700 rounded-3xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Ajustes de accesibilidad"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800 bg-[#0c0a09] shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#FF9398]/15 border border-[#FF9398]/30 rounded-xl text-[#FF9398]">
              <Type className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-serif font-medium text-stone-100">
                Accesibilidad y Legibilidad
              </h2>
              <p className="text-xs text-stone-400 font-sans">
                Ajusta el tamaño del texto y el contraste visual a tus preferencias
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-stone-300 hover:text-white rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-800 transition-colors cursor-pointer"
            aria-label="Cerrar ventana de accesibilidad"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-stone-200">
          {/* Section 1: Font Size */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-stone-100 flex items-center gap-2">
                <Type className="w-4 h-4 text-[#FF9398]" />
                <span>Tamaño de la tipografía</span>
              </label>
              {fontSize !== 'normal' && (
                <button
                  onClick={resetFontSize}
                  className="text-xs text-[#FF9398] hover:underline flex items-center gap-1 cursor-pointer font-mono"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Restablecer</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {fontOptions.map((opt) => {
                const isSelected = fontSize === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => setFontSize(opt.id)}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-[#FF9398]/15 border-[#FF9398] text-[#FF9398] shadow-md ring-1 ring-[#FF9398]'
                        : 'bg-[#0c0a09] border-stone-800 text-stone-300 hover:border-stone-700 hover:bg-stone-900'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="font-semibold text-sm">{opt.label}</span>
                      {isSelected && <Check className="w-4 h-4 text-[#FF9398]" />}
                    </div>
                    <span className="text-xs text-stone-400 font-sans leading-tight">
                      {opt.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: High Contrast Toggle */}
          <div className="p-4 bg-[#0c0a09] border border-stone-800 rounded-2xl space-y-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-stone-900 border border-stone-800 rounded-xl text-[#FF9398] mt-0.5">
                  <Contrast className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-stone-100">
                    Modo de Alto Contraste
                  </h3>
                  <p className="text-xs text-stone-400 mt-0.5 leading-relaxed">
                    Maximiza la nitidez con fondos negros absolutos, textos en blanco puro y bordes definidos para mejorar la visibilidad.
                  </p>
                </div>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={highContrast}
                onClick={toggleHighContrast}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#FF9398] ${
                  highContrast ? 'bg-[#FF9398]' : 'bg-stone-800'
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    highContrast ? 'translate-x-5 !bg-stone-950' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Section 3: Reduced Motion Toggle */}
          <div className="p-4 bg-[#0c0a09] border border-stone-800 rounded-2xl space-y-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-stone-900 border border-stone-800 rounded-xl text-[#FF9398] mt-0.5">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-stone-100">
                    Reducir Movimiento y Animaciones
                  </h3>
                  <p className="text-xs text-stone-400 mt-0.5 leading-relaxed">
                    Desactiva animaciones de giro de discos, pulsaciones y transiciones continuas para una experiencia más estática y relajada.
                  </p>
                </div>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={reducedMotion}
                onClick={toggleReducedMotion}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#FF9398] ${
                  reducedMotion ? 'bg-[#FF9398]' : 'bg-stone-800'
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    reducedMotion ? 'translate-x-5 !bg-stone-950' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-stone-800 bg-[#0c0a09] shrink-0">
          <span className="text-xs text-stone-400 font-mono">
            WCAG 2.1 AA / AAA Compliant
          </span>
          <button
            onClick={onClose}
            className="pill-btn coral text-xs py-2 px-5 cursor-pointer shadow-md"
          >
            <span>Listo</span>
          </button>
        </div>
      </div>
    </div>
  );
};
