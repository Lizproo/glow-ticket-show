import { Ticket, Sparkles } from "lucide-react";

/**
 * Hero "video" promocional animado puramente con CSS/SVG.
 * Concierto lleno de euforia + reveal de "GlowTicket" + ticket dorado giratorio.
 */
const PromoHero = ({ onClick }: { onClick?: () => void }) => {
  return (
    <button
      onClick={onClick}
      aria-label="Vive la euforia con GlowTicket"
      className="block w-[calc(100%-2rem)] mx-4 mt-3 rounded-3xl overflow-hidden relative h-44 text-left group"
    >
      {/* Fondo gradient noche-concierto */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a0202] via-[#3a0a0a] to-[#6c1a21]" />

      {/* Spotlights barriendo */}
      <div className="absolute inset-0 overflow-hidden opacity-70">
        <div className="absolute -top-20 left-1/4 w-40 h-80 bg-gradient-to-b from-glow-light-gold/60 to-transparent origin-top blur-2xl spotlight-sweep" />
        <div className="absolute -top-20 right-1/4 w-40 h-80 bg-gradient-to-b from-primary/60 to-transparent origin-top blur-2xl spotlight-sweep-2" />
      </div>

      {/* Particulas bokeh (audiencia con linternas) */}
      <div className="absolute inset-0">
        {Array.from({ length: 24 }).map((_, i) => (
          <span
            key={i}
            className="absolute rounded-full bg-glow-light-gold/80 pulse-bokeh"
            style={{
              width: `${2 + (i % 4)}px`,
              height: `${2 + (i % 4)}px`,
              left: `${(i * 53) % 100}%`,
              top: `${55 + ((i * 17) % 40)}%`,
              animationDelay: `${(i % 8) * 0.15}s`,
              boxShadow: "0 0 6px rgba(255,210,140,0.8)",
            }}
          />
        ))}
      </div>

      {/* Silueta de público (manos arriba) */}
      <svg
        viewBox="0 0 400 100"
        preserveAspectRatio="none"
        className="absolute bottom-0 left-0 right-0 w-full h-16 text-black/70"
        aria-hidden
      >
        <path
          fill="currentColor"
          d="M0 100 V60 Q10 50 18 55 Q22 35 28 55 Q34 48 40 58 Q48 38 56 56 Q62 50 70 58 Q78 32 86 56 Q92 50 100 56 Q108 38 116 56 Q124 48 132 58 Q140 35 148 56 Q156 50 164 58 Q172 40 180 56 Q188 48 196 58 Q204 30 212 56 Q220 48 228 58 Q236 40 244 56 Q252 50 260 58 Q268 36 276 56 Q284 48 292 58 Q300 40 308 56 Q316 48 324 58 Q332 38 340 56 Q348 50 356 58 Q364 40 372 56 Q382 48 392 58 L400 60 V100 Z"
        />
      </svg>

      {/* Ticket dorado animado */}
      <div className="absolute top-3 right-3 ticket-spin">
        <div className="relative px-3 py-2 rounded-lg gradient-gold text-foreground font-bold text-[10px] tracking-wider shadow-2xl flex items-center gap-1.5">
          <Ticket className="w-3.5 h-3.5" />
          GOLDEN PASS
          {/* perforaciones */}
          <span className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[#3a0a0a]" />
          <span className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[#3a0a0a]" />
        </div>
      </div>

      {/* Texto principal con reveal */}
      <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-4 z-10">
        <p className="text-[10px] uppercase tracking-[0.3em] text-glow-light-gold flex items-center gap-1.5 promo-fade-up">
          <Sparkles className="w-3 h-3" />
          Vive la euforia
          <Sparkles className="w-3 h-3" />
        </p>
        <h2 className="mt-1 text-3xl font-black text-primary-foreground promo-title leading-none">
          <span className="bg-gradient-to-r from-glow-light-gold via-white to-glow-light-gold bg-clip-text text-transparent drop-shadow-[0_0_18px_rgba(206,162,87,0.6)]">
            GLOW
          </span>
          <span className="ml-1 text-glow-cream">TICKET</span>
        </h2>
        <p className="mt-1 text-[11px] text-glow-cream/90 promo-fade-up-2">
          Tu pase a los mejores eventos
        </p>
      </div>

      <style>{`
        @keyframes spotlight-sweep {
          0%, 100% { transform: rotate(-25deg); opacity: .35; }
          50% { transform: rotate(20deg); opacity: .85; }
        }
        @keyframes spotlight-sweep-2 {
          0%, 100% { transform: rotate(25deg); opacity: .35; }
          50% { transform: rotate(-20deg); opacity: .85; }
        }
        @keyframes pulse-bokeh {
          0%, 100% { transform: translateY(0) scale(1); opacity: .35; }
          50% { transform: translateY(-6px) scale(1.4); opacity: 1; }
        }
        @keyframes ticket-spin {
          0%, 100% { transform: rotate(-6deg) translateY(0); }
          50% { transform: rotate(8deg) translateY(-3px); }
        }
        @keyframes promo-title-in {
          0% { letter-spacing: -.1em; opacity: 0; transform: scale(.85); filter: blur(8px); }
          60% { letter-spacing: .02em; opacity: 1; filter: blur(0); }
          100% { letter-spacing: 0; transform: scale(1); }
        }
        @keyframes promo-fade-up {
          0% { opacity: 0; transform: translateY(8px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .spotlight-sweep { animation: spotlight-sweep 5s ease-in-out infinite; }
        .spotlight-sweep-2 { animation: spotlight-sweep-2 5s ease-in-out infinite; }
        .pulse-bokeh { animation: pulse-bokeh 2.4s ease-in-out infinite; }
        .ticket-spin { animation: ticket-spin 3.2s ease-in-out infinite; }
        .promo-title { animation: promo-title-in 1.6s cubic-bezier(.2,.8,.2,1) both; }
        .promo-fade-up { animation: promo-fade-up .8s .2s ease-out both; }
        .promo-fade-up-2 { animation: promo-fade-up 1s .9s ease-out both; }
      `}</style>
    </button>
  );
};

export default PromoHero;
