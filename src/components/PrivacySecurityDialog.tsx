import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Shield, LogOut, Smartphone, Mail, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

interface Props { open: boolean; onClose: () => void; }

const PrivacySecurityDialog = ({ open, onClose }: Props) => {
  const { user, session } = useAuth();
  const [loadingAll, setLoadingAll] = useState(false);

  const signOutAll = async () => {
    setLoadingAll(true);
    const { error } = await supabase.auth.signOut({ scope: "global" });
    setLoadingAll(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Sesiones cerradas", description: "Se cerraron todas las sesiones activas." });
      onClose();
    }
  };

  const lastSignIn = user?.last_sign_in_at
    ? new Date(user.last_sign_in_at).toLocaleString("es-ES")
    : "—";

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" /> Privacidad y seguridad
          </DialogTitle>
          <DialogDescription>Gestiona tus sesiones y datos de acceso.</DialogDescription>
        </DialogHeader>

        <div className="space-y-3 mt-2">
          <div className="glass-card rounded-xl p-3 flex items-center gap-3">
            <Mail className="w-4 h-4 text-muted-foreground" />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-muted-foreground">Email</p>
              <p className="text-sm font-medium text-foreground truncate">{user?.email}</p>
            </div>
          </div>

          <div className="glass-card rounded-xl p-3 flex items-center gap-3">
            <Smartphone className="w-4 h-4 text-muted-foreground" />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-muted-foreground">Sesión actual</p>
              <p className="text-sm font-medium text-foreground">Activa</p>
              <p className="text-[10px] text-muted-foreground">Último ingreso: {lastSignIn}</p>
            </div>
          </div>

          <div className="glass-card rounded-xl p-3">
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              GlowTicket cifra tu información, no comparte tus datos con terceros y elimina
              tus tickets antiguos automáticamente conforme a nuestra política de privacidad.
            </p>
          </div>

          <Button
            variant="destructive"
            className="w-full"
            onClick={signOutAll}
            disabled={loadingAll || !session}
          >
            {loadingAll ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
            Cerrar sesión en todos los dispositivos
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PrivacySecurityDialog;
