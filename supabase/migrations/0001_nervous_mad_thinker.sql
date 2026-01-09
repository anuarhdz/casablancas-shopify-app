CREATE TYPE "public"."status" AS ENUM('CREATED', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELED');--> statement-breakpoint
CREATE TABLE "bulk_operation" (
	"id" text PRIMARY KEY NOT NULL,
	"shopify_id" text NOT NULL,
	"status" "status" NOT NULL,
	"url" text NOT NULL
);
