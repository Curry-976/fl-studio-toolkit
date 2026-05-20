-- ══════════════════════════════════════════════════════════════
--  FL STUDIO TOOLKIT — Beat Store  ·  Supabase Schema v1.0
--  Colle ce fichier dans : Supabase Dashboard → SQL Editor → Run
-- ══════════════════════════════════════════════════════════════

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── PRODUCERS ─────────────────────────────────────────────────
-- Étend auth.users (créé automatiquement par Supabase Auth)
CREATE TABLE IF NOT EXISTS public.producers (
  id              UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username        TEXT UNIQUE NOT NULL,
  display_name    TEXT,
  bio             TEXT,
  stripe_account  TEXT,        -- Stripe Connect account ID
  total_earnings  INT  DEFAULT 0,  -- centimes
  total_sales     INT  DEFAULT 0,
  avatar_url      TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── BEATS ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.beats (
  id              UUID    DEFAULT uuid_generate_v4() PRIMARY KEY,
  producer_id     UUID    REFERENCES public.producers(id) ON DELETE CASCADE NOT NULL,
  title           TEXT    NOT NULL,
  genre           TEXT    NOT NULL,
  bpm             INT     NOT NULL CHECK (bpm >= 40 AND bpm <= 250),
  key             TEXT    NOT NULL,
  mood            TEXT,
  tags            TEXT[]  DEFAULT '{}',
  price_lease     INT     NOT NULL DEFAULT 2900,    -- centimes (29€)
  price_trackout  INT     NOT NULL DEFAULT 5900,    -- centimes (59€)
  price_exclu     INT     NOT NULL DEFAULT 19900,   -- centimes (199€)
  audio_url       TEXT,          -- URL Supabase Storage
  audio_path      TEXT,          -- chemin interne storage
  duration        INT     DEFAULT 0,  -- secondes
  plays           INT     DEFAULT 0,
  sales           INT     DEFAULT 0,
  is_exclusive    BOOLEAN DEFAULT FALSE,  -- true = vendu exclusif → retiré
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Index de recherche
CREATE INDEX IF NOT EXISTS beats_genre_idx  ON public.beats(genre);
CREATE INDEX IF NOT EXISTS beats_plays_idx  ON public.beats(plays DESC);
CREATE INDEX IF NOT EXISTS beats_active_idx ON public.beats(is_active);

-- ── PURCHASES ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.purchases (
  id                UUID    DEFAULT uuid_generate_v4() PRIMARY KEY,
  beat_id           UUID    REFERENCES public.beats(id) ON DELETE SET NULL,
  producer_id       UUID    REFERENCES public.producers(id),
  buyer_email       TEXT    NOT NULL,
  buyer_name        TEXT,
  license_tier      TEXT    NOT NULL CHECK (license_tier IN ('lease','trackout','exclu')),
  amount_cents      INT     NOT NULL,
  stripe_session_id TEXT    UNIQUE,
  status            TEXT    DEFAULT 'pending' CHECK (status IN ('pending','completed','refunded')),
  license_pdf_url   TEXT,   -- URL PDF généré
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS purchases_beat_idx     ON public.purchases(beat_id);
CREATE INDEX IF NOT EXISTS purchases_producer_idx ON public.purchases(producer_id);
CREATE INDEX IF NOT EXISTS purchases_status_idx   ON public.purchases(status);

-- ── FONCTIONS ─────────────────────────────────────────────────

-- Incrémenter les écoutes (thread-safe)
CREATE OR REPLACE FUNCTION increment_plays(beat_id UUID)
RETURNS void LANGUAGE sql SECURITY DEFINER AS $$
  UPDATE public.beats SET plays = plays + 1 WHERE id = beat_id AND is_active = true;
$$;

-- Créer le profil producteur automatiquement après signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.producers (id, username, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Trigger signup → profil auto
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Mettre à jour les stats producteur après achat
CREATE OR REPLACE FUNCTION update_producer_stats()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.producers
    SET total_earnings = total_earnings + ROUND(NEW.amount_cents * 0.85),
        total_sales    = total_sales + 1
    WHERE id = NEW.producer_id;

    UPDATE public.beats
    SET sales = sales + 1,
        is_exclusive = CASE WHEN NEW.license_tier = 'exclu' THEN true ELSE is_exclusive END,
        is_active    = CASE WHEN NEW.license_tier = 'exclu' THEN false ELSE is_active END
    WHERE id = NEW.beat_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_purchase_completed ON public.purchases;
CREATE TRIGGER on_purchase_completed
  AFTER UPDATE ON public.purchases
  FOR EACH ROW EXECUTE FUNCTION update_producer_stats();

-- ── ROW LEVEL SECURITY ────────────────────────────────────────

ALTER TABLE public.producers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.beats     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;

-- Producers
CREATE POLICY "Lecture publique producers"
  ON public.producers FOR SELECT USING (true);

CREATE POLICY "Producteur crée son profil"
  ON public.producers FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Producteur modifie son profil"
  ON public.producers FOR UPDATE USING (auth.uid() = id);

-- Beats
CREATE POLICY "Lecture publique beats actifs"
  ON public.beats FOR SELECT USING (is_active = true);

CREATE POLICY "Producteur insère ses beats"
  ON public.beats FOR INSERT WITH CHECK (auth.uid() = producer_id);

CREATE POLICY "Producteur modifie ses beats"
  ON public.beats FOR UPDATE USING (auth.uid() = producer_id);

CREATE POLICY "Producteur supprime ses beats"
  ON public.beats FOR DELETE USING (auth.uid() = producer_id);

-- Purchases
CREATE POLICY "Acheteur voit ses achats"
  ON public.purchases FOR SELECT
  USING (auth.uid() = producer_id OR buyer_email = auth.email());

CREATE POLICY "Insertion achat libre"
  ON public.purchases FOR INSERT WITH CHECK (true);

-- ── STORAGE BUCKETS ───────────────────────────────────────────
-- À exécuter séparément dans Dashboard > Storage ou via API

-- INSERT INTO storage.buckets (id, name, public) VALUES ('beats-audio', 'beats-audio', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('beats-covers', 'beats-covers', true);

-- Policy storage (à coller dans Dashboard > Storage > Policies) :
-- Bucket beats-audio : SELECT public / INSERT auth required
-- Bucket beats-covers : SELECT public / INSERT auth required

-- ══════════════════════════════════════════════════════════════
--  DONNÉES DE TEST (optionnel — à supprimer en production)
-- ══════════════════════════════════════════════════════════════
-- Les vrais beats seront uploadés par les producteurs via le formulaire.
-- Les données mock dans beatstore.html s'affichent si Supabase n'est pas configuré.
