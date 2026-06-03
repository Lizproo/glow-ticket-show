import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Event } from "@/lib/data";

export interface DbTicket {
  id: string;
  event_id: string;
  event_title: string;
  event_date: string;
  event_time: string;
  event_venue: string;
  event_city: string;
  event_image: string | null;
  event_category: string | null;
  seat: string;
  section: string;
  quantity: number;
  total_price: number;
  qr_code: string;
  status: "active" | "used" | "expired";
  created_at: string;
}

export const useTickets = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<DbTicket[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) {
      setTickets([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from("tickets")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setTickets((data ?? []) as DbTicket[]);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const purchase = useCallback(
    async (event: Event, section: string, quantity: number, totalPrice: number) => {
      if (!user) throw new Error("No autenticado");
      const seat = `${section.slice(0, 1).toUpperCase()}${Math.floor(
        Math.random() * 99 + 1
      )}`;
      const qr = `GLOW-${event.id}-${Date.now().toString(36).toUpperCase()}`;
      const { data, error } = await supabase
        .from("tickets")
        .insert({
          user_id: user.id,
          event_id: event.id,
          event_title: event.title,
          event_date: event.date,
          event_time: event.time,
          event_venue: event.venue,
          event_city: event.city,
          event_image: event.image,
          event_category: event.category,
          seat,
          section,
          quantity,
          total_price: totalPrice,
          qr_code: qr,
          status: "active",
        })
        .select()
        .single();
      if (error) throw error;
      await load();
      return data as DbTicket;
    },
    [user, load]
  );

  return { tickets, loading, purchase, reload: load };
};
