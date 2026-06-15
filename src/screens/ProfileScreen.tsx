import { useState } from "react";
import {
  User, HelpCircle, LogOut, ChevronRight, Shield, Moon, Pencil, Crown,
  KeyRound, Settings, Ticket as TicketIcon,
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import EditProfileDialog from "@/components/EditProfileDialog";
import ChangePasswordDialog from "@/components/ChangePasswordDialog";
import SettingsDialog from "@/components/SettingsDialog";
import PrivacySecurityDialog from "@/components/PrivacySecurityDialog";
import HelpSupportDialog from "@/components/HelpSupportDialog";
import { usePreferences, defaultProfile } from "@/hooks/usePreferences";
import { useTickets } from "@/hooks/useTickets";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

const ProfileScreen = () => {
  const { prefs, savePrefs } = usePreferences();
  const { tickets } = useTickets();
  const { user, profile: authProfile, role, signOut } = useAuth();
  const [editing, setEditing] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [openSettings, setOpenSettings] = useState(false);
  const [openPrivacy, setOpenPrivacy] = useState(false);
  const [openHelp, setOpenHelp] = useState(false);

  const profile = prefs.profile ?? defaultProfile;
  const displayName = authProfile?.full_name ?? profile.name ?? "Usuario";
  const displayEmail = user?.email ?? "—";
  const today = new Date().toISOString().slice(0, 10);
  const activeTickets = tickets.filter((t) => t.event_date >= today).length;

  const menuItems: { icon: typeof User; label: string; desc: string; onClick: () => void }[] = [
    { icon: User, label: "Editar perfil", desc: "Nombre, teléfono y avatar", onClick: () => setEditing(true) },
    { icon: KeyRound, label: "Cambiar contraseña", desc: "Actualiza tu clave de acceso", onClick: () => setChangingPassword(true) },
    { icon: Settings, label: "Accesibilidad", desc: "Modo daltónico, contraste, texto", onClick: () => setOpenSettings(true) },
    { icon: Shield, label: "Privacidad y seguridad", desc: "Sesiones, datos y dispositivos", onClick: () => setOpenPrivacy(true) },
    { icon: HelpCircle, label: "Ayuda y soporte", desc: "Contáctanos cuando quieras", onClick: () => setOpenHelp(true) },
  ];

  return (
    <div className="pb-28">
      <div className="px-4 pt-4 pb-2 safe-top">
        <h1 className="text-xl font-bold text-foreground">Mi Perfil</h1>
      </div>

      {/* Profile Card */}
      <div className="px-4 mt-3">
        <div className="glass-card rounded-2xl p-4 flex items-center gap-4">
          <div className="relative w-16 h-16 rounded-full gradient-primary flex items-center justify-center overflow-hidden flex-shrink-0">
            {authProfile?.avatar_url || profile.avatar ? (
              <img src={authProfile?.avatar_url ?? profile.avatar} alt="" className="w-full h-full object-cover" />
            ) : (
              <User className="w-8 h-8 text-primary-foreground" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-foreground truncate">{displayName}</h2>
              {role === "admin" && (
                <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full gradient-primary text-primary-foreground">
                  <Crown className="w-2.5 h-2.5" /> ADMIN
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground truncate">{displayEmail}</p>
            <p className="text-xs text-secondary font-semibold mt-1 flex items-center gap-1">
              <TicketIcon className="w-3 h-3" /> {activeTickets} ticket{activeTickets !== 1 ? "s" : ""} activo{activeTickets !== 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={() => setEditing(true)}
            aria-label="Editar perfil"
            className="p-2 rounded-full bg-muted hover:bg-accent transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center"
          >
            <Pencil className="w-4 h-4 text-foreground" />
          </button>
        </div>
      </div>

      {/* Theme Toggle */}
      <div className="px-4 mt-4">
        <div className="glass-card rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Moon className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Modo oscuro</span>
          </div>
          <ThemeToggle />
        </div>
      </div>

      {/* Menu */}
      <div className="px-4 mt-4">
        <div className="glass-card rounded-2xl overflow-hidden divide-y divide-border">
          {menuItems.map((item) => (
            <button
              key={item.label}
              onClick={item.onClick}
              className="flex items-center gap-3 p-4 w-full text-left hover:bg-muted/50 transition-colors focus-visible:outline-none focus-visible:bg-muted/50 min-h-[60px]"
            >
              <item.icon className="w-5 h-5 text-primary flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{item.label}</p>
                <p className="text-xs text-muted-foreground truncate">{item.desc}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 mt-4">
        <button
          onClick={async () => {
            await signOut();
            toast({ title: "Sesión cerrada" });
          }}
          className="flex items-center gap-3 p-4 w-full text-left glass-card rounded-2xl hover:bg-destructive/10 transition-colors min-h-[60px]"
        >
          <LogOut className="w-5 h-5 text-destructive" />
          <span className="text-sm font-medium text-destructive">Cerrar sesión</span>
        </button>
      </div>

      <p className="text-center text-[10px] text-muted-foreground mt-6">GlowTicket v2.1.0</p>

      <EditProfileDialog
        open={editing}
        initial={profile}
        onClose={() => setEditing(false)}
        onSave={(p) => savePrefs({ ...prefs, profile: p })}
      />
      <ChangePasswordDialog open={changingPassword} onClose={() => setChangingPassword(false)} />
      <SettingsDialog open={openSettings} onClose={() => setOpenSettings(false)} />
    </div>
  );
};

export default ProfileScreen;
