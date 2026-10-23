CREATE TABLE IF NOT EXISTS jobs (
 id TEXT PRIMARY KEY, source TEXT NOT NULL, state TEXT NOT NULL DEFAULT 'queued'
 CHECK(state IN ('queued','processing','held','published','withdrawn')),
 payload TEXT NOT NULL, created_at INTEGER NOT NULL, attempts INTEGER NOT NULL DEFAULT 0,
 lease_until INTEGER NOT NULL DEFAULT 0, lease_token TEXT NOT NULL DEFAULT '',
 document_id TEXT, candidate_hash TEXT, last_error TEXT
);
CREATE INDEX IF NOT EXISTS jobs_claim ON jobs(state,lease_until,created_at);
CREATE TABLE IF NOT EXISTS sources (
 id TEXT PRIMARY KEY, url TEXT NOT NULL, resolved_url TEXT,
 automation_enabled INTEGER NOT NULL DEFAULT 0,
 rights_status TEXT NOT NULL DEFAULT 'terms_review_pending', allowed_reuse TEXT NOT NULL DEFAULT 'none_granted',
 proposed_poll_minutes INTEGER NOT NULL DEFAULT 15, next_poll INTEGER NOT NULL DEFAULT 0,
 etag TEXT,last_modified TEXT,last_success INTEGER,last_error TEXT,lease_token TEXT NOT NULL DEFAULT ''
);
CREATE INDEX IF NOT EXISTS sources_due ON sources(automation_enabled,next_poll);
CREATE TABLE IF NOT EXISTS publisher_lock (id INTEGER PRIMARY KEY,owner TEXT NOT NULL DEFAULT '',until INTEGER NOT NULL DEFAULT 0);
INSERT OR IGNORE INTO publisher_lock(id) VALUES(1);
CREATE TABLE IF NOT EXISTS audit(id INTEGER PRIMARY KEY,job TEXT,event TEXT NOT NULL,time INTEGER NOT NULL);
CREATE INDEX IF NOT EXISTS audit_time ON audit(time);
