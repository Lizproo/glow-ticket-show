import { Calendar, MapPin, QrCode } from "lucide-react";
import { sampleTickets, Ticket } from "@/lib/data";
import { cn } from "@/lib/utils";
import { useState } from "react";

const MyTicketsScreen = () => {
  const [activeFilter, setActiveFilter] = useState<"active" | "used" | "expired">("active");
  const [expandedTicket, setExpandedTicket] = useState<string | null>(null);

  const filtered = sampleTickets.filter((t) => t.status === activeFilter);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });
  };

  return (
    <div className="pb-24">
      <div className="px-4 pt-4 pb-2 safe-top">
        <h1 className="text-xl font-bold text-foreground">Mis Tickets</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Gestiona tus entradas</p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 px-4 mt-3">
        {(["active", "used", "expired"] as const).map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={cn(
              "px-4 py-2 rounded-full text-xs font-semibold transition-all",
              activeFilter === filter
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            )}
          >
            {filter === "active" ? "Activos" : filter === "used" ? "Usados" : "Expirados"}
          </button>
        ))}
      </div>

      {/* Ticket List */}
      <div className="px-4 mt-4 flex flex-col gap-4">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <QrCode className="w-12 h-12 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground mt-3">No hay tickets {activeFilter === "active" ? "activos" : activeFilter === "used" ? "usados" : "expirados"}</p>
          </div>
        ) : (
          filtered.map((ticket) => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
              expanded={expandedTicket === ticket.id}
              onToggle={() => setExpandedTicket(expandedTicket === ticket.id ? null : ticket.id)}
              formatDate={formatDate}
            />
          ))
        )}
      </div>
    </div>
  );
};

const TicketCard = ({
  ticket,
  expanded,
  onToggle,
  formatDate,
}: {
  ticket: Ticket;
  expanded: boolean;
  onToggle: () => void;
  formatDate: (d: string) => string;
}) => (
  <button onClick={onToggle} className="w-full text-left">
    <div className="glass-card rounded-2xl overflow-hidden animate-slide-up">
      {/* Top Section */}
      <div className="relative h-28">
        <img src={ticket.event.image} alt={ticket.event.title} className="w-full h-full object-cover" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/70 to-transparent" />
        <div className="absolute bottom-3 left-3">
          <p className="text-xs text-glow-cream font-medium">{ticket.section}</p>
          <h3 className="font-bold text-primary-foreground">{ticket.event.title}</h3>
        </div>
        <div className="absolute top-3 right-3">
          <span className="px-2 py-1 rounded-full bg-primary/90 text-primary-foreground text-[10px] font-bold">
            {ticket.status === "active" ? "ACTIVO" : ticket.status === "used" ? "USADO" : "EXPIRADO"}
          </span>
        </div>
      </div>

      {/* Tear line */}
      <div className="relative flex items-center">
        <div className="w-4 h-8 bg-background rounded-r-full -ml-1 z-10" />
        <div className="flex-1 border-t-2 border-dashed border-border" />
        <div className="w-4 h-8 bg-background rounded-l-full -mr-1 z-10" />
      </div>

      {/* Bottom Section */}
      <div className="p-4 pt-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="w-3 h-3" />
            <span>{formatDate(ticket.event.date)}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <MapPin className="w-3 h-3" />
            <span>{ticket.event.city}</span>
          </div>
        </div>

        {expanded && (
          <div className="mt-4 animate-slide-up">
            <div className="flex flex-col items-center gap-2 p-4 bg-muted rounded-xl">
              {/* Simulated QR Code */}
              <div className="w-32 h-32 bg-foreground rounded-lg flex items-center justify-center">
                <QrCode className="w-20 h-20 text-background" />
              </div>
              <p className="text-xs font-mono text-muted-foreground">{ticket.qrCode}</p>
              <p className="text-[10px] text-muted-foreground">Asiento: {ticket.seat} · {ticket.quantity} entrada{ticket.quantity > 1 ? "s" : ""}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  </button>
);

export default MyTicketsScreen;
