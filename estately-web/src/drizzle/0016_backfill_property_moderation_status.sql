UPDATE "properties"
SET "moderation_status" = 'approved'
WHERE "moderation_status" IS NULL
AND "is_published" = true;--> statement-breakpoint
