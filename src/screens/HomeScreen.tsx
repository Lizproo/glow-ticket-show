import { useMemo, useState } from "react";
import {
  Bell,
  Sparkles,
  MapPin,
  LocateFixed,
  Music,
  PartyPopper,
  Trophy,
  Drama,
  Mic2,
  Shapes,
  ChevronRight,
} from "lucide-react";
import EventCard from "@/components/EventCard";
import ThemeToggle from "@/components/ThemeToggle";
import { events, Event } from "@/lib/data";
import { usePreferences } from "@/hooks/usePreferences";
import { useGeolocation } from "@/hooks/useGeolocation";
import logo from "@/assets/logo.png";
import heroConcert from "@/assets/hero-concert.jpg";

interface HomeScreenProps {
  onEventSelect: (event: Event) => void;
}

const navCategories = [
  { id: "all", label: "Todos", Icon: Shapes },
  { id: "concerts", label: "Conciertos", Icon: Music },
  { id: "festivals", label: "Festivales", Icon: PartyPopper },
  { id: "sports", label: "Deportes", Icon: Trophy },
  { id: "theater", label: "Teatro", Icon: Drama },
  { id: "conferences", label: "Conferencias", Icon: Mic2 },
  { id: "opera", label: "Ópera", Icon: Music },
];

const MAX_PER_SECTION = 4;

const HomeScreen = ({ onEventSelect }: HomeScreenProps) => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [showAllUpcoming, setShowAllUpcoming] = useState(false);
  const [showAllRecommended, setShowAllRecommended] = useState(false);
  const { prefs, history } = usePreferences();
  const { city, loading, granted, request } = useGeolocation();

  const filteredEvents =
    activeCategory === "all"
      ? events
      : events.filter((e) => e.category === activeCategory);

  const recommended = useMemo(() => {
    const prefSet = new Set(prefs.categories);
    const score = (e: Event) =>
      (prefSet.has(e.category) ? 2 : 0) + (history.includes(e.id) ? 1 : 0);
    const scored = events.map((e) => ({ e, s: score(e) }));
    const hasSignal = scored.some((x) => x.s > 0);
    const base = hasSignal
      ? scored.sort((a, b) => b.s - a.s).map((x) => x.e)
      : events;
    return base;
  }, [prefs.categories, history]);

  const nearby = useMemo(() => {
    if (!city) return [];
    return events.filter((e) => e.city === city).slice(0, MAX_PER_SECTION);
  }, [city]);

  const upcomingList = showAllUpcoming ? filteredEvents : filteredEvents.slice(0, MAX_PER_SECTION);
  const recommendedList = showAllRecommended ? recommended : recommended.slice(0, MAX_PER_SECTION);

  return (
    <div className="pb-28">
      {/* Header */}
      <header className="flex items-center justify-between px-4 pt-4 pb-2 safe-top">
        <div className="flex items-center gap-2">
          <img src={logo} alt="GlowTicket" className="w-8 h-8" />
          <h1 className="text-lg font-bold text-foreground">
            Glow<span className="text-primary">Ticket</span>
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            aria-label="Notificaciones"
            className="p-2 rounded-full bg-muted text-muted-foreground relative focus-visible:ring-2 focus-visible:ring-ring min-w-[40px] min-h-[40px]"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
          </button>
        </div>
      </header>

      {/* 1. Hero compacto */}
      <button
        onClick={() => onEventSelect(events[0])}
        className="block w-[calc(100%-2rem)] mx-4 mt-3 rounded-2xl overflow-hidden relative h-28 hover-scale transition-transform text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <img
          src={heroConcert}
          alt="Evento destacado"
          className="w-full h-full object-cover"
          width={800}
          height={224}
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/75 via-foreground/40 to-transparent" />
        <div className="absolute bottom-3 left-3 right-3">
          <p className="text-[10px] font-semibold text-glow-light-gold uppercase tracking-wider">
            Evento destacado
          </p>
          <h2 className="text-base font-bold text-primary-foreground leading-tight">
            Bad Bunny — Most Wanted Tour
          </h2>
          <p className="text-[11px] text-glow-cream">15 May · Estadio Azteca</p>
        </div>
      </button>

      {/* 2. Categorías — barra horizontal táctil */}
      <section className="mt-5" aria-label="Categorías">
        <div className="flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-hide">
          {navCategories.map((cat) => {
            const active = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                aria-pressed={active}
                className="flex flex-col items-center gap-1.5 min-w-[64px] focus-visible:outline-none"
              >
                <span
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                    active
                      ? "gradient-primary text-primary-foreground shadow-lg scale-105"
                      : "bg-muted text-foreground"
                  }`}
                >
                  <cat.Icon className="w-5 h-5" strokeWidth={active ? 2.4 : 2} />
                </span>
                <span
                  className={`text-[10px] leading-none ${
                    active ? "font-bold text-primary" : "font-medium text-muted-foreground"
                  }`}
                >
                  {cat.label}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. Para ti */}
      <SectionHeader
        icon={<Sparkles className="w-4 h-4 text-secondary" />}
        title="Para ti"
        badge="IA"
        onMore={() => setShowAllRecommended((v) => !v)}
        moreLabel={showAllRecommended ? "Ver menos" : "Ver más"}
      />
      <div className="flex gap-3 overflow-x-auto px-4 pb-2 pr-8 scrollbar-hide snap-x snap-mandatory">
        {recommendedList.map((event) => (
          <div key={event.id} className="snap-start">
            <EventCard event={event} onClick={onEventSelect} />
          </div>
        ))}
      </div>

      {/* 4. Próximos eventos */}
      <SectionHeader
        title="Próximos eventos"
        onMore={() => setShowAllUpcoming((v) => !v)}
        moreLabel={showAllUpcoming ? "Ver menos" : "Ver más"}
      />
      <div className="px-4 flex flex-col gap-3">
        {upcomingList.map((event) => (
          <EventCard key={event.id} event={event} onClick={onEventSelect} variant="horizontal" />
        ))}
        {upcomingList.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-6">
            No hay eventos en esta categoría todavía.
          </p>
        )}
      </div>

      {/* 5. Cerca de ti */}
      <section className="mt-6 px-4">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5 mb-3">
          <MapPin className="w-4 h-4 text-primary" />
          Cerca de ti
        </h3>
        {!granted ? (
          <button
            onClick={request}
            disabled={loading}
            className="w-full glass-card rounded-2xl p-4 flex items-center gap-3 text-left hover-scale transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
          <p className="text-xs text-muted-foreground">
            No encontramos eventos en {city}.
          </p>
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
    </div>
  );
};

const SectionHeader = ({
  icon,
  title,
  badge,
  onMore,
  moreLabel,
}: {
  icon?: React.ReactNode;
  title: string;
  badge?: string;
  onMore?: () => void;
  moreLabel?: string;
}) => (
  <div className="flex items-center justify-between px-4 mt-6 mb-3">
    <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
      {icon}
      {title}
      {badge && (
        <span className="text-[9px] font-bold text-secondary uppercase tracking-wider ml-1">
          {badge}
        </span>
      )}
    </h3>
    {onMore && (
      <button
        onClick={onMore}
        className="text-xs text-primary font-semibold flex items-center gap-0.5 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded px-1"
      >
        {moreLabel}
        <ChevronRight className="w-3 h-3" />
      </button>
    )}
  </div>
);

export default HomeScreen;
