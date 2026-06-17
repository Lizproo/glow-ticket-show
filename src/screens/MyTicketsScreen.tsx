import { Calendar, MapPin, QrCode, ShieldCheck, Loader2, EyeOff, ScanLine, ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMemo, useState } from "react";
import AnimatedQR from "@/components/AnimatedQR";
import GoldenTicketModal from "@/components/GoldenTicketModal";
import { useTickets, DbTicket } from "@/hooks/useTickets";
import { useAntiCapture } from "@/hooks/useAntiCapture";

type Filter = "active" | "expired";

const MyTicketsScreen = () => {
  const { tickets, loading, markAsUsed } = useTickets();
  const [activeFilter, setActiveFilter] = useState<Filter>("active");
  const [expandedTicket, setExpandedTicket] = useState<string | null>(null);
  const [celebrated, setCelebrated] = useState<{ title: string } | null>(null);
  const { hidden } = useAntiCapture(true);

  const today = new Date().toISOString().slice(0, 10);

  const computed = useMemo(
    () =>
      tickets.map((t) => ({
        ...t,
        // expirado si status ya es expired O si la fecha del evento ya pasó
        computedStatus: (t.status === "expired" || t.event_date < today ? "expired" : "active") as Filter,
      })),
    [tickets, today]
  );

  const filtered = computed.filter((t) => t.computedStatus === activeFilter);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });
  };

  const handleScan = async (ticket: DbTicket) => {
    try {
      await markAsUsed(ticket.id);
      setCelebrated({ title: ticket.event_title });
      setExpandedTicket(null);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div
      className="pb-28 relative select-none"
      style={{ WebkitUserSelect: "none", WebkitTouchCallout: "none" } as React.CSSProperties}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div className="px-4 pt-4 pb-2 safe-top">
        <h1 className="text-xl font-bold text-foreground">Mis Tickets</h1>
        <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
          <ShieldCheck className="w-3 h-3 text-primary" /> Pantalla protegida · QR rota cada 15s
        </p>
      </div>

      <div role="tablist" className="grid grid-cols-2 gap-1 px-4 mt-3 bg-muted/50 rounded-full p-1 mx-4">
        {(["active", "expired"] as const).map((filter) => {
          const count = computed.filter((t) => t.computedStatus === filter).length;
          const label = filter === "active" ? "Activos" : "Expirados";
          return (
            <button
              key={filter}
              role="tab"
              aria-selected={activeFilter === filter}
              onClick={() => setActiveFilter(filter)}
              className={cn(
                "py-2 rounded-full text-xs font-semibold transition-all flex items-center justify-center gap-1.5 min-h-[36px]",
                activeFilter === filter ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground"
              )}
            >
              {label}
              <span className={cn("text-[10px] font-bold rounded-full px-1.5 py-0.5 min-w-[18px]", activeFilter === filter ? "bg-primary-foreground/20" : "bg-muted-foreground/15")}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <div className={cn("px-4 mt-4 flex flex-col gap-4 transition-all", hidden && "blur-2xl pointer-events-none")}>
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <QrCode className="w-12 h-12 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground mt-3">
              No hay tickets {activeFilter === "active" ? "activos" : "expirados"}
            </p>
          </div>
        ) : (
          filtered.map((ticket) => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
              expanded={expandedTicket === ticket.id}
              onToggle={() => setExpandedTicket(expandedTicket === ticket.id ? null : ticket.id)}
              onScan={() => handleScan(ticket)}
              formatDate={formatDate}
              expired={ticket.computedStatus === "expired"}
            />
          ))
        )}
      </div>

      {hidden && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/95 backdrop-blur-xl gap-3 max-w-md mx-auto">
          <EyeOff className="w-10 h-10 text-primary" />
          <p className="text-sm font-semibold text-foreground">Contenido protegido</p>
          <p className="text-xs text-muted-foreground text-center px-8">
            Por seguridad ocultamos tus tickets cuando la pantalla pierde foco o se intenta capturar.
          </p>
        </div>
      )}

      <GoldenTicketModal
        open={!!celebrated}
        eventTitle={celebrated?.title ?? ""}
        onClose={() => setCelebrated(null)}
      />
    </div>
  );
};

const TicketImage = ({ src, alt }: { src: string | null; alt: string }) => {
  const [errored, setErrored] = useState(false);
  if (!src || errored) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center">
        <ImageOff className="w-8 h-8 text-muted-foreground/60" />
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      onError={() => setErrored(true)}
      className="w-full h-full object-cover"
      loading="lazy"
    />
  );
};

const TicketCard = ({
  ticket, expanded, onToggle, onScan, formatDate, expired,
}: {
  ticket: DbTicket;
  expanded: boolean;
  onToggle: () => void;
  onScan: () => void;
  formatDate: (d: string) => string;
  expired: boolean;
}) => (
  <div className="glass-card rounded-2xl overflow-hidden animate-slide-up">
    <button onClick={onToggle} className="w-full text-left">
      <div className="relative h-28">
        <TicketImage src={ticket.event_image} alt={ticket.event_title} />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/70 to-transparent" />
        <div className="absolute bottom-3 left-3">
          <p className="text-xs text-glow-cream font-medium">{ticket.section}</p>
          <h3 className="font-bold text-primary-foreground">{ticket.event_title}</h3>
        </div>
        <div className="absolute top-3 right-3">
          <span className={cn("px-2 py-1 rounded-full text-[10px] font-bold", expired ? "bg-foreground/40 text-background" : "bg-primary/90 text-primary-foreground")}>
            {expired ? "EXPIRADO" : "ACTIVO"}
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
          <div className="flex items-center gap-2 text-xs text-muted-foreground"><Calendar className="w-3 h-3" /><span>{formatDate(ticket.event_date)}</span></div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground"><MapPin className="w-3 h-3" /><span>{ticket.event_city}</span></div>
        </div>
      </div>
    </button>

    {expanded && !expired && (
      <div className="px-4 pb-4 animate-slide-up">
        <div className="flex flex-col items-center gap-3 p-4 bg-muted/60 rounded-xl">
          <AnimatedQR value={ticket.qr_code} size={170} />
          <p className="text-xs font-mono text-muted-foreground tracking-wider">{ticket.qr_code}</p>
          <p className="text-[10px] text-muted-foreground">
            Asiento{ticket.seat.includes(",") ? "s" : ""}: {ticket.seat} · {ticket.quantity} entrada{ticket.quantity > 1 ? "s" : ""}
          </p>
          <div className="flex items-center gap-1.5 text-[10px] text-secondary font-semibold">
            <ShieldCheck className="w-3 h-3" /> Validación cifrada · 15s
          </div>
          <button
            onClick={onScan}
            className="mt-2 w-full py-2.5 rounded-xl gradient-gold text-foreground text-xs font-bold flex items-center justify-center gap-2 active:scale-95 transition"
          >
            <ScanLine className="w-4 h-4" />
            Simular escaneo en entrada
          </button>
          <p className="text-[10px] text-muted-foreground text-center">
            Al escanear, el ticket se marca como usado y no se puede volver a presentar.
          </p>
        </div>
      </div>
    )}
  </div>
);

export default MyTicketsScreen;
