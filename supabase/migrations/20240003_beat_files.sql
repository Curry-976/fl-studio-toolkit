-- ══════════════════════════════════════════════════════════════
--  Migration: ajout des 3 fichiers par beat
--  (tagged demo · untagged clean · stems ZIP)
-- ══════════════════════════════════════════════════════════════

-- 1. Nouvelles colonnes sur la table beats
ALTER TABLE public.beats
  ADD COLUMN IF NOT EXISTS untagged_url   TEXT,   -- fichier propre (lease/trackout/exclu)
  ADD COLUMN IF NOT EXISTS untagged_path  TEXT,   -- chemin storage privé
  ADD COLUMN IF NOT EXISTS stems_url      TEXT,   -- ZIP stems (trackout/exclu)
  ADD COLUMN IF NOT EXISTS stems_path     TEXT,   -- chemin storage privé
  ADD COLUMN IF NOT EXISTS has_stems      BOOLEAN NOT NULL DEFAULT false;

-- 2. Index utile pour filtrer les beats avec stems
CREATE INDEX IF NOT EXISTS beats_has_stems_idx ON public.beats(has_stems);

-- ══════════════════════════════════════════════════════════════
--  3. Buckets Supabase Storage
--  (à coller dans le SQL Editor du dashboard Supabase)
--
--  beats-audio     → PUBLIC  → fichiers de démonstration taggués (streaming)
--  beats-untagged  → PRIVATE → fichiers propres livrés aux acheteurs
--  beats-stems     → PRIVATE → ZIP stems livrés aux acheteurs trackout/exclu
-- ══════════════════════════════════════════════════════════════

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  VALUES
    ('beats-untagged', 'beats-untagged', false, 209715200,  -- 200 MB
      ARRAY['audio/mpeg','audio/wav','audio/x-wav','audio/flac','audio/aiff'])
  ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  VALUES
    ('beats-stems', 'beats-stems', false, 524288000,  -- 500 MB
      ARRAY['application/zip','application/x-zip-compressed','application/octet-stream'])
  ON CONFLICT (id) DO NOTHING;

-- ══════════════════════════════════════════════════════════════
--  4. Policies Storage pour les buckets privés
-- ══════════════════════════════════════════════════════════════

-- beats-untagged : le producteur peut upload ses propres fichiers
CREATE POLICY "Producer uploads untagged"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'beats-untagged'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- beats-untagged : lecture via Edge Function (service role key bypass RLS)
-- Les visiteurs ne peuvent PAS accéder directement — uniquement via signed URL générée côté serveur

-- beats-stems : idem
CREATE POLICY "Producer uploads stems"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'beats-stems'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- ══════════════════════════════════════════════════════════════
--  5. Mise à jour de la fonction deliver_beat_files
--     Retourne le bon fichier selon la licence achetée
-- ══════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.get_beat_download_path(
  p_beat_id   UUID,
  p_license   TEXT  -- 'lease' | 'trackout' | 'exclu'
)
RETURNS TABLE (bucket TEXT, path TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    CASE
      WHEN p_license IN ('trackout','exclu') AND b.stems_path IS NOT NULL
        THEN 'beats-stems'
      ELSE 'beats-untagged'
    END,
    CASE
      WHEN p_license IN ('trackout','exclu') AND b.stems_path IS NOT NULL
        THEN b.stems_path
      ELSE b.untagged_path
    END
  FROM public.beats b
  WHERE b.id = p_beat_id
    AND b.is_active = true;
END;
$$;
