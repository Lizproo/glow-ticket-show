import { Calendar, MapPin, Heart } from "lucide-react";
import { Event } from "@/lib/data";
import { cn } from "@/lib/utils";
import { useFavorites } from "@/hooks/useFavorites";

interface EventCardProps {
  event: Event;
  onClick: (event: Event) => void;
  variant?: "horizontal" | "vertical";
}

const categoryLabel = (c: string) =>
  ({
    concerts: "Concierto",
    theater: "Teatro",
    comedy: "Comedia",
    festivals: "Festival",
    opera: "Ópera",
    sports: "Deporte",
    conferences: "Conferencia",
    others: "Evento",
  } as Record<string, string>)[c] ?? "Evento";

const EventCard = ({ event, onClick, variant = "vertical" }: EventCardProps) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const liked = isFavorite(event.id);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
  };

  if (variant === "horizontal") {
    return (
      <button
        onClick={() => onClick(event)}
        className="flex gap-3 p-3 rounded-xl glass-card w-full text-left animate-fade-in hover:scale-[1.01] transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <img
          src={event.image}
          alt={event.title}
          className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
          loading="lazy"
          decoding="async"
        />
        <div className="flex flex-col justify-between flex-1 min-w-0">
          <div>
            <p className="text-[10px] font-semibold text-primary uppercase tracking-wide">
              {categoryLabel(event.category)}
            </p>
            <h3 className="font-bold text-sm text-foreground truncate">{event.title}</h3>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <Calendar className="w-3 h-3" />
            <span>{formatDate(event.date)}</span>
            <MapPin className="w-3 h-3 ml-1" />
            <span className="truncate">{event.city}</span>
          </div>
          <p className="text-sm font-bold text-secondary">${event.price} USD</p>
        </div>
      </button>
    );
  }

  // Vertical: compact card so the next one peeks
  return (
    <button
      onClick={() => onClick(event)}
      aria-label={`${event.title} en ${event.city}, ${formatDate(event.date)}`}
      className="relative rounded-xl overflow-hidden glass-card w-40 flex-shrink-0 animate-fade-in hover:scale-[1.02] transition-transform group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="relative h-24">
        <img
          src={event.image}
          alt={event.title}
          className="w-full h-full object-cover"
          loading="lazy"
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
        <button
          onClick={(e) => { e.stopPropagation(); toggleFavorite(event.id); }}
          aria-label={liked ? "Quitar de favoritos" : "Añadir a favoritos"}
          className={cn(
            "absolute top-1.5 right-1.5 p-1.5 rounded-full bg-card/70 backdrop-blur-sm transition-all min-w-[28px] min-h-[28px] flex items-center justify-center",
            liked && "text-primary"
          )}
        >
          <Heart className="w-3.5 h-3.5" fill={liked ? "currentColor" : "none"} />
        </button>
        <div className="absolute bottom-1.5 left-1.5">
          <span className="px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground text-[9px] font-bold uppercase">
            {formatDate(event.date)}
          </span>
        </div>
      </div>
      <div className="p-2.5 text-left">
        <h3 className="font-bold text-xs text-foreground line-clamp-1">{event.title}</h3>
        <div className="flex items-center gap-1 mt-0.5 text-[10px] text-muted-foreground">
          <MapPin className="w-2.5 h-2.5" />
          <span className="truncate">{event.city}</span>
        </div>
        <p className="text-xs font-bold text-secondary mt-1">Desde ${event.price}</p>
      </div>
    </button>
  );
};

export default EventCard;
