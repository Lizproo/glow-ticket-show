
-- EVENTS
CREATE TABLE public.events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  event_date DATE NOT NULL,
  event_time TEXT NOT NULL,
  venue TEXT NOT NULL,
  city TEXT NOT NULL,
  image TEXT,
  gallery JSONB NOT NULL DEFAULT '[]'::jsonb,
  organizer TEXT,
  status TEXT NOT NULL DEFAULT 'activo',
  capacity INTEGER,
  venue_type TEXT NOT NULL DEFAULT 'auditorio',
  policies TEXT,
  base_price NUMERIC NOT NULL DEFAULT 0,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.events TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.events TO authenticated;
GRANT ALL ON public.events TO service_role;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active events" ON public.events FOR SELECT TO anon, authenticated USING (deleted_at IS NULL AND status <> 'cancelado');
CREATE POLICY "Admins view all events" ON public.events FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage events" ON public.events FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Organizers manage own events" ON public.events FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'organizer') AND created_by = auth.uid()) WITH CHECK (public.has_role(auth.uid(), 'organizer') AND created_by = auth.uid());
CREATE TRIGGER trg_events_updated BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- VENUE_SECTIONS
CREATE TABLE public.venue_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#b92c2c',
  price NUMERIC NOT NULL DEFAULT 0,
  capacity INTEGER NOT NULL DEFAULT 0,
  section_type TEXT NOT NULL DEFAULT 'general',
  geometry JSONB NOT NULL DEFAULT '{}'::jsonb,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.venue_sections TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.venue_sections TO authenticated;
GRANT ALL ON public.venue_sections TO service_role;
ALTER TABLE public.venue_sections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view sections" ON public.venue_sections FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins manage sections" ON public.venue_sections FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Organizers manage sections of own events" ON public.venue_sections FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.events e WHERE e.id = event_id AND e.created_by = auth.uid() AND public.has_role(auth.uid(),'organizer'))) WITH CHECK (EXISTS (SELECT 1 FROM public.events e WHERE e.id = event_id AND e.created_by = auth.uid() AND public.has_role(auth.uid(),'organizer')));
CREATE INDEX idx_sections_event ON public.venue_sections(event_id);
CREATE TRIGGER trg_sections_updated BEFORE UPDATE ON public.venue_sections FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- SEATS
CREATE TABLE public.seats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID NOT NULL REFERENCES public.venue_sections(id) ON DELETE CASCADE,
  event_id TEXT NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  row_label TEXT NOT NULL,
  seat_number TEXT NOT NULL,
  x NUMERIC NOT NULL DEFAULT 0,
  y NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'available',
  held_by UUID,
  held_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(section_id, row_label, seat_number)
);
GRANT SELECT ON public.seats TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.seats TO authenticated;
GRANT ALL ON public.seats TO service_role;
ALTER TABLE public.seats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view seats" ON public.seats FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins manage seats" ON public.seats FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Organizers manage seats of own events" ON public.seats FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.events e WHERE e.id = event_id AND e.created_by = auth.uid() AND public.has_role(auth.uid(),'organizer'))) WITH CHECK (EXISTS (SELECT 1 FROM public.events e WHERE e.id = event_id AND e.created_by = auth.uid() AND public.has_role(auth.uid(),'organizer')));
CREATE POLICY "Users can hold seats" ON public.seats FOR UPDATE TO authenticated USING (status = 'available' OR held_by = auth.uid()) WITH CHECK (held_by = auth.uid() OR held_by IS NULL);
CREATE INDEX idx_seats_event ON public.seats(event_id);
CREATE INDEX idx_seats_section ON public.seats(section_id);
CREATE TRIGGER trg_seats_updated BEFORE UPDATE ON public.seats FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ORDERS
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id TEXT NOT NULL REFERENCES public.events(id) ON DELETE RESTRICT,
  total NUMERIC NOT NULL DEFAULT 0,
  payment_method TEXT,
  status TEXT NOT NULL DEFAULT 'completed',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own orders" ON public.orders FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users create own orders" ON public.orders FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins view all orders" ON public.orders FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE INDEX idx_orders_user ON public.orders(user_id);
CREATE INDEX idx_orders_event ON public.orders(event_id);
CREATE TRIGGER trg_orders_updated BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- TICKETS extension
ALTER TABLE public.tickets
  ADD COLUMN IF NOT EXISTS order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS seat_id UUID REFERENCES public.seats(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS section_id UUID REFERENCES public.venue_sections(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS price_paid NUMERIC;

-- PROFILES extension
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS birth_date DATE;

-- Realtime
ALTER TABLE public.events REPLICA IDENTITY FULL;
ALTER TABLE public.venue_sections REPLICA IDENTITY FULL;
ALTER TABLE public.seats REPLICA IDENTITY FULL;
ALTER TABLE public.tickets REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.venue_sections;
ALTER PUBLICATION supabase_realtime ADD TABLE public.seats;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tickets;
