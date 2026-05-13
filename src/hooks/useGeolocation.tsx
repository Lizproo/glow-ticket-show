import { useState, useCallback } from "react";

type GeoState = {
  loading: boolean;
  granted: boolean;
  error?: string;
  city?: string;
};

const cityFromCoords = (lat: number, lon: number): string => {
  // Mock mapping: pick from our event cities by nearest predefined coords
  const cities: { name: string; lat: number; lon: number }[] = [
    { name: "Ciudad de México", lat: 19.4326, lon: -99.1332 },
    { name: "Bogotá", lat: 4.711, lon: -74.0721 },
    { name: "Buenos Aires", lat: -34.6037, lon: -58.3816 },
    { name: "Lima", lat: -12.0464, lon: -77.0428 },
    { name: "Santiago", lat: -33.4489, lon: -70.6693 },
  ];
  let nearest = cities[0];
  let best = Infinity;
  for (const c of cities) {
    const d = Math.hypot(c.lat - lat, c.lon - lon);
    if (d < best) {
      best = d;
      nearest = c;
    }
  }
  return nearest.name;
};

export const useGeolocation = () => {
  const [state, setState] = useState<GeoState>({ loading: false, granted: false });

  const request = useCallback(() => {
    if (!("geolocation" in navigator)) {
      setState({ loading: false, granted: false, error: "Geolocalización no disponible" });
      return;
    }
    setState((s) => ({ ...s, loading: true }));
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const city = cityFromCoords(pos.coords.latitude, pos.coords.longitude);
        setState({ loading: false, granted: true, city });
      },
      (err) => {
        setState({ loading: false, granted: false, error: err.message });
      },
      { timeout: 7000 }
    );
  }, []);

  return { ...state, request };
};
