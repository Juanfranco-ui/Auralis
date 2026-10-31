import React, { createContext, useContext, useState, useEffect } from 'react';

export type FontSize = 'small' | 'normal' | 'large';

interface AccessibilityContextType {
  fontSize: FontSize;
  highContrast: boolean;
  reducedMotion: boolean;
  setFontSize: (size: FontSize) => void;
  increaseFontSize: () => void;
  decreaseFontSize: () => void;
  resetFontSize: () => void;
  toggleHighContrast: () => void;
  toggleReducedMotion: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [fontSize, setFontSizeState] = useState<FontSize>(() => {
    try {
      const saved = localStorage.getItem('auralis_font_size');
      if (saved === 'small' || saved === 'normal' || saved === 'large') {
        return saved;
      }
      // Backward compatibility for previous stored keys
      if (saved === 'xlarge') return 'large';
      return 'normal'; // Default is 'normal' (formerly 'large', 18px)
    } catch {
      return 'normal';
    }
  });

  const [highContrast, setHighContrast] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('auralis_high_contrast');
      return saved === 'true';
    } catch {
      return false;
    }
  });

  const [reducedMotion, setReducedMotion] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('auralis_reduced_motion');
      if (saved !== null) return saved === 'true';
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch {
      return false;
    }
  });

  // Apply to DOM attributes whenever state changes
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-font-size', fontSize);
    try {
      localStorage.setItem('auralis_font_size', fontSize);
    } catch {
      // storage unavailable
    }
  }, [fontSize]);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-high-contrast', String(highContrast));
    if (highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
    try {
      localStorage.setItem('auralis_high_contrast', String(highContrast));
    } catch {
      // storage unavailable
    }
  }, [highContrast]);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-reduced-motion', String(reducedMotion));
    try {
      localStorage.setItem('auralis_reduced_motion', String(reducedMotion));
    } catch {
      // storage unavailable
    }
  }, [reducedMotion]);

  const setFontSize = (size: FontSize) => {
    setFontSizeState(size);
  };

  const increaseFontSize = () => {
    setFontSizeState((prev) => {
      if (prev === 'small') return 'normal';
      if (prev === 'normal') return 'large';
      return prev;
    });
  };

  const decreaseFontSize = () => {
    setFontSizeState((prev) => {
      if (prev === 'large') return 'normal';
      if (prev === 'normal') return 'small';
      return prev;
    });
  };

  const resetFontSize = () => {
    setFontSizeState('normal');
  };

  const toggleHighContrast = () => {
    setHighContrast((prev) => !prev);
  };

  const toggleReducedMotion = () => {
    setReducedMotion((prev) => !prev);
  };

  return (
    <AccessibilityContext.Provider
      value={{
        fontSize,
        highContrast,
        reducedMotion,
        setFontSize,
        increaseFontSize,
        decreaseFontSize,
        resetFontSize,
        toggleHighContrast,
        toggleReducedMotion,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = (): AccessibilityContextType => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};
