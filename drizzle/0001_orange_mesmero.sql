CREATE INDEX `idx_outfits_user_id` ON `outfits` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_outfits_public_created` ON `outfits` (`is_public`,`created_at`);--> statement-breakpoint
CREATE INDEX `idx_votes_outfit_id` ON `votes` (`outfit_id`);