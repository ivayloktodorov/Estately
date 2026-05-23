ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "first_name" varchar(100);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "last_name" varchar(100);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "display_name" varchar(255);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "bio" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "status" varchar(50) DEFAULT 'active' NOT NULL;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "users_status_idx" ON "users" ("status");--> statement-breakpoint
UPDATE "users"
SET
  "first_name" = COALESCE(NULLIF(split_part("full_name", ' ', 1), ''), "full_name"),
  "last_name" = NULLIF(trim(substr("full_name", length(split_part("full_name", ' ', 1)) + 1)), '')
WHERE "first_name" IS NULL AND "last_name" IS NULL;
