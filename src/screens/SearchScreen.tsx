import { Search, SlidersHorizontal, X } from "lucide-react";
import { useState } from "react";
import EventCard from "@/components/EventCard";
import { events, Event } from "@/lib/data";

interface SearchScreenProps {
  onEventSelect: (event: Event) => void;
}

const SearchScreen = ({ onEventSelect }: SearchScreenProps) => {
  const [query, setQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState<"all" | "low" | "mid" | "high">("all");

  const filtered = events.filter((e) => {
    const matchesQuery =
      !query ||
      e.title.toLowerCase().includes(query.toLowerCase()) ||
      e.city.toLowerCase().includes(query.toLowerCase()) ||
      e.venue.toLowerCase().includes(query.toLowerCase());

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

      {/* Search Bar */}
      <div className="px-4 mt-2">
        <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-muted">
          <Search className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar eventos, artistas, venues..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          {query && (
            <button onClick={() => setQuery("")}>
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
          <button onClick={() => setShowFilters(!showFilters)} className="p-1">
            <SlidersHorizontal className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="px-4 mt-3 animate-slide-up">
          <div className="glass-card rounded-2xl p-4">
            <h3 className="text-xs font-bold text-foreground mb-2">Rango de precio</h3>
            <div className="flex gap-2">
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

      {/* Popular Searches */}
      {!query && (
        <div className="px-4 mt-4">
          <h3 className="text-xs font-bold text-foreground mb-2">Búsquedas populares</h3>
          <div className="flex flex-wrap gap-2">
            {popular.map((term) => (
              <button
                key={term}
                onClick={() => setQuery(term)}
                className="px-3 py-1.5 rounded-full bg-muted text-xs font-medium text-muted-foreground hover:bg-accent transition-colors"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
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
