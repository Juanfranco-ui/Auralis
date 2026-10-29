import React from 'react';
import { Link } from 'react-router-dom';
import { Globe, ShieldCheck, BookOpen, ExternalLink, Sparkles, Heart } from 'lucide-react';
import { SeoHead } from '../components/SeoHead';
import { AuralisInsignia } from '../components/AuralisLogo';

export const ManifestoPage: React.FC = () => {
  const manifestoSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Manifiesto de Dominio Público · Auralis',
    description:
      'La literatura universal pertenece a la humanidad. Preservación sonora, software libre y acceso abierto a los audiolibros de LibriVox e Internet Archive.',
    author: {
      '@type': 'Organization',
      name: 'Auralis Audio',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Auralis Audio',
    },
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
      <SeoHead
        title="Manifiesto de Dominio Público · Auralis Audiolibros"
        description="La literatura universal pertenece a la humanidad. Conoce la filosofía editorial de Auralis, basada en LibriVox, Project Gutenberg e Internet Archive."
        canonicalPath="/manifiesto"
        ogType="article"
        schemaJson={manifestoSchema}
      />

      {/* Hero Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center mb-2">
          <AuralisInsignia size={52} />
        </div>
        <div className="text-[11px] font-mono tracking-[0.3em] text-[#FF9398] uppercase">
          MANIFIESTO EDITORIAL &middot; FILOSOFÍA ABIERTA
        </div>
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-serif font-light text-stone-100 tracking-tight leading-[1.1]">
          La palabra escrita convertida en <span className="italic text-[#FF9398]">voz imperecedera</span>.
        </h1>
        <p className="text-base sm:text-lg text-stone-300 font-sans font-light max-w-2xl mx-auto leading-relaxed">
          Un proyecto dedicado a rescatar los clásicos de la literatura universal de las limitaciones comerciales, devolviéndolos a su estado natural: el patrimonio común de la humanidad.
        </p>
      </div>

      {/* Main Narrative Card */}
      <div className="p-6 sm:p-10 bg-[#12100e] border border-stone-800 rounded-3xl space-y-8 text-stone-300 font-sans font-light text-base sm:text-lg leading-relaxed shadow-xl">
        <p>
          En una era donde los muros de pago, la publicidad invasiva y los algoritmos de recomendación encierran la cultura detrás de suscripciones mensuales, <strong className="text-white font-medium">Auralis</strong> nace como un tributo a la libertad del conocimiento.
        </p>

        <blockquote className="p-6 border-l-2 border-[#FF9398] bg-[#0c0a09] rounded-r-2xl font-serif text-lg sm:text-xl text-stone-200 italic leading-relaxed">
          «Hacer que todos los libros del dominio público estén disponibles, gratis, en formato de audio en Internet.»
          <span className="block not-italic font-mono text-xs text-[#FF9398] mt-3 uppercase tracking-widest">
            &mdash; Principio Fundacional de LibriVox (Hugh McGuire, 2005)
          </span>
        </blockquote>

        <p>
          Cada narración en esta plataforma ha sido grabada por voluntarios altruistas de todos los rincones del planeta que prestaron su tiempo y entusiasmo para dar vida sonora a las obras más influyentes de la historia: desde Cervantes, Bécquer y Kafka hasta Mary Shelley, Poe, Verne y Homero.
        </p>
      </div>

      {/* Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 sm:p-8 bg-[#12100e] border border-stone-800 rounded-3xl space-y-3">
          <div className="flex items-center gap-3 text-[#FF9398] font-mono text-sm uppercase tracking-wider font-semibold">
            <Globe className="w-5 h-5 shrink-0" />
            <span>Project Gutenberg</span>
          </div>
          <p className="text-sm text-stone-300 font-sans font-light leading-relaxed">
            La fuente original de los textos. Miles de voluntarios digitalizan y corrigen minuciosamente obras cuyo derecho de autor ha expirado para que puedan ser leídas y leídas en voz alta sin barreras legales.
          </p>
          <a
            href="https://www.gutenberg.org"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-stone-400 hover:text-[#FF9398] transition-colors pt-2"
          >
            <span>Explorar Gutenberg</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="p-6 sm:p-8 bg-[#12100e] border border-stone-800 rounded-3xl space-y-3">
          <div className="flex items-center gap-3 text-[#FF9398] font-mono text-sm uppercase tracking-wider font-semibold">
            <ShieldCheck className="w-5 h-5 shrink-0" />
            <span>Internet Archive</span>
          </div>
          <p className="text-sm text-stone-300 font-sans font-light leading-relaxed">
            La biblioteca digital sin fines de lucro más grande del mundo. Alberga los archivos máster de audio MP3 en servidores abiertos con redundancia global y sin coste para los oyentes.
          </p>
          <a
            href="https://archive.org/details/librivoxaudio"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-stone-400 hover:text-[#FF9398] transition-colors pt-2"
          >
            <span>Ver Archivo en Archive.org</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Architecture and Privacy Section */}
      <div className="p-6 sm:p-8 bg-[#0c0a09] border border-stone-800 rounded-3xl space-y-4">
        <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-[#FF9398] uppercase">
          <Sparkles className="w-4 h-4" />
          <span>Privacidad & Ausencia de Rastreo</span>
        </div>
        <h3 className="text-xl font-serif text-stone-100">
          Diseñado para el oyente, no para la vigilancia.
        </h3>
        <p className="text-sm text-stone-400 font-sans leading-relaxed">
          Auralis no requiere registro ni cuentas de usuario. No almacena tus hábitos de escucha en bases de datos comerciales. Tu historial, tus favoritos y tus marcadores permanecen únicamente en el almacenamiento local (<code className="text-[#FF9398] font-mono">localStorage</code>) de tu dispositivo.
        </p>

        <div className="pt-4 flex flex-wrap gap-4">
          <Link
            to="/buscar"
            className="pill-btn coral text-xs cursor-pointer"
          >
            <span>Comenzar a Escuchar</span>
            <span className="arr">&rarr;</span>
          </Link>
          <Link
            to="/"
            className="pill-btn outline text-xs cursor-pointer"
          >
            <span>Ver Catálogo Editorial</span>
            <span className="arr">&rarr;</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
