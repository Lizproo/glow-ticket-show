import { Heart } from "lucide-react";
import EventCard from "@/components/EventCard";
import { events, Event } from "@/lib/data";

interface FavoritesScreenProps {
  onEventSelect: (event: Event) => void;
}

const FavoritesScreen = ({ onEventSelect }: FavoritesScreenProps) => {
  // Simulated favorites
  const favorites = events.slice(0, 3);

  return (
    <div className="pb-24">
      <div className="px-4 pt-4 pb-2 safe-top">
        <h1 className="text-xl font-bold text-foreground">Favoritos</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Eventos que te interesan</p>
      </div>

      {favorites.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Heart className="w-12 h-12 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground mt-3">No tienes favoritos aún</p>
        </div>
      ) : (
        <div className="px-4 mt-4 flex flex-col gap-3">
          {favorites.map((event) => (
            <EventCard key={event.id} event={event} onClick={onEventSelect} variant="horizontal" />
          ))}
        </div>
      )}
    </div>
  );
};

export default FavoritesScreen;
