import { Search, SlidersHorizontal, X, Sparkles, TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";
import EventCard from "@/components/EventCard";
import { events, Event } from "@/lib/data";

interface SearchScreenProps {
  onEventSelect: (event: Event) => void;
}

const SearchScreen = ({ onEventSelect }: SearchScreenProps) => {
  const [query, setQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState<"all" | "low" | "mid" | "high">("all");
  const [focused, setFocused] = useState(false);

  const q = query.toLowerCase().trim();

  const suggestions = useMemo(() => {
    if (!q) return [];
    const pool = new Set<string>();
    for (const e of events) {
      if (e.title.toLowerCase().includes(q)) pool.add(e.title);
      if (e.city.toLowerCase().includes(q)) pool.add(e.city);
      if (e.venue.toLowerCase().includes(q)) pool.add(e.venue);
    }
    return Array.from(pool).slice(0, 5);
  }, [q]);

  const filtered = events.filter((e) => {
    const matchesQuery =
      !q ||
      e.title.toLowerCase().includes(q) ||
      e.city.toLowerCase().includes(q) ||
      e.venue.toLowerCase().includes(q);

    const matchesPrice =
      priceRange === "all" ||
      (priceRange === "low" && e.price <= 50) ||
      (priceRange === "mid" && e.price > 50 && e.price <= 100) ||
      (priceRange === "high" && e.price > 100);

    return matchesQuery && matchesPrice;
  });

  const popular = ["Conciertos", "Teatro", "Buenos Aires", "Festival"];

  return (
    <div className="pb-24">
      <div className="px-4 pt-4 pb-2 safe-top">
        <h1 className="text-xl font-bold text-foreground">Buscar</h1>
      </div>

      <div className="px-4 mt-2 relative">
        <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-muted focus-within:ring-2 focus-within:ring-ring transition-all">
          <Search className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 150)}
            placeholder="Buscar eventos, artistas, venues..."
            aria-label="Campo de búsqueda"
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          {query && (
            <button onClick={() => setQuery("")} aria-label="Limpiar búsqueda">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="p-1"
            aria-label="Mostrar filtros"
            aria-expanded={showFilters}
          >
            <SlidersHorizontal className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Autocomplete */}
        {focused && suggestions.length > 0 && (
          <div className="absolute left-4 right-4 mt-2 z-20 glass-card rounded-2xl overflow-hidden animate-fade-in shadow-lg">
            {suggestions.map((s) => (
              <button
                key={s}
                onMouseDown={() => setQuery(s)}
                className="flex items-center gap-2 w-full px-4 py-2.5 text-left text-sm text-foreground hover:bg-muted/60 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-secondary" />
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {showFilters && (
        <div className="px-4 mt-3 animate-slide-up">
          <div className="glass-card rounded-2xl p-4">
            <h3 className="text-xs font-bold text-foreground mb-2">Rango de precio</h3>
            <div className="flex gap-2 flex-wrap">
              {([
                { id: "all", label: "Todos" },
                { id: "low", label: "< $50" },
                { id: "mid", label: "$50-$100" },
                { id: "high", label: "> $100" },
              ] as const).map((option) => (
                <button
                  key={option.id}
                  onClick={() => setPriceRange(option.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    priceRange === option.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {!query && (
        <div className="px-4 mt-4">
          <h3 className="text-xs font-bold text-foreground mb-2 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-primary" />
            Búsquedas populares
          </h3>
          <div className="flex flex-wrap gap-2">
            {popular.map((term) => (
              <button
                key={term}
                onClick={() => setQuery(term)}
                className="px-3 py-1.5 rounded-full bg-muted text-xs font-medium text-muted-foreground hover:bg-accent transition-colors hover-scale"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="px-4 mt-4">
        <p className="text-xs text-muted-foreground mb-3">
          {filtered.length} resultado{filtered.length !== 1 ? "s" : ""}
        </p>
        <div className="flex flex-col gap-3">
          {filtered.map((event) => (
            <EventCard key={event.id} event={event} onClick={onEventSelect} variant="horizontal" />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchScreen;
