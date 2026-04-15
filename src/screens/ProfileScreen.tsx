import { User, Settings, CreditCard, Bell, HelpCircle, LogOut, ChevronRight, Shield, Moon, Sun } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

const ProfileScreen = () => {
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
        <div className="glass-card rounded-2xl p-4 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center">
            <User className="w-8 h-8 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <h2 className="font-bold text-foreground">Usuario Demo</h2>
            <p className="text-xs text-muted-foreground">usuario@glowticket.com</p>
            <p className="text-xs text-secondary font-semibold mt-1">🎫 2 tickets activos</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="px-4 mt-4">
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Eventos", value: "12" },
            { label: "Tickets", value: "18" },
            { label: "Favoritos", value: "5" },
          ].map((stat) => (
            <div key={stat.label} className="glass-card rounded-xl p-3 text-center">
              <p className="text-lg font-bold text-secondary">{stat.value}</p>
              <p className="text-[10px] text-muted-foreground">{stat.label}</p>
            </div>
          ))}
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

      {/* Menu Items */}
      <div className="px-4 mt-4">
        <div className="glass-card rounded-2xl overflow-hidden divide-y divide-border">
          {menuItems.map((item) => (
            <button
              key={item.label}
              className="flex items-center gap-3 p-4 w-full text-left hover:bg-muted/50 transition-colors"
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

      {/* Logout */}
      <div className="px-4 mt-4">
        <button className="flex items-center gap-3 p-4 w-full text-left glass-card rounded-2xl hover:bg-destructive/10 transition-colors">
          <LogOut className="w-5 h-5 text-destructive" />
          <span className="text-sm font-medium text-destructive">Cerrar sesión</span>
        </button>
      </div>

      <p className="text-center text-[10px] text-muted-foreground mt-6">GlowTicket v1.0.0</p>
    </div>
  );
};

export default ProfileScreen;
