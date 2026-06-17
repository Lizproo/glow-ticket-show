import { useMemo, useState } from "react";
import {
  MapPin, Music, PartyPopper, Trophy, Drama, Mic2, Shapes, Laugh,
} from "lucide-react";
import EventCard from "@/components/EventCard";
import ThemeToggle from "@/components/ThemeToggle";
import PromoHero from "@/components/PromoHero";
import { events, Event } from "@/lib/data";
import { useGeolocation } from "@/hooks/useGeolocation";
import logo from "@/assets/logo.png";

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
  { id: "comedy", label: "Comedia", Icon: Laugh },
];

const HomeScreen = ({ onEventSelect }: HomeScreenProps) => {
  const [activeCategory, setActiveCategory] = useState("all");
  const { city, granted } = useGeolocation();

  const filteredEvents = useMemo(
    () => (activeCategory === "all" ? events : events.filter((e) => e.category === activeCategory)),
    [activeCategory]
  );

  const upcoming = filteredEvents.slice(0, 8);

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

      {/* Video promocional animado */}
      <PromoHero onClick={() => onEventSelect(events[0])} />

      {/* Categorías dinámicas */}
      <section className="mt-5" aria-label="Categorías">
        <div className="flex gap-2 overflow-x-auto px-4 pb-2 scrollbar-hide snap-x snap-mandatory">
          {navCategories.map((cat) => {
            const active = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                aria-pressed={active}
                className={`snap-start flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-300 flex-shrink-0 transform ${
                  active
                    ? "gradient-primary text-primary-foreground shadow-lg scale-105"
                    : "bg-muted text-muted-foreground hover:scale-105 hover:bg-accent"
                }`}
              >
                <cat.Icon className={`w-3.5 h-3.5 transition-transform ${active ? "scale-110" : ""}`} />
                {cat.label}
                {active && (
                  <span className="ml-0.5 text-[9px] font-bold bg-primary-foreground/20 px-1.5 py-0.5 rounded-full">
                    {upcoming.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* Próximos eventos */}
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
          {upcoming.map((event, i) => (
            <div key={event.id} style={{ animationDelay: `${i * 60}ms` }} className="animate-fade-in">
              <EventCard event={event} onClick={onEventSelect} variant="horizontal" />
            </div>
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
