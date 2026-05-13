import { useMemo, useState } from "react";
import { Bell, Sparkles, MapPin, LocateFixed } from "lucide-react";
import EventCard from "@/components/EventCard";
import ThemeToggle from "@/components/ThemeToggle";
import { events, categories, Event } from "@/lib/data";
import { usePreferences } from "@/hooks/usePreferences";
import { useGeolocation } from "@/hooks/useGeolocation";
import logo from "@/assets/logo.png";
import heroConcert from "@/assets/hero-concert.jpg";

interface HomeScreenProps {
  onEventSelect: (event: Event) => void;
}

const HomeScreen = ({ onEventSelect }: HomeScreenProps) => {
  const [activeCategory, setActiveCategory] = useState("all");
  const { prefs, history } = usePreferences();
  const { city, loading, granted, request } = useGeolocation();

  const filteredEvents =
    activeCategory === "all"
      ? events
      : events.filter((e) => e.category === activeCategory);

  // "Para ti": prioritize events whose category is in prefs or have been viewed
  const recommended = useMemo(() => {
    const prefSet = new Set(prefs.categories);
    const score = (e: Event) =>
      (prefSet.has(e.category) ? 2 : 0) + (history.includes(e.id) ? 1 : 0);
    const scored = events.map((e) => ({ e, s: score(e) }));
    const hasSignal = scored.some((x) => x.s > 0);
    if (!hasSignal) return events.slice(0, 3);
    return scored
      .sort((a, b) => b.s - a.s)
      .slice(0, 4)
      .map((x) => x.e);
  }, [prefs.categories, history]);

  const nearby = useMemo(() => {
    if (!city) return [];
    return events.filter((e) => e.city === city);
  }, [city]);

  return (
    <div className="pb-24">
      {/* Header */}
      <header className="flex items-center justify-between px-4 pt-4 pb-2 safe-top">
        <div className="flex items-center gap-2">
          <img src={logo} alt="GlowTicket" className="w-8 h-8" />
          <h1 className="text-xl font-bold text-foreground">
            Glow<span className="text-primary">Ticket</span>
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            aria-label="Notificaciones"
            className="p-2 rounded-full bg-muted text-muted-foreground relative focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
          </button>
        </div>
      </header>

      {/* Hero Banner */}
      <div className="mx-4 mt-3 rounded-2xl overflow-hidden relative h-44 hover-scale transition-transform">
        <img src={heroConcert} alt="Reggaeton Fest 2026" className="w-full h-full object-cover" width={800} height={512} />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/70 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <p className="text-xs font-semibold text-glow-light-gold uppercase tracking-wider">Evento destacado</p>
          <h2 className="text-lg font-bold text-primary-foreground mt-0.5">Reggaeton Fest 2026</h2>
          <p className="text-xs text-glow-cream mt-0.5">15 Mayo · Estadio Nacional</p>
        </div>
      </div>

      {/* Para ti — IA recomendaciones */}
      <section className="mt-5">
        <div className="flex items-center justify-between px-4 mb-3">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-secondary" />
            Para ti
          </h3>
          <span className="text-[10px] font-semibold text-secondary uppercase tracking-wider">IA</span>
        </div>
        <div className="flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-hide">
          {recommended.map((event) => (
            <EventCard key={event.id} event={event} onClick={onEventSelect} />
          ))}
        </div>
      </section>

      {/* Cerca de ti */}
      <section className="mt-5 px-4">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5 mb-3">
          <MapPin className="w-4 h-4 text-primary" />
          Cerca de ti
        </h3>
        {!granted ? (
          <button
            onClick={request}
            disabled={loading}
            className="w-full glass-card rounded-2xl p-4 flex items-center gap-3 text-left hover-scale transition-all"
          >
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <LocateFixed className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">
                {loading ? "Detectando ubicación..." : "Activar ubicación"}
              </p>
              <p className="text-xs text-muted-foreground">
                Descubre eventos en tu ciudad
              </p>
            </div>
          </button>
        ) : nearby.length === 0 ? (
          <p className="text-xs text-muted-foreground">No encontramos eventos en {city}. Mira otras ciudades 👇</p>
        ) : (
          <>
            <p className="text-xs text-muted-foreground mb-2">Detectado: {city}</p>
            <div className="flex flex-col gap-3">
              {nearby.map((event) => (
                <EventCard key={event.id} event={event} onClick={onEventSelect} variant="horizontal" />
              ))}
            </div>
          </>
        )}
      </section>

      {/* Categories */}
      <section className="mt-5 px-4">
        <h3 className="text-sm font-bold text-foreground mb-3">Categorías</h3>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              aria-pressed={activeCategory === cat.id}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                activeCategory === cat.id
                  ? "bg-primary text-primary-foreground scale-105"
                  : "bg-muted text-muted-foreground hover:bg-accent"
              }`}
            >
              <span>{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>
      </section>

      {/* Trending */}
      <section className="mt-5">
        <div className="flex items-center justify-between px-4 mb-3">
          <h3 className="text-sm font-bold text-foreground">🔥 Tendencia</h3>
          <button className="text-xs text-primary font-semibold">Ver todo</button>
        </div>
        <div className="flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-hide">
          {events.slice(0, 4).map((event) => (
            <EventCard key={event.id} event={event} onClick={onEventSelect} />
          ))}
        </div>
      </section>

      {/* Upcoming */}
      <section className="mt-5 px-4">
        <h3 className="text-sm font-bold text-foreground mb-3">📅 Próximos eventos</h3>
        <div className="flex flex-col gap-3">
          {filteredEvents.map((event) => (
            <EventCard key={event.id} event={event} onClick={onEventSelect} variant="horizontal" />
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomeScreen;
