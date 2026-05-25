UPDATE "properties"
SET "moderation_status" = 'approved'
WHERE "moderation_status" IS NULL;--> statement-breakpoint
