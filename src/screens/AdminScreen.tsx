import { useEffect, useState } from "react";
import { Shield, Users, Crown, User as UserIcon, Loader2, Ticket, Calendar, DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { events } from "@/lib/data";

interface AdminUser {
  id: string;
  user_id: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
  roles: string[];
}

interface Stats {
  totalUsers: number;
  totalAdmins: number;
  totalRegular: number;
}

const AdminScreen = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { data, error: invokeErr } = await supabase.functions.invoke("admin-service");
        if (invokeErr) throw invokeErr;
        if (data?.error) throw new Error(data.error);
        setUsers(data.users ?? []);
        setStats(data.stats ?? null);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error cargando datos");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="pb-24">
      <div className="px-4 pt-4 pb-2 safe-top flex items-center gap-2">
        <Shield className="w-5 h-5 text-primary" />
        <h1 className="text-xl font-bold text-foreground">Panel Admin</h1>
      </div>

      <div className="px-4 mt-3 grid grid-cols-2 gap-3">
        <div className="glass-card rounded-2xl p-4">
          <Users className="w-5 h-5 text-secondary mb-2" />
          <p className="text-2xl font-bold text-foreground">{stats?.totalUsers ?? "—"}</p>
          <p className="text-xs text-muted-foreground">Usuarios</p>
        </div>
        <div className="glass-card rounded-2xl p-4">
          <Crown className="w-5 h-5 text-secondary mb-2" />
          <p className="text-2xl font-bold text-foreground">{stats?.totalAdmins ?? "—"}</p>
          <p className="text-xs text-muted-foreground">Administradores</p>
        </div>
        <div className="glass-card rounded-2xl p-4">
          <Calendar className="w-5 h-5 text-primary mb-2" />
          <p className="text-2xl font-bold text-foreground">{events.length}</p>
          <p className="text-xs text-muted-foreground">Eventos</p>
        </div>
        <div className="glass-card rounded-2xl p-4">
          <Ticket className="w-5 h-5 text-primary mb-2" />
          <p className="text-2xl font-bold text-foreground">{sampleTickets.length}</p>
          <p className="text-xs text-muted-foreground">Tickets demo</p>
        </div>
      </div>

      <div className="px-4 mt-5">
        <h2 className="text-sm font-bold text-foreground mb-2">Usuarios registrados</h2>
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="glass-card rounded-2xl p-4 text-sm text-destructive">{error}</div>
        ) : users.length === 0 ? (
          <div className="glass-card rounded-2xl p-4 text-sm text-muted-foreground">
            No hay usuarios todavía.
          </div>
        ) : (
          <div className="glass-card rounded-2xl divide-y divide-border overflow-hidden">
            {users.map((u) => {
              const isAdmin = u.roles.includes("admin");
              return (
                <div key={u.id} className="flex items-center gap-3 p-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isAdmin ? "gradient-primary" : "bg-muted"
                    }`}
                  >
                    {isAdmin ? (
                      <Crown className="w-5 h-5 text-primary-foreground" />
                    ) : (
                      <UserIcon className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {u.full_name ?? "Sin nombre"}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {new Date(u.created_at).toLocaleDateString("es-ES")}
                    </p>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      isAdmin
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {isAdmin ? "ADMIN" : "USUARIO"}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <p className="text-center text-[10px] text-muted-foreground mt-6">
        Microservicio: admin-service
      </p>
    </div>
  );
};

export default AdminScreen;
