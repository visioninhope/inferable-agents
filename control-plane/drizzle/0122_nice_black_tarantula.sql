CREATE TABLE IF NOT EXISTS "kv" (
	"key" varchar(1024) NOT NULL,
	"value" text NOT NULL,
	"validUntil" timestamp with time zone,
	CONSTRAINT "kv_key_pk" PRIMARY KEY("key")
);
