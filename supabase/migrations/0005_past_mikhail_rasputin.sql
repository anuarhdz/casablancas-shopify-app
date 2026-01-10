CREATE TABLE "shopify_store" (
	"id" serial PRIMARY KEY NOT NULL,
	"shop_domain" varchar(255) NOT NULL,
	"access_token" text NOT NULL,
	"scope" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "shopify_store_shop_domain_unique" UNIQUE("shop_domain")
);
