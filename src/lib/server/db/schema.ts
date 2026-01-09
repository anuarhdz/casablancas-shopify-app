import { createId } from "@paralleldrive/cuid2"
import { relations } from "drizzle-orm"
import { integer, numeric, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core"

export const product = pgTable("product", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  descriptionHtml: text("description_html"),
  handle: text("handle").notNull().unique(),
  status: text("status").notNull(),
  vendor: text("vendor"),
  productType: text("product_type"),
  createdAt: timestamp("created_at", { withTimezone: true }),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  tags: text("tags").array(),
  featuredImageUrl: text("featured_image_url"),
  featuredImageAlt: text("featured_image_alt"),
})

export const productRelations = relations(product, ({ many }) => ({
  variants: many(productVariant),
  media: many(productMedia),
}))

export const productVariant = pgTable("product_variant", {
  id: text("id").primaryKey(),
  productId: text("product_id")
    .notNull()
    .references(() => product.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  sku: text("sku"),
  inventoryPolicy: text("inventory_policy"),
  inventoryQuantity: integer("inventory_quantity").default(0),
})

export const productVariantRelations = relations(productVariant, ({ one }) => ({
  product: one(product, {
    fields: [productVariant.productId],
    references: [product.id],
  }),
}))

export const productMedia = pgTable("product_media", {
  id: text("id").primaryKey(),
  productId: text("product_id")
    .notNull()
    .references(() => product.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  altText: text("alt_text"),
  position: integer("position").default(0),
})

export const productMediaRelations = relations(productMedia, ({ one }) => ({
  product: one(product, {
    fields: [productMedia.productId],
    references: [product.id],
  }),
}))

export const statusEnum = pgEnum("status", [
  "CREATED",
  "RUNNING",
  "COMPLETED",
  "FAILED",
  "CANCELED",
  "EXPIRED",
  "CANCELING",
])

export const bulkOperation = pgTable("bulk_operation", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  shopifyId: text("shopify_id").notNull(),
  status: text("status").notNull(),
  url: text("url").notNull(),
})

export type InsertProduct = typeof product.$inferInsert
export type SelectProduct = typeof product.$inferSelect
export type InsertProductVariant = typeof productVariant.$inferInsert
export type SelectProductVariant = typeof productVariant.$inferSelect
export type InsertProductMedia = typeof productMedia.$inferInsert
export type SelectProductMedia = typeof productMedia.$inferSelect
export type InsertBulkOperation = typeof bulkOperation.$inferInsert
export type SelectBulkOperation = typeof bulkOperation.$inferSelect
