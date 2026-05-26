import { Home, Search, Ticket, User, Heart, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  showAdmin?: boolean;
}

const baseTabs = [
  { id: "home", label: "Inicio", icon: Home },
  { id: "search", label: "Buscar", icon: Search },
  { id: "favorites", label: "Favoritos", icon: Heart },
  { id: "tickets", label: "Tickets", icon: Ticket },
  { id: "profile", label: "Perfil", icon: User },
];

const BottomNav = ({ activeTab, onTabChange, showAdmin }: BottomNavProps) => {
  const tabs = showAdmin
    ? [...baseTabs.slice(0, 4), { id: "admin", label: "Admin", icon: Shield }, baseTabs[4]]
    : baseTabs;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border safe-bottom max-w-md mx-auto">
      <div className="flex items-center justify-around px-1 py-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all duration-200 min-w-[48px]",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <tab.icon
                className={cn("transition-all duration-200", isActive ? "w-6 h-6" : "w-5 h-5")}
                fill={isActive ? "currentColor" : "none"}
              />
              <span className={cn("text-[10px] font-medium transition-all", isActive && "font-bold")}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
