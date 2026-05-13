import { useState } from "react";
import { Button } from "@/components/ui/button";
import { categories, Event } from "@/lib/data";
import { usePreferences, setOnboarded } from "@/hooks/usePreferences";
import { Sparkles, MapPin, Bell, Check } from "lucide-react";
import logo from "@/assets/logo.png";

interface OnboardingScreenProps {
  onComplete: () => void;
}

const slides = [
  {
    icon: Sparkles,
    title: "Descubre eventos únicos",
    desc: "Conciertos, teatro, festivales y más, curados especialmente para ti.",
  },
  {
    icon: MapPin,
    title: "Eventos cerca de ti",
    desc: "Encuentra qué pasa hoy en tu ciudad con un solo toque.",
  },
  {
    icon: Bell,
    title: "Nunca te pierdas nada",
    desc: "Recibe alertas y recomendaciones inteligentes con IA.",
  },
];

const OnboardingScreen = ({ onComplete }: OnboardingScreenProps) => {
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);
  const { savePrefs } = usePreferences();

  const isPickStep = step === slides.length;

  const toggle = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const finish = () => {
    savePrefs({ categories: selected });
    setOnboarded();
    onComplete();
  };

  if (isPickStep) {
    const pickable = categories.filter((c) => c.id !== "all");
    return (
      <div className="min-h-screen flex flex-col px-6 pt-12 pb-8 safe-top safe-bottom animate-fade-in">
        <div className="flex items-center gap-2 mb-6">
          <img src={logo} alt="GlowTicket" className="w-8 h-8" />
          <span className="font-bold text-foreground">GlowTicket</span>
        </div>
        <h2 className="text-2xl font-bold text-foreground">¿Qué te gusta?</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Elige tus categorías favoritas para personalizar tus recomendaciones.
        </p>

        <div className="grid grid-cols-2 gap-3 mt-6">
          {pickable.map((cat) => {
            const active = selected.includes(cat.id);
            return (
              <button
                key={cat.id}
                onClick={() => toggle(cat.id)}
                aria-pressed={active}
                className={`relative p-4 rounded-2xl border-2 text-left transition-all hover-scale ${
                  active
                    ? "border-primary bg-primary/10"
                    : "border-border bg-card"
                }`}
              >
                <span className="text-3xl">{cat.icon}</span>
                <p className="mt-2 font-semibold text-sm text-foreground">{cat.label}</p>
                {active && (
                  <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                    <Check className="w-3 h-3" />
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-auto pt-6 space-y-2">
          <Button
            variant="hero"
            size="lg"
            className="w-full"
            onClick={finish}
            disabled={selected.length === 0}
          >
            Continuar
          </Button>
          <button
            onClick={finish}
            className="w-full text-xs text-muted-foreground py-2"
          >
            Omitir por ahora
          </button>
        </div>
      </div>
    );
  }

  const slide = slides[step];
  const Icon = slide.icon;

  return (
    <div className="min-h-screen flex flex-col items-center justify-between px-6 pt-12 pb-8 safe-top safe-bottom animate-fade-in">
      <div className="flex items-center gap-2 self-start">
        <img src={logo} alt="GlowTicket" className="w-8 h-8" />
        <span className="font-bold text-foreground">GlowTicket</span>
      </div>

      <div className="flex flex-col items-center text-center">
        <div className="w-32 h-32 rounded-full gradient-primary flex items-center justify-center animate-pulse-glow">
          <Icon className="w-14 h-14 text-primary-foreground" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mt-8">{slide.title}</h2>
        <p className="text-sm text-muted-foreground mt-3 max-w-xs">{slide.desc}</p>
      </div>

      <div className="w-full space-y-4">
        <div className="flex justify-center gap-2">
          {slides.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === step ? "w-8 bg-primary" : "w-1.5 bg-muted"
              }`}
            />
          ))}
        </div>
        <Button variant="hero" size="lg" className="w-full" onClick={() => setStep(step + 1)}>
          {step === slides.length - 1 ? "Comenzar" : "Siguiente"}
        </Button>
        <button
          onClick={() => {
            setOnboarded();
            onComplete();
          }}
          className="w-full text-xs text-muted-foreground"
        >
          Saltar
        </button>
      </div>
    </div>
  );
};

export default OnboardingScreen;
