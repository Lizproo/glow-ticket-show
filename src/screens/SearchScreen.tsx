import { Search, SlidersHorizontal, X, Sparkles, TrendingUp, Calendar, MapPin, Tag } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import EventCard from "@/components/EventCard";
import { events, Event } from "@/lib/data";

interface SearchScreenProps {
  onEventSelect: (event: Event) => void;
}

const TYPES = [
  { id: "all", label: "Todos" },
  { id: "concerts", label: "Conciertos" },
  { id: "festivals", label: "Festivales" },
  { id: "sports", label: "Deportes" },
  { id: "theater", label: "Teatro" },
  { id: "opera", label: "Ópera" },
  { id: "comedy", label: "Comedia" },
];

const MONTHS = [
  "Enero","Febrero","Marzo","Abril","Mayo","Junio",
  "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre",
];

const SearchScreen = ({ onEventSelect }: SearchScreenProps) => {
  const [query, setQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [type, setType] = useState<string>("all");
  const [city, setCity] = useState<string>("all");
  const [month, setMonth] = useState<number | "all">("all");
  const [year, setYear] = useState<number | "all">("all");
  const [focused, setFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const cities = useMemo(
    () => Array.from(new Set(events.map((e) => e.city))).sort(),
    []
  );
  const years = useMemo(
    () => Array.from(new Set(events.map((e) => new Date(e.date).getFullYear()))).sort(),
    []
  );

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

  const filtered = useMemo(() => {
    return events.filter((e) => {
      const matchesQuery =
        !q ||
        e.title.toLowerCase().includes(q) ||
        e.city.toLowerCase().includes(q) ||
        e.venue.toLowerCase().includes(q);
      const matchesType = type === "all" || e.category === type;
      const matchesCity = city === "all" || e.city === city;
      const d = new Date(e.date);
      const matchesMonth = month === "all" || d.getMonth() === month;
      const matchesYear = year === "all" || d.getFullYear() === year;
      return matchesQuery && matchesType && matchesCity && matchesMonth && matchesYear;
    });
  }, [q, type, city, month, year]);

  // Scroll to top on mount, on query/filter change
  useEffect(() => {
    containerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [q, type, city, month, year]);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);

  const popular = ["Bad Bunny", "Coldplay", "Teatro", "Buenos Aires", "Festival"];
  const activeFilterCount =
    (type !== "all" ? 1 : 0) +
    (city !== "all" ? 1 : 0) +
    (month !== "all" ? 1 : 0) +
    (year !== "all" ? 1 : 0);

  const clearFilters = () => {
    setType("all"); setCity("all"); setMonth("all"); setYear("all");
  };

  return (
    <div ref={containerRef} className="pb-28">
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
            <button
              onClick={() => setQuery("")}
              aria-label="Limpiar búsqueda"
              className="min-w-[28px] min-h-[28px] flex items-center justify-center"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="p-1 relative min-w-[32px] min-h-[32px] flex items-center justify-center"
            aria-label="Mostrar filtros"
            aria-expanded={showFilters}
          >
            <SlidersHorizontal className="w-5 h-5 text-muted-foreground" />
            {activeFilterCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

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
          <div className="glass-card rounded-2xl p-4 space-y-4">
            <FilterRow icon={<Tag className="w-3.5 h-3.5" />} label="Tipo">
              <div className="flex gap-2 flex-wrap">
                {TYPES.map((t) => (
                  <Chip key={t.id} active={type === t.id} onClick={() => setType(t.id)}>
                    {t.label}
                  </Chip>
                ))}
              </div>
            </FilterRow>

            <FilterRow icon={<MapPin className="w-3.5 h-3.5" />} label="Ciudad">
              <div className="flex gap-2 flex-wrap">
                <Chip active={city === "all"} onClick={() => setCity("all")}>Todas</Chip>
                {cities.map((c) => (
                  <Chip key={c} active={city === c} onClick={() => setCity(c)}>{c}</Chip>
                ))}
              </div>
            </FilterRow>

            <FilterRow icon={<Calendar className="w-3.5 h-3.5" />} label="Fecha">
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={String(month)}
                  onChange={(e) => setMonth(e.target.value === "all" ? "all" : Number(e.target.value))}
                  className="bg-muted text-sm rounded-lg px-3 py-2 border border-border focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                  aria-label="Mes"
                >
                  <option value="all">Mes (todos)</option>
                  {MONTHS.map((m, i) => (
                    <option key={m} value={i}>{m}</option>
                  ))}
                </select>
                <select
                  value={String(year)}
                  onChange={(e) => setYear(e.target.value === "all" ? "all" : Number(e.target.value))}
                  className="bg-muted text-sm rounded-lg px-3 py-2 border border-border focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                  aria-label="Año"
                >
                  <option value="all">Año (todos)</option>
                  {years.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </FilterRow>

            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="w-full text-xs font-semibold text-primary py-2 rounded-lg hover:bg-primary/10 transition-colors"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        </div>
      )}

      {!query && activeFilterCount === 0 && (
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
          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Search className="w-10 h-10 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground mt-3">
                No encontramos eventos con esos filtros.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const FilterRow = ({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) => (
  <div>
    <p className="text-[11px] font-bold text-foreground mb-2 flex items-center gap-1.5 uppercase tracking-wide">
      {icon}
      {label}
    </p>
    {children}
  </div>
);

const Chip = ({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) => (
  <button
    onClick={onClick}
    aria-pressed={active}
    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all min-h-[32px] ${
      active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"
    }`}
  >
    {children}
  </button>
);

export default SearchScreen;
