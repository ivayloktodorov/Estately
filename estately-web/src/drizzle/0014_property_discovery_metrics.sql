ALTER TABLE "properties" ADD COLUMN IF NOT EXISTS "is_featured" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN IF NOT EXISTS "views" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "properties_is_featured_idx" ON "properties" ("is_featured");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "properties_views_idx" ON "properties" ("views");
