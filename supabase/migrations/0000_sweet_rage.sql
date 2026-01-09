CREATE TABLE "product" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description_html" text,
	"handle" text NOT NULL,
	"status" text NOT NULL,
	"vendor" text,
	"product_type" text,
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone,
	"published_at" timestamp with time zone,
	"tags" text[],
	"featured_image_url" text,
	"featured_image_alt" text,
	CONSTRAINT "product_handle_unique" UNIQUE("handle")
);
--> statement-breakpoint
CREATE TABLE "product_media" (
	"id" text PRIMARY KEY NOT NULL,
	"product_id" text NOT NULL,
	"url" text NOT NULL,
	"alt_text" text,
	"position" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "product_variant" (
	"id" text PRIMARY KEY NOT NULL,
	"product_id" text NOT NULL,
	"title" text NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"sku" text,
	"inventory_policy" text,
	"inventory_quantity" integer DEFAULT 0
);
--> statement-breakpoint
ALTER TABLE "product_media" ADD CONSTRAINT "product_media_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_variant" ADD CONSTRAINT "product_variant_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE cascade ON UPDATE no action;