import { ArrowLeft, Minus, Plus, ZoomIn, ZoomOut, Maximize } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Event } from "@/lib/data";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

interface SeatSelectionScreenProps {
  event: Event;
  onBack: () => void;
  onCheckout: (event: Event, section: string, quantity: number, total: number) => void;
}

const sections = [
  { id: "general", label: "General", multiplier: 1 },
  { id: "vip", label: "VIP", multiplier: 1.8 },
  { id: "platinum", label: "Platinum", multiplier: 2.5 },
];

type SeatState = "available" | "selected" | "reserved" | "sold";

const SeatSelectionScreen = ({ event, onBack, onCheckout }: SeatSelectionScreenProps) => {
  const [selectedSection, setSelectedSection] = useState("general");
  const [quantity, setQuantity] = useState(1);

  const section = sections.find((s) => s.id === selectedSection)!;
  const unitPrice = Math.round(event.price * section.multiplier);
  const total = unitPrice * quantity;

  const rows = ["A", "B", "C", "D", "E", "F", "G", "H"];
  const seatsPerRow = 12;
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);

  // Deterministic but per-section seat states
  const occupiedMap = useMemo(() => {
    const sold = new Set<string>();
    const reserved = new Set<string>();
    const seed = selectedSection.length;
    rows.forEach((row, ri) => {
      for (let i = 1; i <= seatsPerRow; i++) {
        const id = `${row}-${i}`;
        const hash = (ri * 31 + i * 17 + seed * 13) % 100;
        if (hash < 22) sold.add(id);
        else if (hash < 30) reserved.add(id);
      }
    });
    return { sold, reserved };
  }, [selectedSection]);

  const getState = (id: string): SeatState => {
    if (selectedSeats.includes(id)) return "selected";
    if (occupiedMap.sold.has(id)) return "sold";
    if (occupiedMap.reserved.has(id)) return "reserved";
    return "available";
  };

  const toggleSeat = (id: string) => {
    const state = getState(id);
    if (state === "sold" || state === "reserved") return;
    if (state === "selected") {
      setSelectedSeats(selectedSeats.filter((s) => s !== id));
    } else if (selectedSeats.length < quantity) {
      setSelectedSeats([...selectedSeats, id]);
    }
  };

  const seatClasses: Record<SeatState, string> = {
    available: "bg-muted text-muted-foreground hover:bg-accent",
    selected: "bg-primary text-primary-foreground scale-110 ring-2 ring-primary/40",
    reserved: "bg-secondary/40 text-secondary-foreground cursor-not-allowed",
    sold: "bg-foreground/30 text-background/40 cursor-not-allowed",
  };

  return (
    <div className="pb-28">
      <div className="flex items-center gap-3 px-4 pt-4 pb-3 safe-top">
        <button
          onClick={onBack}
          aria-label="Volver"
          className="p-2 rounded-full bg-muted text-foreground min-w-[40px] min-h-[40px] flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="min-w-0">
          <h1 className="text-lg font-bold text-foreground">Seleccionar asientos</h1>
          <p className="text-xs text-muted-foreground truncate">{event.title}</p>
        </div>
      </div>

      {/* Stage */}
      <div className="px-4 mt-2">
        <div className="w-full h-7 gradient-primary rounded-t-[100%] flex items-center justify-center">
          <span className="text-[10px] font-bold text-primary-foreground uppercase tracking-widest">
            Escenario
          </span>
        </div>
      </div>

      {/* Seat Map with pinch-zoom */}
      <div className="px-4 mt-4">
        <div className="glass-card rounded-2xl p-3 relative">
          <TransformWrapper
            initialScale={1}
            minScale={0.6}
            maxScale={3}
            doubleClick={{ mode: "toggle" }}
            wheel={{ step: 0.15 }}
          >
            {({ zoomIn, zoomOut, resetTransform }) => (
              <>
                <div className="absolute top-2 right-2 z-10 flex flex-col gap-1">
                  <button
                    onClick={() => zoomIn()}
                    aria-label="Acercar"
                    className="w-8 h-8 rounded-lg bg-card border border-border flex items-center justify-center text-foreground hover:bg-muted"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => zoomOut()}
                    aria-label="Alejar"
                    className="w-8 h-8 rounded-lg bg-card border border-border flex items-center justify-center text-foreground hover:bg-muted"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => resetTransform()}
                    aria-label="Restablecer zoom"
                    className="w-8 h-8 rounded-lg bg-card border border-border flex items-center justify-center text-foreground hover:bg-muted"
                  >
                    <Maximize className="w-4 h-4" />
                  </button>
                </div>
                <TransformComponent
                  wrapperClass="!w-full !h-[260px] rounded-xl bg-background/40"
                  contentClass="!w-full"
                >
                  <div className="flex flex-col items-center gap-1.5 py-4 px-2 mx-auto">
                    {rows.map((row) => (
                      <div key={row} className="flex items-center gap-1.5">
                        <span className="text-[10px] text-muted-foreground w-4 text-center font-bold">
                          {row}
                        </span>
                        {Array.from({ length: seatsPerRow }, (_, i) => {
                          const id = `${row}-${i + 1}`;
                          const state = getState(id);
                          return (
                            <button
                              key={id}
                              disabled={state === "sold" || state === "reserved"}
                              onClick={() => toggleSeat(id)}
                              aria-label={`Asiento ${id} ${state}`}
                              className={cn(
                                "w-6 h-6 rounded-md text-[8px] font-bold transition-all",
                                seatClasses[state]
                              )}
                            >
                              {i + 1}
                            </button>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </TransformComponent>
              </>
            )}
          </TransformWrapper>

          <p className="text-[10px] text-center text-muted-foreground mt-2">
            Pellizca para hacer zoom · doble toque para encuadrar
          </p>

          {/* Legend */}
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
        <div className="flex gap-2">
          {sections.map((s) => (
            <button
              key={s.id}
              onClick={() => { setSelectedSection(s.id); setSelectedSeats([]); }}
              className={cn(
                "flex-1 p-3 rounded-xl border-2 transition-all text-center",
                selectedSection === s.id
                  ? "border-primary bg-primary/10"
                  : "border-border bg-card"
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
          <span className="text-2xl font-bold text-foreground w-8 text-center" aria-live="polite">{quantity}</span>
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

      {/* Bottom CTA — above BottomNav */}
      <div
        className="fixed left-0 right-0 px-4 max-w-md mx-auto z-30"
        style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 76px)" }}
      >
        <div className="bg-background/95 backdrop-blur-lg border border-border rounded-2xl p-3 shadow-xl flex items-center justify-between">
          <div>
            <p className="text-[11px] text-muted-foreground">{quantity} × ${unitPrice}</p>
            <p className="text-xl font-bold text-secondary">${total} USD</p>
          </div>
          <Button
            variant="hero"
            size="lg"
            onClick={() => onCheckout(event, section.label, quantity, total)}
            disabled={selectedSeats.length < quantity}
          >
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
