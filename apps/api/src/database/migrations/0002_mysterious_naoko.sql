CREATE INDEX IF NOT EXISTS "product_aliases_product_idx" ON "product_aliases" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "store_locations_supermarket_idx" ON "store_locations" USING btree ("supermarket_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "scan_history_user_idx" ON "scan_history" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "shopping_list_items_list_idx" ON "shopping_list_items" USING btree ("shopping_list_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "shopping_lists_user_idx" ON "shopping_lists" USING btree ("user_id");--> statement-breakpoint
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_user_product_unique" UNIQUE("user_id","product_id");