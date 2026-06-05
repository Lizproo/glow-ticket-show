import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type Daltonism = "none" | "protanopia" | "deuteranopia" | "tritanopia";

interface A11yState {
  daltonism: Daltonism;
  highContrast: boolean;
  reducedMotion: boolean;
  largeText: boolean;
  setDaltonism: (d: Daltonism) => void;
  setHighContrast: (v: boolean) => void;
  setLargeText: (v: boolean) => void;
}

const KEY = "glowticket-a11y";
const Ctx = createContext<A11yState | undefined>(undefined);

interface Stored {
  daltonism: Daltonism;
  highContrast: boolean;
  largeText: boolean;
}

const read = (): Stored => {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { daltonism: "none", highContrast: false, largeText: false };
};

export const A11yProvider = ({ children }: { children: ReactNode }) => {
  const [s, setS] = useState<Stored>(() => read());
  const reducedMotion = typeof window !== "undefined"
    && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(s));
    const root = document.documentElement;
    root.dataset.daltonism = s.daltonism;
    root.classList.toggle("a11y-high-contrast", s.highContrast);
    root.classList.toggle("a11y-large-text", s.largeText);
  }, [s]);

  return (
    <Ctx.Provider
      value={{
        ...s,
        reducedMotion: !!reducedMotion,
        setDaltonism: (d) => setS((p) => ({ ...p, daltonism: d })),
        setHighContrast: (v) => setS((p) => ({ ...p, highContrast: v })),
        setLargeText: (v) => setS((p) => ({ ...p, largeText: v })),
      }}
    >
      {children}
      {/* SVG color matrix filters for color blindness simulation */}
      <svg aria-hidden="true" focusable="false" style={{ position: "absolute", width: 0, height: 0 }}>
        <defs>
          <filter id="cb-protanopia">
            <feColorMatrix type="matrix" values="0.567 0.433 0 0 0  0.558 0.442 0 0 0  0 0.242 0.758 0 0  0 0 0 1 0" />
          </filter>
          <filter id="cb-deuteranopia">
            <feColorMatrix type="matrix" values="0.625 0.375 0 0 0  0.7 0.3 0 0 0  0 0.3 0.7 0 0  0 0 0 1 0" />
          </filter>
          <filter id="cb-tritanopia">
            <feColorMatrix type="matrix" values="0.95 0.05 0 0 0  0 0.433 0.567 0 0  0 0.475 0.525 0 0  0 0 0 1 0" />
          </filter>
        </defs>
      </svg>
    </Ctx.Provider>
  );
};

export const useA11y = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("useA11y must be used within A11yProvider");
  return c;
};
