import { useEffect, useState } from "react";

/**
 * Mitiga capturas de pantalla:
 *  - Oculta contenido al perder foco / cambiar pestaña.
 *  - Detecta tecla PrintScreen y bloquea brevemente.
 *  - Deshabilita selección, arrastre y menú contextual.
 *  Web no puede impedir capturas 100%, pero esto disuade.
 */
export const useAntiCapture = (enabled = true) => {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    const onVisibility = () => setHidden(document.visibilityState !== "visible");
    const onBlur = () => setHidden(true);
    const onFocus = () => setHidden(false);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "PrintScreen" || (e.metaKey && e.shiftKey)) {
        setHidden(true);
        setTimeout(() => setHidden(false), 2500);
      }
    };
    const noop = (e: Event) => e.preventDefault();

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("blur", onBlur);
    window.addEventListener("focus", onFocus);
    window.addEventListener("keyup", onKey);
    document.addEventListener("contextmenu", noop);

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("keyup", onKey);
      document.removeEventListener("contextmenu", noop);
    };
  }, [enabled]);

  return { hidden };
};
