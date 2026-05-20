-- Ajout des colonnes Stripe Connect sur la table producers
ALTER TABLE producers
  ADD COLUMN IF NOT EXISTS stripe_verified BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS email TEXT;

-- Index pour retrouver rapidement un producteur par stripe_account
CREATE INDEX IF NOT EXISTS idx_producers_stripe_account ON producers(stripe_account);

-- Vue "gains par producteur" (optionnel, pratique pour le dashboard)
CREATE OR REPLACE VIEW producer_earnings AS
SELECT
  p.id AS producer_id,
  p.username,
  p.stripe_account,
  p.stripe_verified,
  COUNT(pu.id)                          AS total_sales,
  COALESCE(SUM(pu.amount_cents), 0)     AS total_gross_cents,
  COALESCE(SUM(ROUND(pu.amount_cents * 0.85)), 0) AS total_net_cents
FROM producers p
LEFT JOIN purchases pu
  ON pu.producer_id = p.id
  AND pu.status = 'completed'
GROUP BY p.id, p.username, p.stripe_account, p.stripe_verified;
