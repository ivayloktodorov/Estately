ALTER TABLE "property_images" ADD COLUMN IF NOT EXISTS "is_cover" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "property_images" ADD COLUMN IF NOT EXISTS "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
INSERT INTO "property_images" ("property_id", "image_url", "sort_order", "is_cover", "created_at")
SELECT "id", "image_cover_url", 0, true, now()
FROM "properties"
WHERE "image_cover_url" IS NOT NULL
  AND trim("image_cover_url") <> ''
  AND lower(trim("image_cover_url")) NOT IN ('null', 'undefined', '/images/property-placeholder.jpg')
  AND NOT EXISTS (
    SELECT 1 FROM "property_images" WHERE "property_images"."property_id" = "properties"."id"
  );--> statement-breakpoint
UPDATE "property_images"
SET "is_cover" = true
WHERE "id" IN (
  SELECT DISTINCT ON ("property_id") "id"
  FROM "property_images"
  WHERE "is_cover" = false
  ORDER BY "property_id", "sort_order", "id"
)
AND NOT EXISTS (
  SELECT 1
  FROM "property_images" cover_images
  WHERE cover_images."property_id" = "property_images"."property_id"
    AND cover_images."is_cover" = true
);--> statement-breakpoint
UPDATE "properties"
SET "image_cover_url" = cover_images."image_url",
    "updated_at" = now()
FROM (
  SELECT DISTINCT ON ("property_id") "property_id", "image_url"
  FROM "property_images"
  WHERE "is_cover" = true
  ORDER BY "property_id", "sort_order", "id"
) cover_images
WHERE "properties"."id" = cover_images."property_id";--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "property_images_property_id_idx" ON "property_images" ("property_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "property_images_property_sort_idx" ON "property_images" ("property_id", "sort_order");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "property_images_property_cover_idx" ON "property_images" ("property_id", "is_cover");
