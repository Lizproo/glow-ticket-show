import { useEffect, useState } from "react";
import {
  Shield, Plus, Pencil, Trash2, Loader2, Calendar, MapPin, Users, Ticket, X, Save, Search,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { z } from "zod";

interface AdminEvent {
  id: string;
  title: string;
  category: string | null;
  event_date: string;
  event_time: string;
  venue: string;
  city: string;
  base_price: number;
  capacity: number | null;
  image: string | null;
  description: string | null;
  venue_type: string;
  status: string;
}

interface SoldStats {
  [eventId: string]: { sold: number; revenue: number };
}

const CATEGORIES = ["concerts", "festivals", "sports", "theater", "opera", "comedy"];
const VENUE_TYPES = ["theater", "stadium", "coliseum", "arena", "auditorium"];

const eventSchema = z.object({
  title: z.string().trim().min(3, "Título muy corto").max(120),
  category: z.string().min(1, "Selecciona categoría"),
  event_date: z.string().min(1, "Fecha requerida"),
  event_time: z.string().min(1, "Hora requerida"),
  venue: z.string().trim().min(2).max(80),
  city: z.string().trim().min(2).max(60),
  base_price: z.coerce.number().min(0).max(10000),
  capacity: z.coerce.number().int().min(1).max(500000),
  image: z.string().trim().url("URL inválida").or(z.literal("")),
  description: z.string().trim().max(800).optional().or(z.literal("")),
  venue_type: z.string().min(1),
});

const emptyForm = {
  title: "",
  category: "concerts",
  event_date: "",
  event_time: "20:00",
  venue: "",
  city: "",
  base_price: 50,
  capacity: 1000,
  image: "",
  description: "",
  venue_type: "arena",
};

const AdminScreen = () => {
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [stats, setStats] = useState<SoldStats>({});
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AdminEvent | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const loadAll = async () => {
    setLoading(true);
    const [{ data: ev }, { data: tk }] = await Promise.all([
      supabase
        .from("events")
        .select("*")
        .is("deleted_at", null)
        .order("event_date", { ascending: true }),
      supabase.from("tickets").select("event_id, quantity, total_price"),
    ]);
    setEvents((ev ?? []) as AdminEvent[]);
    const s: SoldStats = {};
    (tk ?? []).forEach((t: any) => {
      const id = t.event_id;
      if (!s[id]) s[id] = { sold: 0, revenue: 0 };
      s[id].sold += t.quantity ?? 1;
      s[id].revenue += Number(t.total_price ?? 0);
    });
    setStats(s);
    setLoading(false);
  };

  useEffect(() => {
    loadAll();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (ev: AdminEvent) => {
    setEditing(ev);
    setForm({
      title: ev.title,
      category: ev.category ?? "concerts",
      event_date: ev.event_date,
      event_time: ev.event_time,
      venue: ev.venue,
      city: ev.city,
      base_price: ev.base_price,
      capacity: ev.capacity ?? 1000,
      image: ev.image ?? "",
      description: ev.description ?? "",
      venue_type: ev.venue_type ?? "arena",
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    const parsed = eventSchema.safeParse(form);
    if (!parsed.success) {
      toast({
        title: "Datos inválidos",
        description: parsed.error.issues[0].message,
        variant: "destructive",
      });
      return;
    }
    setSaving(true);
    const payload = {
      ...parsed.data,
      image: parsed.data.image || null,
      description: parsed.data.description || null,
      status: "activo",
    };
    const { error } = editing
      ? await supabase.from("events").update(payload).eq("id", editing.id)
      : await supabase.from("events").insert(payload);
    setSaving(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: editing ? "Evento actualizado" : "Evento creado" });
    setDialogOpen(false);
    loadAll();
  };

  const handleDelete = async (ev: AdminEvent) => {
    if (!confirm(`¿Eliminar "${ev.title}"? Esta acción es reversible (soft delete).`)) return;
    const { error } = await supabase
      .from("events")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", ev.id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Evento eliminado" });
    loadAll();
  };

  const filtered = events.filter(
    (e) =>
      !query ||
      e.title.toLowerCase().includes(query.toLowerCase()) ||
      e.city.toLowerCase().includes(query.toLowerCase()) ||
      e.venue.toLowerCase().includes(query.toLowerCase())
  );

  const totals = events.reduce(
    (acc, e) => {
      const s = stats[e.id] ?? { sold: 0, revenue: 0 };
      acc.sold += s.sold;
      acc.revenue += s.revenue;
      acc.capacity += e.capacity ?? 0;
      return acc;
    },
    { sold: 0, revenue: 0, capacity: 0 }
  );

  return (
    <div className="pb-24">
      <div className="px-4 pt-4 pb-2 safe-top flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          <h1 className="text-xl font-bold text-foreground">Panel Admin</h1>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 px-3 py-2 rounded-full gradient-primary text-primary-foreground text-xs font-bold shadow active:scale-95 transition"
        >
          <Plus className="w-4 h-4" /> Crear evento
        </button>
      </div>

      {/* KPIs globales */}
      <div className="px-4 mt-3 grid grid-cols-3 gap-2">
        <div className="glass-card rounded-2xl p-3">
          <Calendar className="w-4 h-4 text-primary mb-1" />
          <p className="text-lg font-bold text-foreground">{events.length}</p>
          <p className="text-[10px] text-muted-foreground">Eventos</p>
        </div>
        <div className="glass-card rounded-2xl p-3">
          <Ticket className="w-4 h-4 text-secondary mb-1" />
          <p className="text-lg font-bold text-foreground">{totals.sold}</p>
          <p className="text-[10px] text-muted-foreground">Vendidos</p>
        </div>
        <div className="glass-card rounded-2xl p-3">
          <Users className="w-4 h-4 text-primary mb-1" />
          <p className="text-lg font-bold text-foreground">${totals.revenue.toFixed(0)}</p>
          <p className="text-[10px] text-muted-foreground">Ingresos</p>
        </div>
      </div>

      {/* Search */}
      <div className="px-4 mt-4">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar evento..."
            className="bg-transparent flex-1 text-sm focus:outline-none text-foreground"
          />
        </div>
      </div>

      {/* Lista */}
      <div className="px-4 mt-3">
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-10">
            No hay eventos. Crea el primero.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((ev) => {
              const sold = stats[ev.id]?.sold ?? 0;
              const cap = ev.capacity ?? 0;
              const available = Math.max(0, cap - sold);
              const pct = cap > 0 ? Math.min(100, (sold / cap) * 100) : 0;
              return (
                <div key={ev.id} className="glass-card rounded-2xl p-3">
                  <div className="flex gap-3">
                    {ev.image ? (
                      <img
                        src={ev.image}
                        alt={ev.title}
                        className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                        onError={(e) => ((e.currentTarget.style.display = "none"))}
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-6 h-6 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-foreground truncate">{ev.title}</p>
                      <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3" />
                        {new Date(ev.event_date).toLocaleDateString("es-ES")} · {ev.event_time}
                      </p>
                      <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {ev.venue}, {ev.city}
                      </p>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <button
                        onClick={() => openEdit(ev)}
                        className="p-2 rounded-lg bg-muted text-foreground hover:bg-accent"
                        aria-label="Editar"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(ev)}
                        className="p-2 rounded-lg bg-destructive/15 text-destructive hover:bg-destructive/25"
                        aria-label="Eliminar"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Stats vendidos / disponibles */}
                  <div className="mt-3 pt-3 border-t border-border">
                    <div className="flex justify-between text-[11px] text-muted-foreground mb-1">
                      <span>Vendidos: <strong className="text-foreground">{sold}</strong></span>
                      <span>Disponibles: <strong className="text-foreground">{available}</strong></span>
                      <span>Cap: <strong className="text-foreground">{cap}</strong></span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full gradient-primary" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="flex justify-between mt-1.5">
                      <span className="text-[10px] text-muted-foreground">
                        ${ev.base_price} USD · {ev.venue_type}
                      </span>
                      <span className="text-[10px] font-bold text-secondary">
                        ${(stats[ev.id]?.revenue ?? 0).toFixed(0)} ingresos
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Dialog Crear / Editar */}
      {dialogOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur flex items-end sm:items-center justify-center"
          onClick={() => setDialogOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-background w-full max-w-md max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl border border-border animate-slide-up"
          >
            <div className="sticky top-0 bg-background border-b border-border px-4 py-3 flex items-center justify-between">
              <h2 className="text-base font-bold text-foreground">
                {editing ? "Editar evento" : "Crear evento"}
              </h2>
              <button
                onClick={() => setDialogOpen(false)}
                className="p-1.5 rounded-lg hover:bg-muted"
                aria-label="Cerrar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              <Field label="Título">
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  maxLength={120}
                  className="input-style"
                />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Categoría">
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="input-style"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Tipo de recinto">
                  <select
                    value={form.venue_type}
                    onChange={(e) => setForm({ ...form, venue_type: e.target.value })}
                    className="input-style"
                  >
                    {VENUE_TYPES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Fecha">
                  <input
                    type="date"
                    value={form.event_date}
                    onChange={(e) => setForm({ ...form, event_date: e.target.value })}
                    className="input-style"
                  />
                </Field>
                <Field label="Hora">
                  <input
                    type="time"
                    value={form.event_time}
                    onChange={(e) => setForm({ ...form, event_time: e.target.value })}
                    className="input-style"
                  />
                </Field>
              </div>

              <Field label="Recinto">
                <input
                  value={form.venue}
                  onChange={(e) => setForm({ ...form, venue: e.target.value })}
                  className="input-style"
                />
              </Field>
              <Field label="Ciudad">
                <input
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="input-style"
                />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Precio base (USD)">
                  <input
                    type="number"
                    value={form.base_price}
                    onChange={(e) => setForm({ ...form, base_price: Number(e.target.value) })}
                    min={0}
                    className="input-style"
                  />
                </Field>
                <Field label="Capacidad">
                  <input
                    type="number"
                    value={form.capacity}
                    onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })}
                    min={1}
                    className="input-style"
                  />
                </Field>
              </div>

              <Field label="URL de imagen">
                <input
                  type="url"
                  value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                  placeholder="https://..."
                  className="input-style"
                />
              </Field>

              <Field label="Descripción">
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  maxLength={800}
                  className="input-style resize-none"
                />
              </Field>

              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full mt-2 py-3 rounded-xl gradient-primary text-primary-foreground font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {editing ? "Guardar cambios" : "Crear evento"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .input-style {
          width: 100%;
          padding: 0.625rem 0.75rem;
          border-radius: 0.75rem;
          background: hsl(var(--muted));
          color: hsl(var(--foreground));
          font-size: 0.875rem;
          border: 1px solid hsl(var(--border));
        }
        .input-style:focus { outline: none; border-color: hsl(var(--primary)); }
      `}</style>
    </div>
  );
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
      {label}
    </label>
    <div className="mt-1">{children}</div>
  </div>
);

export default AdminScreen;
