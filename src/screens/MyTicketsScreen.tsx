import { Calendar, MapPin, QrCode, ShieldCheck, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import AnimatedQR from "@/components/AnimatedQR";
import { useTickets, DbTicket } from "@/hooks/useTickets";

const MyTicketsScreen = () => {
  const { tickets, loading } = useTickets();
  const [activeFilter, setActiveFilter] = useState<"active" | "used" | "expired">("active");
  const [expandedTicket, setExpandedTicket] = useState<string | null>(null);

  const filtered = tickets.filter((t) => t.status === activeFilter);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });
  };

  return (
    <div className="pb-28">
      <div className="px-4 pt-4 pb-2 safe-top">
        <h1 className="text-xl font-bold text-foreground">Mis Tickets</h1>
        <p className="text-xs text-muted-foreground mt-0.5">QR cifrado · se activa antes del evento</p>
      </div>

      {/* Tabs */}
      <div role="tablist" aria-label="Filtros de tickets" className="grid grid-cols-3 gap-1 px-4 mt-3 bg-muted/50 rounded-full p-1 mx-4">
        {(["active", "used", "expired"] as const).map((filter) => {
          const count = tickets.filter((t) => t.status === filter).length;
          const label = filter === "active" ? "Activos" : filter === "used" ? "Usados" : "Expirados";
          return (
            <button
              key={filter}
              role="tab"
              aria-selected={activeFilter === filter}
              onClick={() => setActiveFilter(filter)}
              className={cn(
                "py-2 rounded-full text-xs font-semibold transition-all flex items-center justify-center gap-1.5 min-h-[36px]",
                activeFilter === filter
                  ? "bg-primary text-primary-foreground shadow"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {label}
              <span
                className={cn(
                  "text-[10px] font-bold rounded-full px-1.5 py-0.5 min-w-[18px]",
                  activeFilter === filter ? "bg-primary-foreground/20" : "bg-muted-foreground/15"
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Ticket List */}
      <div className="px-4 mt-4 flex flex-col gap-4">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <QrCode className="w-12 h-12 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground mt-3">
              No hay tickets {activeFilter === "active" ? "activos" : activeFilter === "used" ? "usados" : "expirados"}
            </p>
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
  ticket: DbTicket;
  expanded: boolean;
  onToggle: () => void;
  formatDate: (d: string) => string;
}) => (
  <button onClick={onToggle} className="w-full text-left">
    <div className="glass-card rounded-2xl overflow-hidden animate-slide-up">
      <div className="relative h-28">
        {ticket.event_image && (
          <img src={ticket.event_image} alt={ticket.event_title} className="w-full h-full object-cover" loading="lazy" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/70 to-transparent" />
        <div className="absolute bottom-3 left-3">
          <p className="text-xs text-glow-cream font-medium">{ticket.section}</p>
          <h3 className="font-bold text-primary-foreground">{ticket.event_title}</h3>
        </div>
        <div className="absolute top-3 right-3">
          <span className="px-2 py-1 rounded-full bg-primary/90 text-primary-foreground text-[10px] font-bold">
            {ticket.status === "active" ? "ACTIVO" : ticket.status === "used" ? "USADO" : "EXPIRADO"}
          </span>
        </div>
      </div>

      <div className="relative flex items-center">
        <div className="w-4 h-8 bg-background rounded-r-full -ml-1 z-10" />
        <div className="flex-1 border-t-2 border-dashed border-border" />
        <div className="w-4 h-8 bg-background rounded-l-full -mr-1 z-10" />
      </div>

      <div className="p-4 pt-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="w-3 h-3" />
            <span>{formatDate(ticket.event_date)}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <MapPin className="w-3 h-3" />
            <span>{ticket.event_city}</span>
          </div>
        </div>

        {expanded && (
          <div className="mt-4 animate-slide-up">
            <div className="flex flex-col items-center gap-3 p-4 bg-muted/60 rounded-xl">
              <AnimatedQR value={ticket.qr_code} size={170} />
              <p className="text-xs font-mono text-muted-foreground tracking-wider">{ticket.qr_code}</p>
              <p className="text-[10px] text-muted-foreground">
                Asiento: {ticket.seat} · {ticket.quantity} entrada{ticket.quantity > 1 ? "s" : ""}
              </p>
              <div className="flex items-center gap-1.5 text-[10px] text-secondary font-semibold">
                <ShieldCheck className="w-3 h-3" />
                Validación cifrada en tiempo real
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  </button>
);

export default MyTicketsScreen;
