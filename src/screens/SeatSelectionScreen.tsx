import { ArrowLeft, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Event } from "@/lib/data";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface SeatSelectionScreenProps {
  event: Event;
  onBack: () => void;
  onCheckout: (event: Event, section: string, quantity: number, total: number) => void;
}

const sections = [
  { id: "general", label: "General", multiplier: 1, color: "bg-muted" },
  { id: "vip", label: "VIP", multiplier: 1.8, color: "bg-secondary/30" },
  { id: "platinum", label: "Platinum", multiplier: 2.5, color: "bg-primary/20" },
];

const SeatSelectionScreen = ({ event, onBack, onCheckout }: SeatSelectionScreenProps) => {
  const [selectedSection, setSelectedSection] = useState("general");
  const [quantity, setQuantity] = useState(1);

  const section = sections.find((s) => s.id === selectedSection)!;
  const unitPrice = Math.round(event.price * section.multiplier);
  const total = unitPrice * quantity;

  // Generate seat grid
  const rows = ["A", "B", "C", "D", "E", "F"];
  const seatsPerRow = 8;
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);

  const toggleSeat = (seat: string) => {
    if (selectedSeats.includes(seat)) {
      setSelectedSeats(selectedSeats.filter((s) => s !== seat));
    } else if (selectedSeats.length < quantity) {
      setSelectedSeats([...selectedSeats, seat]);
    }
  };

  return (
    <div className="pb-28">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-3 safe-top">
        <button onClick={onBack} className="p-2 rounded-full bg-muted text-foreground">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-foreground">Seleccionar asientos</h1>
          <p className="text-xs text-muted-foreground">{event.title}</p>
        </div>
      </div>

      {/* Stage */}
      <div className="px-4 mt-4">
        <div className="w-full h-8 gradient-primary rounded-t-[100%] flex items-center justify-center">
          <span className="text-[10px] font-bold text-primary-foreground uppercase tracking-widest">Escenario</span>
        </div>
      </div>

      {/* Seat Map */}
      <div className="px-4 mt-6">
        <div className="glass-card rounded-2xl p-4">
          <div className="flex flex-col items-center gap-1.5">
            {rows.map((row) => (
              <div key={row} className="flex items-center gap-1.5">
                <span className="text-[10px] text-muted-foreground w-4 text-center">{row}</span>
                {Array.from({ length: seatsPerRow }, (_, i) => {
                  const seatId = `${row}-${i + 1}`;
                  const isSelected = selectedSeats.includes(seatId);
                  const isOccupied = ["A-3", "B-5", "C-2", "D-7", "E-1", "F-4"].includes(seatId);
                  return (
                    <button
                      key={seatId}
                      disabled={isOccupied}
                      onClick={() => toggleSeat(seatId)}
                      className={cn(
                        "w-7 h-7 rounded-md text-[9px] font-bold transition-all",
                        isOccupied && "bg-muted/50 text-muted-foreground/30 cursor-not-allowed",
                        isSelected && "bg-primary text-primary-foreground scale-110",
                        !isOccupied && !isSelected && "bg-muted text-muted-foreground hover:bg-accent"
                      )}
                    >
                      {i + 1}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-4 mt-4">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-muted" />
              <span className="text-[10px] text-muted-foreground">Disponible</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-primary" />
              <span className="text-[10px] text-muted-foreground">Seleccionado</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-muted/30" />
              <span className="text-[10px] text-muted-foreground">Ocupado</span>
            </div>
          </div>
        </div>
      </div>

      {/* Section Selection */}
      <div className="px-4 mt-4">
        <h3 className="text-sm font-bold text-foreground mb-3">Sección</h3>
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
        <h3 className="text-sm font-bold text-foreground mb-3">Cantidad</h3>
        <div className="flex items-center justify-center gap-6 glass-card rounded-2xl p-4">
          <button
            onClick={() => { setQuantity(Math.max(1, quantity - 1)); setSelectedSeats([]); }}
            className="p-2 rounded-full bg-muted text-foreground"
          >
            <Minus className="w-5 h-5" />
          </button>
          <span className="text-2xl font-bold text-foreground w-8 text-center">{quantity}</span>
          <button
            onClick={() => { setQuantity(Math.min(10, quantity + 1)); setSelectedSeats([]); }}
            className="p-2 rounded-full bg-primary text-primary-foreground"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="fixed bottom-16 left-0 right-0 p-4 bg-background/90 backdrop-blur-lg border-t border-border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">{quantity} x ${unitPrice}</p>
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

export default SeatSelectionScreen;
