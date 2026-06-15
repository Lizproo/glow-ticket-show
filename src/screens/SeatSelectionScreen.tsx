import { ArrowLeft, Minus, Plus, ZoomIn, ZoomOut, Maximize, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Event } from "@/lib/data";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { getVenueLayout, VenueType } from "@/lib/venue";
import { useSoldSeats } from "@/hooks/useTickets";
import { toast } from "@/hooks/use-toast";

interface SeatSelectionScreenProps {
  event: Event;
  onBack: () => void;
  onCheckout: (event: Event, section: string, quantity: number, total: number, seats: string[]) => void;
}

type SeatState = "available" | "selected" | "reserved" | "sold";

const stageShape: Record<VenueType, string> = {
  theater: "rounded-t-[100%]",
  stadium: "rounded-full",
  coliseum: "rounded-full",
  arena: "rounded-t-[100%]",
};

const SeatSelectionScreen = ({ event, onBack, onCheckout }: SeatSelectionScreenProps) => {
  const layout = useMemo(() => getVenueLayout(event.venue, event.category), [event]);
  const [selectedSectionId, setSelectedSectionId] = useState(layout.sections[0].id);
  const section = layout.sections.find((s) => s.id === selectedSectionId) ?? layout.sections[0];
  const [quantity, setQuantity] = useState(1);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);

  const { sold: dbSold, ready } = useSoldSeats(event.id, section.label);

  useEffect(() => setSelectedSeats([]), [selectedSectionId]);

  const unitPrice = Math.round(event.price * section.multiplier);
  const total = unitPrice * quantity;

  // Asientos reservados (simulados/temporales) + vendidos reales
  const reservedMap = useMemo(() => {
    const reserved = new Set<string>();
    const seed = selectedSectionId.length;
    section.rows.forEach((row, ri) => {
      for (let i = 1; i <= section.seatsPerRow; i++) {
        const id = `${row}-${i}`;
        const hash = (ri * 31 + i * 17 + seed * 13) % 100;
        if (hash >= 80 && hash < 88) reserved.add(id);
      }
    });
    return reserved;
  }, [selectedSectionId, section]);

  const getState = (id: string): SeatState => {
    if (selectedSeats.includes(id)) return "selected";
    if (dbSold.has(id)) return "sold";
    if (reservedMap.has(id)) return "reserved";
    return "available";
  };

  const toggleSeat = (id: string) => {
    const state = getState(id);
    if (state === "sold") {
      toast({ title: "Asiento vendido", description: "Elige otro asiento disponible.", variant: "destructive" });
      return;
    }
    if (state === "reserved") {
      toast({ title: "Asiento reservado", description: "Está temporalmente bloqueado." });
      return;
    }
    if (state === "selected") {
      setSelectedSeats(selectedSeats.filter((s) => s !== id));
    } else if (selectedSeats.length < quantity) {
      setSelectedSeats([...selectedSeats, id]);
    } else {
      toast({ title: `Máximo ${quantity}`, description: "Aumenta la cantidad para añadir más asientos." });
    }
  };

  const seatClasses: Record<SeatState, string> = {
    available: "bg-muted text-muted-foreground hover:bg-accent",
    selected: "bg-primary text-primary-foreground scale-110 ring-2 ring-primary/40",
    reserved: "bg-secondary/40 text-secondary-foreground cursor-not-allowed",
    sold: "bg-foreground/30 text-background/40 cursor-not-allowed line-through",
  };

  const handleContinue = () => {
    if (selectedSeats.length !== quantity) {
      toast({ title: "Selección incompleta", description: `Selecciona ${quantity} asiento${quantity > 1 ? "s" : ""}.`, variant: "destructive" });
      return;
    }
    onCheckout(event, section.label, quantity, total, selectedSeats);
  };

  return (
    <div className="pb-28">
      <div className="flex items-center gap-3 px-4 pt-4 pb-3 safe-top">
        <button onClick={onBack} aria-label="Volver" className="p-2 rounded-full bg-muted text-foreground min-w-[40px] min-h-[40px] flex items-center justify-center">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="min-w-0">
          <h1 className="text-lg font-bold text-foreground truncate">{layout.label}</h1>
          <p className="text-xs text-muted-foreground truncate">{event.venue}</p>
        </div>
      </div>

      {/* Stage / field */}
      <div className="px-4 mt-2">
        <div className={cn("w-full h-8 gradient-primary flex items-center justify-center", stageShape[layout.type])}>
          <span className="text-[10px] font-bold text-primary-foreground uppercase tracking-widest">
            {layout.stageLabel}
          </span>
        </div>
      </div>

      {/* Seat Map */}
      <div className="px-4 mt-4">
        <div className="glass-card rounded-2xl p-3 relative">
          {!ready && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/40 rounded-2xl">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
            </div>
          )}
          <TransformWrapper initialScale={1} minScale={0.6} maxScale={3} doubleClick={{ mode: "toggle" }} wheel={{ step: 0.15 }}>
            {({ zoomIn, zoomOut, resetTransform }) => (
              <>
                <div className="absolute top-2 right-2 z-10 flex flex-col gap-1">
                  <button onClick={() => zoomIn()} aria-label="Acercar" className="w-8 h-8 rounded-lg bg-card border border-border flex items-center justify-center">
                    <ZoomIn className="w-4 h-4" />
                  </button>
                  <button onClick={() => zoomOut()} aria-label="Alejar" className="w-8 h-8 rounded-lg bg-card border border-border flex items-center justify-center">
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <button onClick={() => resetTransform()} aria-label="Reset" className="w-8 h-8 rounded-lg bg-card border border-border flex items-center justify-center">
                    <Maximize className="w-4 h-4" />
                  </button>
                </div>
                <TransformComponent wrapperClass="!w-full !h-[260px] rounded-xl bg-background/40" contentClass="!w-full">
                  <div className="flex flex-col items-center gap-1.5 py-4 px-2 mx-auto">
                    {section.rows.map((row, ri) => {
                      // Curvar filas para teatro/coliseo
                      const curve = layout.type === "theater" || layout.type === "coliseum"
                        ? { transform: `perspective(400px) rotateX(${Math.max(0, 8 - ri * 1.2)}deg)` }
                        : {};
                      return (
                        <div key={row} className="flex items-center gap-1.5" style={curve}>
                          <span className="text-[10px] text-muted-foreground w-5 text-center font-bold">{row}</span>
                          {Array.from({ length: section.seatsPerRow }, (_, i) => {
                            const id = `${row}-${i + 1}`;
                            const state = getState(id);
                            return (
                              <button
                                key={id}
                                disabled={state === "sold" || state === "reserved"}
                                onClick={() => toggleSeat(id)}
                                aria-label={`Asiento ${id} ${state}`}
                                className={cn("w-6 h-6 rounded-md text-[8px] font-bold transition-all", seatClasses[state])}
                              >
                                {i + 1}
                              </button>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                </TransformComponent>
              </>
            )}
          </TransformWrapper>

          <p className="text-[10px] text-center text-muted-foreground mt-2">
            Pellizca para hacer zoom · doble toque para encuadrar
          </p>

          <div className="flex items-center justify-center flex-wrap gap-3 mt-3 pt-3 border-t border-border">
            <LegendDot className="bg-muted" label="Disponible" />
            <LegendDot className="bg-primary" label="Seleccionado" />
            <LegendDot className="bg-secondary/40" label="Reservado" />
            <LegendDot className="bg-foreground/30" label="Vendido" />
          </div>
        </div>
      </div>

      {/* Section Selection */}
      <div className="px-4 mt-4">
        <h3 className="text-sm font-bold text-foreground mb-2">Sección</h3>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {layout.sections.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedSectionId(s.id)}
              className={cn(
                "flex-shrink-0 min-w-[110px] p-3 rounded-xl border-2 transition-all text-center",
                selectedSectionId === s.id ? "border-primary bg-primary/10" : "border-border bg-card"
              )}
            >
              <p className="text-xs font-bold text-foreground">{s.label}</p>
              <p className="text-sm font-bold text-secondary mt-1">
                ${Math.round(event.price * s.multiplier)}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Quantity */}
      <div className="px-4 mt-4">
        <h3 className="text-sm font-bold text-foreground mb-2">Cantidad</h3>
        <div className="flex items-center justify-center gap-6 glass-card rounded-2xl p-3">
          <button
            onClick={() => { setQuantity(Math.max(1, quantity - 1)); setSelectedSeats([]); }}
            aria-label="Disminuir"
            className="p-2 rounded-full bg-muted text-foreground min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <Minus className="w-5 h-5" />
          </button>
          <span className="text-2xl font-bold text-foreground w-8 text-center">{quantity}</span>
          <button
            onClick={() => { setQuantity(Math.min(10, quantity + 1)); setSelectedSeats([]); }}
            aria-label="Aumentar"
            className="p-2 rounded-full bg-primary text-primary-foreground min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
        <p className="text-[11px] text-center text-muted-foreground mt-2">
          {selectedSeats.length}/{quantity} asiento{quantity > 1 ? "s" : ""} seleccionado{selectedSeats.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="fixed left-0 right-0 px-4 max-w-md mx-auto z-30" style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 76px)" }}>
        <div className="bg-background/95 backdrop-blur-lg border border-border rounded-2xl p-3 shadow-xl flex items-center justify-between">
          <div>
            <p className="text-[11px] text-muted-foreground">{quantity} × ${unitPrice}</p>
            <p className="text-xl font-bold text-secondary">${total} USD</p>
          </div>
          <Button variant="hero" size="lg" onClick={handleContinue} disabled={selectedSeats.length < quantity}>
            Continuar
          </Button>
        </div>
      </div>
    </div>
  );
};

const LegendDot = ({ className, label }: { className: string; label: string }) => (
  <div className="flex items-center gap-1.5">
    <div className={cn("w-3 h-3 rounded-sm", className)} />
    <span className="text-[10px] text-muted-foreground">{label}</span>
  </div>
);

export default SeatSelectionScreen;
