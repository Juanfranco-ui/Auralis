import React from 'react';

interface AuralisLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  withSubtitle?: boolean;
}

export const AuralisInsignia: React.FC<{ size?: number; className?: string }> = ({
  size = 32,
  className = '',
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      aria-label="Auralis Insignia"
    >
      {/* Outer rounded geometric frame */}
      <rect
        x="2"
        y="2"
        width="44"
        height="44"
        rx="12"
        fill="#12100E"
        stroke="#292524"
        strokeWidth="1.5"
      />

      {/* Auralis Concentric Acoustic Waves forming the stylized 'A' */}
      {/* Outer acoustic wave arch */}
      <path
        d="M12 34C15.2 24.5 19.4 15 24 10C28.6 15 32.8 24.5 36 34"
        stroke="#FF9398"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Middle acoustic resonance pulse */}
      <path
        d="M17 33C19.2 26.5 21.6 20 24 17C26.4 20 28.8 26.5 31 33"
        stroke="#F5F5F4"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeOpacity="0.9"
      />

      {/* Harmonic crossbar wave bridge */}
      <path
        d="M15 27.5C18 26 21 28 24 28C27 28 30 26 33 27.5"
        stroke="#FF9398"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Core acoustic orb / focal pulse */}
      <circle cx="24" cy="22" r="2.2" fill="#FF9398" />

      {/* Acoustic base wave dot echoes */}
      <circle cx="12" cy="35" r="1.5" fill="#FF9398" />
      <circle cx="24" cy="35" r="1.5" fill="#F5F5F4" fillOpacity="0.7" />
      <circle cx="36" cy="35" r="1.5" fill="#FF9398" />
    </svg>
  );
};

export const AuralisLogo: React.FC<AuralisLogoProps> = ({
  className = '',
  size = 'md',
  withSubtitle = true,
}) => {
  const isSm = size === 'sm';
  const isLg = size === 'lg';

  const insigniaSize = isSm ? 28 : isLg ? 40 : 34;

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <AuralisInsignia size={insigniaSize} />
      <div className="flex flex-col leading-none">
        <div className="flex items-baseline gap-2">
          <span
            className={`font-serif tracking-tight text-stone-100 ${
              isSm ? 'text-lg' : isLg ? 'text-2xl' : 'text-xl'
            }`}
          >
            <em className="font-light italic tracking-normal">Auralis</em>
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#FF9398] inline-block mb-0.5" />
        </div>
        {withSubtitle && (
          <span className="text-[9px] font-mono tracking-[0.26em] uppercase text-[#FF9398]/90 mt-1">
            LIBRIVOX OPEN AUDIO
          </span>
        )}
      </div>
    </div>
  );
};
