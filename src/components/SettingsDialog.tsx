import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useA11y, Daltonism } from "@/hooks/useA11y";
import { Eye, Type, Contrast } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
}

const daltonismOptions: { id: Daltonism; label: string; desc: string }[] = [
  { id: "none", label: "Sin filtro", desc: "Colores originales" },
  { id: "protanopia", label: "Protanopia", desc: "Dificultad con rojos" },
  { id: "deuteranopia", label: "Deuteranopia", desc: "Dificultad con verdes" },
  { id: "tritanopia", label: "Tritanopia", desc: "Dificultad con azules" },
];

const SettingsDialog = ({ open, onClose }: Props) => {
  const { daltonism, highContrast, largeText, setDaltonism, setHighContrast, setLargeText } = useA11y();
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Accesibilidad y preferencias</DialogTitle>
          <DialogDescription>Ajusta la app a tus necesidades visuales.</DialogDescription>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          <section>
            <Label className="text-xs font-bold flex items-center gap-1.5 mb-2">
              <Eye className="w-3.5 h-3.5" /> Modo daltónico
            </Label>
            <div className="grid grid-cols-2 gap-2">
              {daltonismOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setDaltonism(opt.id)}
                  aria-pressed={daltonism === opt.id}
                  className={`text-left rounded-xl border-2 p-2.5 transition-all ${
                    daltonism === opt.id
                      ? "border-primary bg-primary/10"
                      : "border-border bg-card hover:bg-muted/60"
                  }`}
                >
                  <p className="text-xs font-bold text-foreground">{opt.label}</p>
                  <p className="text-[10px] text-muted-foreground">{opt.desc}</p>
                </button>
              ))}
            </div>
          </section>

          <section className="flex items-center justify-between">
            <Label htmlFor="hc" className="flex items-center gap-1.5 text-sm">
              <Contrast className="w-4 h-4" /> Alto contraste
            </Label>
            <Switch id="hc" checked={highContrast} onCheckedChange={setHighContrast} />
          </section>

          <section className="flex items-center justify-between">
            <Label htmlFor="lt" className="flex items-center gap-1.5 text-sm">
              <Type className="w-4 h-4" /> Texto grande
            </Label>
            <Switch id="lt" checked={largeText} onCheckedChange={setLargeText} />
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsDialog;
