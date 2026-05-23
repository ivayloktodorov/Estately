CREATE TABLE IF NOT EXISTS "message_attachments" (
  "id" serial PRIMARY KEY NOT NULL,
  "message_id" integer NOT NULL,
  "file_url" text NOT NULL,
  "file_name" text NOT NULL,
  "file_type" text NOT NULL,
  "file_size" integer NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "message_attachments" ADD CONSTRAINT "message_attachments_message_id_messages_id_fk" FOREIGN KEY ("message_id") REFERENCES "public"."messages"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "message_attachments_message_id_idx" ON "message_attachments" ("message_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "message_attachments_created_at_idx" ON "message_attachments" ("created_at");
