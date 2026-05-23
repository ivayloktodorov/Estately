CREATE TABLE IF NOT EXISTS "user_activity" (
  "id" serial PRIMARY KEY NOT NULL,
  "user_id" integer NOT NULL,
  "type" varchar(50) NOT NULL,
  "title" varchar(255) NOT NULL,
  "description" text NOT NULL,
  "entity_type" varchar(50),
  "entity_id" integer,
  "created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_activity" ADD CONSTRAINT "user_activity_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_activity_user_id_idx" ON "user_activity" ("user_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_activity_user_created_at_idx" ON "user_activity" ("user_id","created_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_activity_type_idx" ON "user_activity" ("type");
