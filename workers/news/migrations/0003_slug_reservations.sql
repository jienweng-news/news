-- Reservations persist across failed/ambiguous CMS writes and withdrawals.
-- Never release one merely because a network call failed or a job was held.
CREATE TABLE IF NOT EXISTS slug_reservations (
 locale TEXT NOT NULL,
 slug TEXT NOT NULL,
 job TEXT NOT NULL,
 PRIMARY KEY(locale,slug)
);
CREATE INDEX IF NOT EXISTS slug_job ON slug_reservations(job);
