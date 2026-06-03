import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const useFavorites = () => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<string[]>([]);

  const load = useCallback(async () => {
    if (!user) {
      setFavorites([]);
      return;
    }
    const { data } = await supabase
      .from("favorites")
      .select("event_id")
      .eq("user_id", user.id);
    setFavorites((data ?? []).map((r: any) => r.event_id));
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const toggleFavorite = useCallback(
    async (id: string) => {
      if (!user) return;
      const isFav = favorites.includes(id);
      // optimistic
      setFavorites((prev) =>
        isFav ? prev.filter((x) => x !== id) : [...prev, id]
      );
      if (isFav) {
        await supabase
          .from("favorites")
          .delete()
          .eq("user_id", user.id)
          .eq("event_id", id);
      } else {
        await supabase
          .from("favorites")
          .insert({ user_id: user.id, event_id: id });
      }
    },
    [favorites, user]
  );

  const isFavorite = useCallback(
    (id: string) => favorites.includes(id),
    [favorites]
  );

  return { favorites, toggleFavorite, isFavorite };
};
