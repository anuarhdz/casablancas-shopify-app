import { createId } from "@paralleldrive/cuid2"
import { relations } from "drizzle-orm"
import {
  boolean,
  index,
  integer,
  numeric,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core"

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  role: text("role"),
  banned: boolean("banned").default(false),
  banReason: text("ban_reason"),
  banExpires: timestamp("ban_expires"),
})

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    impersonatedBy: text("impersonated_by"),
  },
  (table) => [index("session_userId_idx").on(table.userId)]
)

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("account_userId_idx").on(table.userId)]
)

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)]
)

export const shopifyStore = pgTable("shopify_store", {
  id: serial("id").primaryKey(),
  shopDomain: varchar("shop_domain", { length: 255 }).notNull().unique(),
  accessToken: text("access_token").notNull(),
  scope: text("scope"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

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

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
}))

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}))

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
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
  url: text("url"),
})

export type InsertProduct = typeof product.$inferInsert
export type SelectProduct = typeof product.$inferSelect
export type InsertProductVariant = typeof productVariant.$inferInsert
export type SelectProductVariant = typeof productVariant.$inferSelect
export type InsertProductMedia = typeof productMedia.$inferInsert
export type SelectProductMedia = typeof productMedia.$inferSelect
export type InsertBulkOperation = typeof bulkOperation.$inferInsert
export type SelectBulkOperation = typeof bulkOperation.$inferSelect
export type InsertShopifyStore = typeof shopifyStore.$inferInsert
export type SelectShopifyStore = typeof shopifyStore.$inferSelect
