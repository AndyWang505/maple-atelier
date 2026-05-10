-- DELETE 'down' first — dropping `vote` column would otherwise silently promote them to likes.
DELETE FROM votes WHERE vote = 'down';
--> statement-breakpoint
ALTER TABLE votes DROP COLUMN vote;
--> statement-breakpoint
ALTER TABLE outfits DROP COLUMN downvotes;
--> statement-breakpoint
ALTER TABLE outfits ADD COLUMN description TEXT;
