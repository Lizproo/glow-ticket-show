import { Ticket, Check, X } from "lucide-react";

interface Props {
  open: boolean;
  eventTitle: string;
  onClose: () => void;
}

const GoldenTicketModal = ({ open, eventTitle, onClose }: Props) => {
  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[60] flex items-center justify-center px-4 bg-black/80 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-sm rounded-3xl overflow-hidden golden-pop"
        style={{
          background: "linear-gradient(135deg, #6c1a21 0%, #b92c2c 50%, #cea257 100%)",
        }}
      >
        <button
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/30 text-white flex items-center justify-center"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Confeti */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 18 }).map((_, i) => (
            <span
              key={i}
              className="absolute confetti-piece"
              style={{
                left: `${(i * 53) % 100}%`,
                top: `-10%`,
                width: 6,
                height: 10,
                background: i % 2 ? "#cea257" : "#e5e0cd",
                animationDelay: `${(i % 9) * 0.08}s`,
              }}
            />
          ))}
        </div>

        <div className="relative p-6 text-center text-white">
          <div className="mx-auto w-20 h-20 rounded-full gradient-gold flex items-center justify-center shadow-2xl ticket-bounce">
            <Ticket className="w-10 h-10 text-foreground" />
          </div>
          <p className="mt-4 text-[10px] uppercase tracking-[0.3em] text-glow-light-gold">
            Validación exitosa
          </p>
          <h2 className="text-2xl font-black mt-1 leading-tight">¡Bienvenido al show!</h2>
          <p className="text-xs opacity-90 mt-2">{eventTitle}</p>

          <div className="mt-5 rounded-2xl bg-black/30 p-4 border border-white/10">
            <div className="flex items-center justify-center gap-2 text-glow-light-gold">
              <Check className="w-4 h-4" />
              <span className="text-sm font-bold">Ticket validado y consumido</span>
            </div>
            <p className="text-[11px] mt-1 opacity-80">
              Este código ya no puede volver a usarse. Disfruta de la euforia.
            </p>
          </div>

          <button
            onClick={onClose}
            className="mt-5 w-full py-3 rounded-xl bg-white text-foreground font-bold text-sm hover:opacity-90 transition"
          >
            Continuar
          </button>
        </div>

        <style>{`
          @keyframes golden-pop {
            0% { transform: scale(.7) rotate(-4deg); opacity: 0; }
            60% { transform: scale(1.04) rotate(1deg); opacity: 1; }
            100% { transform: scale(1) rotate(0); }
          }
          @keyframes ticket-bounce {
            0%,100% { transform: translateY(0) rotate(-6deg); }
            50% { transform: translateY(-6px) rotate(6deg); }
          }
          @keyframes confetti-fall {
            0% { transform: translateY(0) rotate(0); opacity: 1; }
            100% { transform: translateY(400px) rotate(540deg); opacity: 0; }
          }
          .golden-pop { animation: golden-pop .7s cubic-bezier(.2,.8,.2,1) both; }
          .ticket-bounce { animation: ticket-bounce 1.8s ease-in-out infinite; }
          .confetti-piece { animation: confetti-fall 2.4s ease-in forwards; }
        `}</style>
      </div>
    </div>
  );
};

export default GoldenTicketModal;
