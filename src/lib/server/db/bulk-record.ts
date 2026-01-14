// src/lib/shopify/processBulkRecord.ts
import { db, withSystemContext } from "$lib/server/db" // ajusta la ruta a donde tengas tu instancia de drizzle
import { product, productMedia, productVariant } from "$lib/server/db/schema"

type ShopifyProductRecord = {
  __typename: "Product"
  id: string
  title: string
  descriptionHtml?: string | null
  handle: string
  status: string
  vendor?: string | null
  productType?: string | null
  createdAt?: string | null
  updatedAt?: string | null
  publishedAt?: string | null
  tags?: string[] | null
  featuredMedia?: {
    __typename: "MediaImage"
    id: string
    image?: {
      url?: string | null
      altText?: string | null
    } | null
  } | null
}

type ShopifyVariantRecord = {
  __typename: "ProductVariant"
  __parentId: string
  id: string
  title: string
  price: string
  sku?: string | null
  inventoryPolicy?: string | null
  inventoryQuantity?: number | null
}

type ShopifyMediaImageRecord = {
  __typename: "MediaImage"
  __parentId: string
  id: string
  image?: {
    url?: string | null
    altText?: string | null
  } | null
  // si tu bulk incluye position u otros campos, puedes añadirlos aquí
}

let productCount = 0
let variantCount = 0
let mediaCount = 0

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function processBulkRecord(record: any): Promise<void> {
  switch (record.__typename) {
    case "Product":
      productCount++
      if (productCount % 100 === 0) {
        console.log(`📦 Processed ${productCount} products...`)
      }
      await upsertProduct(record as ShopifyProductRecord)
      break

    case "ProductVariant":
      variantCount++
      if (variantCount % 100 === 0) {
        console.log(`📦 Processed ${variantCount} variants...`)
      }
      await upsertVariant(record as ShopifyVariantRecord)
      break

    case "MediaImage":
      mediaCount++
      if (mediaCount % 100 === 0) {
        console.log(`📦 Processed ${mediaCount} media items...`)
      }
      await upsertProductMedia(record as ShopifyMediaImageRecord)
      break

    default:
      // Otros tipos (si los hubiera) los ignoramos de momento
      console.log("⚠️ Unknown record type:", record.__typename)
      break
  }
}

async function upsertProduct(r: ShopifyProductRecord) {
  const {
    id,
    title,
    descriptionHtml,
    handle,
    status,
    vendor,
    productType,
    createdAt,
    updatedAt,
    publishedAt,
    tags,
    featuredMedia,
  } = r

  const featuredUrl = featuredMedia?.image?.url ?? null
  const featuredAlt = featuredMedia?.image?.altText ?? null

  const values = {
    id,
    title,
    descriptionHtml: descriptionHtml ?? null,
    handle,
    status,
    vendor: vendor ?? null,
    productType: productType ?? null,
    createdAt: createdAt ? new Date(createdAt) : null,
    updatedAt: updatedAt ? new Date(updatedAt) : null,
    publishedAt: publishedAt ? new Date(publishedAt) : null,
    tags: tags ?? [],
    featuredImageUrl: featuredUrl,
    featuredImageAlt: featuredAlt,
  }

  // upsert: insert si no existe, update si ya existe
  // Use system context for Shopify sync operations
  await withSystemContext(() =>
    db
      .insert(product)
      .values(values)
      .onConflictDoUpdate({
        target: product.id,
        set: {
          title: values.title,
          descriptionHtml: values.descriptionHtml,
          handle: values.handle,
          status: values.status,
          vendor: values.vendor,
          productType: values.productType,
          createdAt: values.createdAt,
          updatedAt: values.updatedAt,
          publishedAt: values.publishedAt,
          tags: values.tags,
          featuredImageUrl: values.featuredImageUrl,
          featuredImageAlt: values.featuredImageAlt,
        },
      })
  )
}

async function upsertVariant(r: ShopifyVariantRecord) {
  const { id, __parentId, title, price, sku, inventoryPolicy, inventoryQuantity } = r

  const values = {
    id,
    productId: __parentId,
    title,
    price: price, // Drizzle numeric acepta string
    sku: sku ?? null,
    inventoryPolicy: inventoryPolicy ?? null,
    inventoryQuantity: inventoryQuantity ?? 0,
  }

  // Use system context for Shopify sync operations
  await withSystemContext(() =>
    db
      .insert(productVariant)
      .values(values)
      .onConflictDoUpdate({
        target: productVariant.id,
        set: {
          productId: values.productId,
          title: values.title,
          price: values.price,
          sku: values.sku,
          inventoryPolicy: values.inventoryPolicy,
          inventoryQuantity: values.inventoryQuantity,
        },
      })
  )
}

async function upsertProductMedia(r: ShopifyMediaImageRecord) {
  const { id, __parentId, image } = r

  // Solo nos interesan MediaImage cuyo padre es un Product
  // (si ves que hay otros tipos de parent, puedes filtrarlos por prefix)
  if (!image?.url) {
    // sin URL no tiene sentido guardarlo
    return
  }

  const values = {
    id,
    productId: __parentId,
    url: image.url,
    altText: image.altText ?? null,
    position: 0, // no lo pedimos en la query; puedes ajustar si quieres
  }

  // Use system context for Shopify sync operations
  await withSystemContext(() =>
    db
      .insert(productMedia)
      .values(values)
      .onConflictDoUpdate({
        target: productMedia.id,
        set: {
          productId: values.productId,
          url: values.url,
          altText: values.altText,
          position: values.position,
        },
      })
  )
}
