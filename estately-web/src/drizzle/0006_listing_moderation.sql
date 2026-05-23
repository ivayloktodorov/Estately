ALTER TABLE "properties" ADD COLUMN IF NOT EXISTS "moderation_status" varchar(50) DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN IF NOT EXISTS "moderation_notes" text;--> statement-breakpoint
UPDATE "properties"
SET "moderation_status" = CASE
  WHEN "is_published" = true THEN 'approved'
  ELSE 'pending'
END
WHERE "moderation_status" = 'pending';--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "properties_moderation_status_idx" ON "properties" ("moderation_status");
