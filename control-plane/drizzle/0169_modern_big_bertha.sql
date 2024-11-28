CREATE TABLE IF NOT EXISTS "analytics_snapshots" (
	"data" json NOT NULL,
	"timestamp" timestamp with time zone NOT NULL,
	CONSTRAINT "analytics_snapshots_pkey" PRIMARY KEY("timestamp")
);
