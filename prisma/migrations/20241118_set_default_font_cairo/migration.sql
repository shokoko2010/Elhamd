-- Align SiteSettings default font with Cairo and update existing legacy values

ALTER TABLE "SiteSettings"
  ALTER COLUMN "fontFamily" SET DEFAULT 'Cairo';

UPDATE "SiteSettings"
SET "fontFamily" = 'Cairo'
WHERE "fontFamily" IS NULL OR "fontFamily" = 'Inter';
