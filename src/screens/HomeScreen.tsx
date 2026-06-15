import { useMemo, useState } from "react";
import {
  Sparkles, MapPin, LocateFixed, Music, PartyPopper, Trophy, Drama, Mic2, Shapes,
} from "lucide-react";
import EventCard from "@/components/EventCard";
import ThemeToggle from "@/components/ThemeToggle";
import { events, Event } from "@/lib/data";
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
  { id: "opera", label: "Ópera", Icon: Mic2 },
];

const HomeScreen = ({ onEventSelect }: HomeScreenProps) => {
  const [activeCategory, setActiveCategory] = useState("all");
  const { city, granted } = useGeolocation();

  const filteredEvents = useMemo(
    () => (activeCategory === "all" ? events : events.filter((e) => e.category === activeCategory)),
    [activeCategory]
  );

  const upcoming = filteredEvents.slice(0, 6);

  return (
    <div className="pb-28">
      {/* Header minimal */}
      <header className="flex items-center justify-between px-4 pt-4 pb-2 safe-top">
        <div className="flex items-center gap-2">
          <img src={logo} alt="GlowTicket" className="w-8 h-8" />
          <h1 className="text-lg font-bold text-foreground">
            Glow<span className="text-primary">Ticket</span>
          </h1>
        </div>
        <ThemeToggle />
      </header>

      {/* Hero */}
      <button
        onClick={() => onEventSelect(events[0])}
        className="block w-[calc(100%-2rem)] mx-4 mt-3 rounded-3xl overflow-hidden relative h-36 hover-scale text-left"
      >
        <img src={heroConcert} alt="Evento destacado" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/40 to-transparent" />
        <div className="absolute bottom-3 left-4 right-4">
          <p className="text-[10px] font-semibold text-glow-light-gold uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Destacado hoy
          </p>
          <h2 className="text-lg font-bold text-primary-foreground leading-tight">
            Bad Bunny — Most Wanted Tour
          </h2>
          <p className="text-[11px] text-glow-cream">15 May · Estadio Azteca</p>
        </div>
      </button>

      {/* Categorías compactas */}
      <section className="mt-5" aria-label="Categorías">
        <div className="flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-hide">
          {navCategories.map((cat) => {
            const active = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                aria-pressed={active}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0 ${
                  active
                    ? "gradient-primary text-primary-foreground shadow"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                <cat.Icon className="w-3.5 h-3.5" />
                {cat.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* Próximos eventos (única lista) */}
      <section className="mt-5">
        <div className="flex items-center justify-between px-4 mb-3">
          <h3 className="text-sm font-bold text-foreground">Próximos eventos</h3>
          {granted && city && (
            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
              <MapPin className="w-3 h-3 text-primary" /> {city}
            </span>
          )}
        </div>
        <div className="px-4 flex flex-col gap-3">
          {upcoming.map((event) => (
            <EventCard key={event.id} event={event} onClick={onEventSelect} variant="horizontal" />
          ))}
          {upcoming.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-6">
              No hay eventos en esta categoría.
            </p>
          )}
        </div>
      </section>
    </div>
  );
};

export default HomeScreen;
