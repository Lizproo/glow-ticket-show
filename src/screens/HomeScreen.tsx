import { useState } from "react";
import { Bell } from "lucide-react";
import EventCard from "@/components/EventCard";
import ThemeToggle from "@/components/ThemeToggle";
import { events, categories, Event } from "@/lib/data";
import logo from "@/assets/logo.png";
import heroConcert from "@/assets/hero-concert.jpg";

interface HomeScreenProps {
  onEventSelect: (event: Event) => void;
}

const HomeScreen = ({ onEventSelect }: HomeScreenProps) => {
  const [activeCategory, setActiveCategory] = useState("all");

  const filteredEvents =
    activeCategory === "all"
      ? events
      : events.filter((e) => e.category === activeCategory);

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2 safe-top">
        <div className="flex items-center gap-2">
          <img src={logo} alt="GlowTicket" className="w-8 h-8" />
          <h1 className="text-xl font-bold text-foreground">
            Glow<span className="text-primary">Ticket</span>
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button className="p-2 rounded-full bg-muted text-muted-foreground relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
          </button>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="mx-4 mt-3 rounded-2xl overflow-hidden relative h-44">
        <img src={heroConcert} alt="Eventos destacados" className="w-full h-full object-cover" width={800} height={512} />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/70 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <p className="text-xs font-semibold text-glow-light-gold uppercase tracking-wider">Evento destacado</p>
          <h2 className="text-lg font-bold text-primary-foreground mt-0.5">Reggaeton Fest 2026</h2>
          <p className="text-xs text-glow-cream mt-0.5">15 Mayo · Estadio Nacional</p>
        </div>
      </div>

      {/* Categories */}
      <div className="mt-5 px-4">
        <h3 className="text-sm font-bold text-foreground mb-3">Categorías</h3>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                activeCategory === cat.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-accent"
              }`}
            >
              <span>{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Trending Events */}
      <div className="mt-5">
        <div className="flex items-center justify-between px-4 mb-3">
          <h3 className="text-sm font-bold text-foreground">🔥 Tendencia</h3>
          <button className="text-xs text-primary font-semibold">Ver todo</button>
        </div>
        <div className="flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-hide">
          {events.slice(0, 4).map((event) => (
            <EventCard key={event.id} event={event} onClick={onEventSelect} />
          ))}
        </div>
      </div>

      {/* Upcoming */}
      <div className="mt-5 px-4">
        <h3 className="text-sm font-bold text-foreground mb-3">📅 Próximos eventos</h3>
        <div className="flex flex-col gap-3">
          {filteredEvents.map((event) => (
            <EventCard key={event.id} event={event} onClick={onEventSelect} variant="horizontal" />
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;
