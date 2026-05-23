CREATE TABLE IF NOT EXISTS "saved_searches" (
  "id" serial PRIMARY KEY NOT NULL,
  "user_id" integer NOT NULL,
  "title" varchar(255) NOT NULL,
  "city" varchar(255),
  "property_type" varchar(50),
  "listing_type" varchar(50),
  "min_price" integer,
  "max_price" integer,
  "bedrooms" integer,
  "bathrooms" integer,
  "created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "saved_searches" ADD CONSTRAINT "saved_searches_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "saved_searches_user_id_idx" ON "saved_searches" ("user_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "saved_searches_city_idx" ON "saved_searches" ("city");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "saved_searches_property_type_idx" ON "saved_searches" ("property_type");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "saved_searches_listing_type_idx" ON "saved_searches" ("listing_type");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "saved_searches_created_at_idx" ON "saved_searches" ("created_at");
