CREATE INDEX IF NOT EXISTS "users_role_idx" ON "users" ("role");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "users_created_at_idx" ON "users" ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "users_full_name_idx" ON "users" ("full_name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "properties_created_by_user_id_idx" ON "properties" ("created_by_user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "properties_created_at_idx" ON "properties" ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "properties_area_sqm_idx" ON "properties" ("area_sqm");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "favorites_property_id_idx" ON "favorites" ("property_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "favorites_created_at_idx" ON "favorites" ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "property_messages_property_id_idx" ON "property_messages" ("property_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "property_messages_user_id_idx" ON "property_messages" ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "property_messages_created_at_idx" ON "property_messages" ("created_at");
