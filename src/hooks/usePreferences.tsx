import { useState, useEffect, useCallback } from "react";

const KEY_PREFS = "glowticket-preferences";
const KEY_HISTORY = "glowticket-history";
const KEY_ONBOARD = "glowticket-onboarded";
const EVENT = "preferences-changed";

export interface Profile {
  name: string;
  email: string;
  phone: string;
  avatar?: string;
}

export interface Preferences {
  categories: string[];
  city?: string;
  profile?: Profile;
}

export const defaultProfile: Profile = {
  name: "Usuario Demo",
  email: "usuario@glowticket.com",
  phone: "",
};

const read = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

export const usePreferences = () => {
  const [prefs, setPrefs] = useState<Preferences>(() =>
    read<Preferences>(KEY_PREFS, { categories: [] })
  );
  const [history, setHistory] = useState<string[]>(() => read<string[]>(KEY_HISTORY, []));

  useEffect(() => {
    const sync = () => {
      setPrefs(read<Preferences>(KEY_PREFS, { categories: [] }));
      setHistory(read<string[]>(KEY_HISTORY, []));
    };
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const savePrefs = useCallback((next: Preferences) => {
    localStorage.setItem(KEY_PREFS, JSON.stringify(next));
    window.dispatchEvent(new Event(EVENT));
  }, []);

  const trackView = useCallback((eventId: string) => {
    const current = read<string[]>(KEY_HISTORY, []);
    const next = [eventId, ...current.filter((x) => x !== eventId)].slice(0, 20);
    localStorage.setItem(KEY_HISTORY, JSON.stringify(next));
    window.dispatchEvent(new Event(EVENT));
  }, []);

  return { prefs, savePrefs, history, trackView };
};

export const isOnboarded = () => localStorage.getItem(KEY_ONBOARD) === "1";
export const setOnboarded = () => {
  localStorage.setItem(KEY_ONBOARD, "1");
  window.dispatchEvent(new Event(EVENT));
};
