-- Update site settings palette to support expanded brand colors
ALTER TABLE "site_settings"
  ADD COLUMN IF NOT EXISTS "neutralDarkColor" TEXT NOT NULL DEFAULT '#1F1F1F',
  ADD COLUMN IF NOT EXISTS "neutralLightColor" TEXT NOT NULL DEFAULT '#EEEEEE',
  ADD COLUMN IF NOT EXISTS "surfaceColor" TEXT NOT NULL DEFAULT '#FFFFFF';
