-- Backfill from outfits.tags JSON. DROP IF EXISTS so a partial first run can be retried cleanly.
DROP TABLE IF EXISTS outfit_tags;
--> statement-breakpoint
CREATE TABLE outfit_tags (
  outfit_id INTEGER NOT NULL REFERENCES outfits(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  PRIMARY KEY (outfit_id, tag)
);
--> statement-breakpoint
CREATE INDEX idx_outfit_tags_tag ON outfit_tags(tag);
--> statement-breakpoint
INSERT INTO outfit_tags (outfit_id, tag)
SELECT outfits.id, json_each.value
FROM outfits, json_each(outfits.tags)
WHERE outfits.tags IS NOT NULL;
