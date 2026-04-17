import { Calendar, MapPin, Heart } from "lucide-react";
import { Event } from "@/lib/data";
import { cn } from "@/lib/utils";
import { useFavorites } from "@/hooks/useFavorites";

interface EventCardProps {
  event: Event;
  onClick: (event: Event) => void;
  variant?: "horizontal" | "vertical";
}

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
        className="flex gap-3 p-3 rounded-xl glass-card w-full text-left animate-fade-in hover:scale-[1.01] transition-transform"
      >
        <img
          src={event.image}
          alt={event.title}
          className="w-24 h-24 rounded-lg object-cover flex-shrink-0"
          loading="lazy"
        />
        <div className="flex flex-col justify-between flex-1 min-w-0">
          <div>
            <p className="text-xs font-semibold text-primary uppercase tracking-wide">
              {event.category === "concerts" ? "Concierto" : event.category === "theater" ? "Teatro" : event.category === "comedy" ? "Comedia" : event.category === "festivals" ? "Festival" : "Deporte"}
            </p>
            <h3 className="font-bold text-sm text-foreground truncate">{event.title}</h3>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
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

  return (
    <button
      onClick={() => onClick(event)}
      className="relative rounded-2xl overflow-hidden glass-card w-56 flex-shrink-0 animate-fade-in hover:scale-[1.02] transition-transform group"
    >
      <div className="relative h-36">
        <img
          src={event.image}
          alt={event.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
        <button
          onClick={(e) => { e.stopPropagation(); toggleFavorite(event.id); }}
          className={cn(
            "absolute top-2 right-2 p-1.5 rounded-full bg-card/60 backdrop-blur-sm transition-all",
            liked && "text-primary"
          )}
        >
          <Heart className="w-4 h-4" fill={liked ? "currentColor" : "none"} />
        </button>
        <div className="absolute bottom-2 left-2">
          <span className="px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold uppercase">
            {formatDate(event.date)}
          </span>
        </div>
      </div>
      <div className="p-3 text-left">
        <h3 className="font-bold text-sm text-foreground truncate">{event.title}</h3>
        <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
          <MapPin className="w-3 h-3" />
          <span className="truncate">{event.venue}</span>
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-sm font-bold text-secondary">Desde ${event.price}</span>
        </div>
      </div>
    </button>
  );
};

export default EventCard;
