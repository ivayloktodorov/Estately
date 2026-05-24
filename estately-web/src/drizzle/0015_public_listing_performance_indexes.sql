CREATE INDEX IF NOT EXISTS "properties_public_newest_idx"
ON "properties" ("moderation_status", "is_published", "created_at", "id");--> statement-breakpoint

CREATE INDEX IF NOT EXISTS "properties_public_listing_newest_idx"
ON "properties" ("moderation_status", "is_published", "listing_type", "created_at", "id");--> statement-breakpoint

CREATE INDEX IF NOT EXISTS "properties_public_listing_price_idx"
ON "properties" ("moderation_status", "is_published", "listing_type", "price", "created_at");--> statement-breakpoint

CREATE INDEX IF NOT EXISTS "properties_public_listing_area_idx"
ON "properties" ("moderation_status", "is_published", "listing_type", "area_sqm", "created_at");
