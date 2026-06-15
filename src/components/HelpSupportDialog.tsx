import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, Mail, MessageCircle, Phone, Heart } from "lucide-react";

interface Props { open: boolean; onClose: () => void; }

const HelpSupportDialog = ({ open, onClose }: Props) => {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm overflow-hidden p-0">
        <div className="gradient-primary p-6 text-center text-primary-foreground relative">
          <div className="absolute inset-0 opacity-30" style={{ background: "radial-gradient(circle at top, rgba(255,255,255,0.3), transparent)" }} />
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-primary-foreground/15 backdrop-blur-sm flex items-center justify-center mx-auto mb-3 animate-pulse-glow">
              <Sparkles className="w-7 h-7" />
            </div>
            <DialogHeader className="space-y-1">
              <DialogTitle className="text-primary-foreground text-xl">
                ¡Hola! ✨
              </DialogTitle>
            </DialogHeader>
            <p className="text-sm mt-2 leading-relaxed">
              Ponte en contacto con nuestro equipo <strong>GlowTicket</strong>.
              Estamos aquí para ayudarte 24/7 con cualquier duda o detalle.
            </p>
          </div>
        </div>

        <div className="p-5 space-y-3">
          <a href="mailto:soporte@glowticket.com" className="flex items-center gap-3 glass-card rounded-xl p-3 hover-scale transition-all">
            <Mail className="w-5 h-5 text-primary" />
            <div className="flex-1">
              <p className="text-[10px] text-muted-foreground">Escríbenos</p>
              <p className="text-sm font-medium text-foreground">soporte@glowticket.com</p>
            </div>
          </a>

          <a href="https://wa.me/593999999999" target="_blank" rel="noreferrer" className="flex items-center gap-3 glass-card rounded-xl p-3 hover-scale transition-all">
            <MessageCircle className="w-5 h-5 text-secondary" />
            <div className="flex-1">
              <p className="text-[10px] text-muted-foreground">WhatsApp</p>
              <p className="text-sm font-medium text-foreground">+593 99 999 9999</p>
            </div>
          </a>

          <a href="tel:+593999999999" className="flex items-center gap-3 glass-card rounded-xl p-3 hover-scale transition-all">
            <Phone className="w-5 h-5 text-primary" />
            <div className="flex-1">
              <p className="text-[10px] text-muted-foreground">Llámanos</p>
              <p className="text-sm font-medium text-foreground">Atención 24/7</p>
            </div>
          </a>

          <p className="text-[10px] text-center text-muted-foreground flex items-center justify-center gap-1 pt-2">
            Hecho con <Heart className="w-3 h-3 text-primary fill-primary" /> por el equipo GlowTicket
          </p>

          <Button variant="outline" className="w-full" onClick={onClose}>Cerrar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HelpSupportDialog;
