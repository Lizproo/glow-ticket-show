import { useState } from "react";
import { User, CreditCard, Bell, HelpCircle, LogOut, ChevronRight, Shield, Moon, Clock, Heart, Sparkles, Pencil, Crown } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import EditProfileDialog from "@/components/EditProfileDialog";
import { usePreferences, defaultProfile } from "@/hooks/usePreferences";
import { useFavorites } from "@/hooks/useFavorites";
import { useTickets } from "@/hooks/useTickets";
import { useAuth } from "@/hooks/useAuth";
import { events, categories } from "@/lib/data";
import { toast } from "@/hooks/use-toast";

const ProfileScreen = () => {
  const { prefs, history, savePrefs } = usePreferences();
  const { favorites } = useFavorites();
  const { tickets } = useTickets();
  const { user, profile: authProfile, role, signOut } = useAuth();
  const [editing, setEditing] = useState(false);
  const profile = prefs.profile ?? defaultProfile;
  const displayName = authProfile?.full_name ?? profile.name ?? "Usuario";
  const displayEmail = user?.email ?? "—";

  const favCats = categories.filter((c) => prefs.categories.includes(c.id));
  const recent = history
    .map((id) => events.find((e) => e.id === id))
    .filter((e): e is typeof events[number] => Boolean(e))
    .slice(0, 4);

  const togglePrefCat = (id: string) => {
    const next = prefs.categories.includes(id)
      ? prefs.categories.filter((x) => x !== id)
      : [...prefs.categories, id];
    savePrefs({ ...prefs, categories: next });
  };

  const menuItems = [
    { icon: User, label: "Datos personales", desc: "Nombre, email, teléfono" },
    { icon: CreditCard, label: "Métodos de pago", desc: "Tarjetas guardadas" },
    { icon: Bell, label: "Notificaciones", desc: "Alertas y recordatorios" },
    { icon: Shield, label: "Seguridad", desc: "Contraseña y verificación" },
    { icon: HelpCircle, label: "Ayuda y soporte", desc: "FAQ y contacto" },
  ];

  return (
    <div className="pb-24">
      <div className="px-4 pt-4 pb-2 safe-top">
        <h1 className="text-xl font-bold text-foreground">Mi Perfil</h1>
      </div>

      {/* Profile Card */}
      <div className="px-4 mt-3">
        <div className="glass-card rounded-2xl p-4 flex items-center gap-4 hover-scale transition-transform">
          <div className="relative w-16 h-16 rounded-full gradient-primary flex items-center justify-center overflow-hidden">
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
            <p className="text-xs text-secondary font-semibold mt-1">
              🎫 {tickets.filter((t) => t.status === "active").length} tickets activos
            </p>
          </div>
          <button
            onClick={() => setEditing(true)}
            aria-label="Editar perfil"
            className="p-2 rounded-full bg-muted hover:bg-accent transition-colors"
          >
            <Pencil className="w-4 h-4 text-foreground" />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="px-4 mt-4">
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Vistos", value: history.length },
            { label: "Tickets", value: tickets.length },
            { label: "Favoritos", value: favorites.length },
          ].map((stat) => (
            <div key={stat.label} className="glass-card rounded-xl p-3 text-center hover-scale transition-transform">
              <p className="text-lg font-bold text-secondary">{stat.value}</p>
              <p className="text-[10px] text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Categorías favoritas */}
      <div className="px-4 mt-5">
        <h3 className="text-sm font-bold text-foreground mb-2 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-secondary" />
          Categorías favoritas
        </h3>
        <div className="glass-card rounded-2xl p-3 flex flex-wrap gap-2">
          {categories.filter((c) => c.id !== "all").map((cat) => {
            const active = prefs.categories.includes(cat.id);
            return (
              <button
                key={cat.id}
                onClick={() => togglePrefCat(cat.id)}
                aria-pressed={active}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                <span>{cat.icon}</span>
                {cat.label}
              </button>
            );
          })}
        </div>
        {favCats.length === 0 && (
          <p className="text-[11px] text-muted-foreground mt-2">
            Selecciona al menos una para mejorar tus recomendaciones.
          </p>
        )}
      </div>

      {/* Historial reciente */}
      {recent.length > 0 && (
        <div className="px-4 mt-5">
          <h3 className="text-sm font-bold text-foreground mb-2 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-primary" />
            Visto recientemente
          </h3>
          <div className="glass-card rounded-2xl p-3 flex flex-col gap-2">
            {recent.map((e) => (
              <div key={e.id} className="flex items-center gap-3">
                <img src={e.image} alt={e.title} className="w-10 h-10 rounded-lg object-cover" loading="lazy" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{e.title}</p>
                  <p className="text-[10px] text-muted-foreground">{e.city}</p>
                </div>
                {favorites.includes(e.id) && <Heart className="w-3.5 h-3.5 text-primary" fill="currentColor" />}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Theme Toggle */}
      <div className="px-4 mt-5">
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
              className="flex items-center gap-3 p-4 w-full text-left hover:bg-muted/50 transition-colors focus-visible:outline-none focus-visible:bg-muted/50"
            >
              <item.icon className="w-5 h-5 text-primary flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
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
          className="flex items-center gap-3 p-4 w-full text-left glass-card rounded-2xl hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="w-5 h-5 text-destructive" />
          <span className="text-sm font-medium text-destructive">Cerrar sesión</span>
        </button>
      </div>

      <p className="text-center text-[10px] text-muted-foreground mt-6">GlowTicket v2.0.0</p>

      <EditProfileDialog
        open={editing}
        initial={profile}
        onClose={() => setEditing(false)}
        onSave={(p) => savePrefs({ ...prefs, profile: p })}
      />
    </div>
  );
};

export default ProfileScreen;
