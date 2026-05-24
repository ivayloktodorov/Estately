CREATE TABLE IF NOT EXISTS "property_offers" (
  "id" serial PRIMARY KEY NOT NULL,
  "property_id" integer NOT NULL,
  "buyer_user_id" integer NOT NULL,
  "owner_user_id" integer NOT NULL,
  "amount" numeric(12, 2) NOT NULL,
  "message" text,
  "status" varchar(50) DEFAULT 'pending' NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);--> statement-breakpoint
ALTER TABLE "property_offers" ADD COLUMN IF NOT EXISTS "property_id" integer;--> statement-breakpoint
ALTER TABLE "property_offers" ADD COLUMN IF NOT EXISTS "buyer_user_id" integer;--> statement-breakpoint
ALTER TABLE "property_offers" ADD COLUMN IF NOT EXISTS "owner_user_id" integer;--> statement-breakpoint
ALTER TABLE "property_offers" ADD COLUMN IF NOT EXISTS "amount" numeric(12, 2);--> statement-breakpoint
ALTER TABLE "property_offers" ADD COLUMN IF NOT EXISTS "message" text;--> statement-breakpoint
ALTER TABLE "property_offers" ADD COLUMN IF NOT EXISTS "status" varchar(50) DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE "property_offers" ADD COLUMN IF NOT EXISTS "created_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "property_offers" ADD COLUMN IF NOT EXISTS "updated_at" timestamp DEFAULT now();--> statement-breakpoint
UPDATE "property_offers" SET "status" = 'pending' WHERE "status" IS NULL;--> statement-breakpoint
UPDATE "property_offers" SET "created_at" = now() WHERE "created_at" IS NULL;--> statement-breakpoint
UPDATE "property_offers" SET "updated_at" = now() WHERE "updated_at" IS NULL;--> statement-breakpoint
ALTER TABLE "property_offers" ALTER COLUMN "property_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "property_offers" ALTER COLUMN "buyer_user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "property_offers" ALTER COLUMN "owner_user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "property_offers" ALTER COLUMN "amount" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "property_offers" ALTER COLUMN "status" SET DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE "property_offers" ALTER COLUMN "status" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "property_offers" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "property_offers" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "property_offers" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "property_offers" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "property_offers" ADD CONSTRAINT "property_offers_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "property_offers" ADD CONSTRAINT "property_offers_buyer_user_id_users_id_fk" FOREIGN KEY ("buyer_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "property_offers" ADD CONSTRAINT "property_offers_owner_user_id_users_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "property_offers_property_id_idx" ON "property_offers" ("property_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "property_offers_buyer_user_id_idx" ON "property_offers" ("buyer_user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "property_offers_owner_user_id_idx" ON "property_offers" ("owner_user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "property_offers_status_idx" ON "property_offers" ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "property_offers_created_at_idx" ON "property_offers" ("created_at");
