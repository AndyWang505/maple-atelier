CREATE TABLE rate_limits (
  key TEXT PRIMARY KEY,
  count INTEGER NOT NULL DEFAULT 0,
  expires_at INTEGER NOT NULL
);
--> statement-breakpoint
CREATE INDEX idx_rate_limits_expires ON rate_limits(expires_at);
