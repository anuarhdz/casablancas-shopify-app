import { SHOPIFY_STORE_DOMAIN } from "$env/static/private"
import { db } from "$lib/server/db"
import { shopifyStore } from "$lib/server/db/schema"
import { eq } from "drizzle-orm"

export async function getShopifyCredentials() {
  const shopDomainEnv = SHOPIFY_STORE_DOMAIN
  if (!shopDomainEnv) {
    throw new Error("SHOPIFY_SHOP_DOMAIN not set")
  }

  const [store] = await db
    .select()
    .from(shopifyStore)
    .where(eq(shopifyStore.shopDomain, shopDomainEnv))
    .limit(1)

  if (!store) {
    throw new Error(`Shopify store not found in DB. Did you run /shopify/setup?`)
  }

  return {
    shopDomain: store.shopDomain,
    accessToken: store.accessToken,
  }
}
