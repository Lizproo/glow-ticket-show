import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "glowticket-favorites";
const EVENT_NAME = "favorites-changed";

const readFavorites = (): string[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<string[]>(() => readFavorites());

  useEffect(() => {
    const sync = () => setFavorites(readFavorites());
    window.addEventListener(EVENT_NAME, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT_NAME, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    const current = readFavorites();
    const next = current.includes(id) ? current.filter((x) => x !== id) : [...current, id];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(EVENT_NAME));
  }, []);

  const isFavorite = useCallback((id: string) => favorites.includes(id), [favorites]);

  return { favorites, toggleFavorite, isFavorite };
};
