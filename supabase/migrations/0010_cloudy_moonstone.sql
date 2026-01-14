CREATE TABLE "shopify_session" (
	"shop" text PRIMARY KEY NOT NULL,
	"access_token" text NOT NULL,
	"scope" text NOT NULL,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
