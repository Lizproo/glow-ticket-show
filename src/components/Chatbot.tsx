import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Sparkles } from "lucide-react";
import { events } from "@/lib/data";

type Msg = { role: "user" | "bot"; text: string };

const quickReplies = [
  "¿Qué hay esta semana?",
  "Eventos baratos",
  "Conciertos cerca",
  "¿Cómo compro?",
];

const generateAnswer = (q: string): string => {
  const text = q.toLowerCase();
  if (/comprar|compra|pagar|ticket/.test(text)) {
    return "Para comprar: abre un evento → toca 'Seleccionar asientos' → elige sección y cantidad → completa el pago. Tu QR estará en 'Mis Tickets'.";
  }
  if (/barat|econom|bajo/.test(text)) {
    const cheap = [...events].sort((a, b) => a.price - b.price).slice(0, 3);
    return "Eventos más accesibles:\n" + cheap.map((e) => `• ${e.title} — $${e.price}`).join("\n");
  }
  if (/concierto/.test(text)) {
    const list = events.filter((e) => e.category === "concerts").slice(0, 3);
    return "Próximos conciertos:\n" + list.map((e) => `• ${e.title} (${e.city})`).join("\n");
  }
  if (/teatro/.test(text)) {
    const list = events.filter((e) => e.category === "theater");
    return list.length
      ? "En teatro tenemos:\n" + list.map((e) => `• ${e.title}`).join("\n")
      : "Pronto más obras de teatro.";
  }
  if (/cerca|ciudad|donde/.test(text)) {
    return "Activa la ubicación en la pantalla principal para ver eventos cerca de ti.";
  }
  if (/semana|hoy|fecha/.test(text)) {
    const next = events.slice(0, 3);
    return "Lo más próximo:\n" + next.map((e) => `• ${e.title} — ${e.date}`).join("\n");
  }
  if (/hola|hey|buenas/.test(text)) {
    return "¡Hola! Soy Glow, tu asistente. Pregúntame por eventos, precios o cómo comprar 🎫";
  }
  return "Puedo ayudarte con recomendaciones, precios, ubicación de venues o el proceso de compra. ¿Qué te interesa?";
};

const Chatbot = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([
    { role: "bot", text: "¡Hola! Soy Glow ✨ tu asistente. ¿En qué te ayudo hoy?" },
  ]);
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing, open]);

  const send = (text: string) => {
    if (!text.trim()) return;
    setMessages((m) => [...m, { role: "user", text }]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      setMessages((m) => [...m, { role: "bot", text: generateAnswer(text) }]);
      setTyping(false);
    }, 600 + Math.random() * 400);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Abrir chatbot de asistencia"
        className="fixed bottom-20 right-4 z-40 w-14 h-14 rounded-full gradient-primary text-primary-foreground shadow-lg animate-pulse-glow flex items-center justify-center hover-scale focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center bg-foreground/40 backdrop-blur-sm animate-fade-in" onClick={() => setOpen(false)}>
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md h-[80vh] sm:h-[600px] bg-background rounded-t-3xl sm:rounded-3xl flex flex-col overflow-hidden border border-border animate-slide-up"
          >
            <div className="flex items-center justify-between px-4 py-3 gradient-primary">
              <div className="flex items-center gap-2 text-primary-foreground">
                <div className="w-9 h-9 rounded-full bg-background/20 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold">Glow Assistant</p>
                  <p className="text-[10px] opacity-80">En línea · IA</p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Cerrar chatbot"
                className="p-2 rounded-full bg-background/20 text-primary-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/30">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}>
                  <div
                    className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm whitespace-pre-line ${
                      m.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-sm"
                        : "bg-card text-foreground rounded-bl-sm border border-border"
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
              {typing && (
                <div className="flex justify-start">
                  <div className="bg-card border border-border rounded-2xl rounded-bl-sm px-3 py-2 flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "120ms" }} />
                    <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "240ms" }} />
                  </div>
                </div>
              )}
            </div>

            <div className="px-3 pt-2 pb-1 flex gap-2 overflow-x-auto scrollbar-hide bg-background border-t border-border">
              {quickReplies.map((q) => (
                <button
                  key={q}
                  onClick={() => send(q)}
                  className="flex-shrink-0 px-3 py-1.5 rounded-full bg-muted text-xs text-foreground hover:bg-accent transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              className="p-3 flex gap-2 border-t border-border bg-background safe-bottom"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Escribe un mensaje..."
                aria-label="Mensaje al asistente"
                className="flex-1 px-4 py-2.5 rounded-full bg-muted text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              <button
                type="submit"
                aria-label="Enviar mensaje"
                disabled={!input.trim()}
                className="w-10 h-10 rounded-full gradient-primary text-primary-foreground flex items-center justify-center disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
