import { ArrowLeft, Calendar, Clock, MapPin, Share2, Heart, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Event } from "@/lib/data";
import { useState } from "react";

interface EventDetailScreenProps {
  event: Event;
  onBack: () => void;
  onSelectSeats: (event: Event) => void;
}

const EventDetailScreen = ({ event, onBack, onSelectSeats }: EventDetailScreenProps) => {
  const [liked, setLiked] = useState(false);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("es-ES", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const availability = Math.round((event.availableSeats / event.totalSeats) * 100);

  return (
    <div className="pb-28">
      {/* Image Header */}
      <div className="relative h-64">
        <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        <div className="absolute top-4 left-4 right-4 flex justify-between safe-top">
          <button onClick={onBack} className="p-2 rounded-full bg-card/60 backdrop-blur-sm text-foreground">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex gap-2">
            <button className="p-2 rounded-full bg-card/60 backdrop-blur-sm text-foreground">
              <Share2 className="w-5 h-5" />
            </button>
            <button
              onClick={() => setLiked(!liked)}
              className={`p-2 rounded-full bg-card/60 backdrop-blur-sm ${liked ? "text-primary" : "text-foreground"}`}
            >
              <Heart className="w-5 h-5" fill={liked ? "currentColor" : "none"} />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 -mt-8 relative">
        <div className="glass-card rounded-2xl p-4">
          <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase">
            {event.category === "concerts" ? "Concierto" : event.category === "theater" ? "Teatro" : event.category === "comedy" ? "Comedia" : event.category === "festivals" ? "Festival" : "Deporte"}
          </span>
          <h1 className="text-xl font-bold text-foreground mt-2">{event.title}</h1>

          <div className="flex flex-col gap-3 mt-4">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4 text-primary" />
              <span>{formatDate(event.date)}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Clock className="w-4 h-4 text-primary" />
              <span>{event.time} hrs</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4 text-primary" />
              <span>{event.venue}, {event.city}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Users className="w-4 h-4 text-primary" />
              <span>{event.availableSeats.toLocaleString()} asientos disponibles</span>
            </div>
          </div>
        </div>

        {/* Availability Bar */}
        <div className="mt-4 glass-card rounded-2xl p-4">
          <div className="flex justify-between text-xs mb-2">
            <span className="text-muted-foreground">Disponibilidad</span>
            <span className="font-bold text-foreground">{availability}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full rounded-full gradient-primary transition-all duration-500"
              style={{ width: `${availability}%` }}
            />
          </div>
        </div>

        {/* Description */}
        <div className="mt-4 glass-card rounded-2xl p-4">
          <h3 className="font-bold text-sm text-foreground mb-2">Descripción</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{event.description}</p>
        </div>

        {/* Pricing */}
        <div className="mt-4 glass-card rounded-2xl p-4">
          <h3 className="font-bold text-sm text-foreground mb-3">Precios</h3>
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center p-3 rounded-xl bg-muted/50">
              <span className="text-sm text-foreground">General</span>
              <span className="font-bold text-secondary">${event.price} USD</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-xl bg-muted/50">
              <span className="text-sm text-foreground">VIP</span>
              <span className="font-bold text-secondary">${Math.round(event.price * 1.8)} USD</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-xl bg-muted/50">
              <span className="text-sm text-foreground">Platinum</span>
              <span className="font-bold text-secondary">${Math.round(event.price * 2.5)} USD</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="fixed bottom-16 left-0 right-0 p-4 bg-background/90 backdrop-blur-lg border-t border-border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Desde</p>
            <p className="text-xl font-bold text-secondary">${event.price} USD</p>
          </div>
          <Button variant="hero" size="lg" onClick={() => onSelectSeats(event)}>
            Seleccionar asientos
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EventDetailScreen;
