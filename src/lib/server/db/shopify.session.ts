import { db } from "$lib/server/db"
import { shopifySession } from "$lib/server/db/schema"
import { Session } from "@shopify/shopify-api"
import { eq } from "drizzle-orm"

export type PersistedShopifySession = {
  shop: string
  accessToken: string
  scope: string
  expiresAt?: Date | null
}

export const saveSession = async (session: PersistedShopifySession) => {
  console.log("on save")
  if (!session.accessToken || !session.scope) {
    throw new Error("Invalid Shopify session")
  }
  console.log("still on save")

  await db
    .insert(shopifySession)
    .values({
      shop: session.shop,
      accessToken: session.accessToken,
      scope: session.scope,
      expiresAt: session.expiresAt ?? null,
    })
    .onConflictDoUpdate({
      target: shopifySession.shop,
      set: {
        accessToken: session.accessToken,
        scope: session.scope,
        updatedAt: new Date(),
      },
    })
}

export const loadSession = async (shop?: string) => {
  const query = db.select().from(shopifySession)

  if (shop) {
    query.where(eq(shopifySession.shop, shop))
  }

  const [row] = await query.limit(1)

  if (!row) {
    return null
  }

  return createOfflineSession({
    shop: row.shop,
    accessToken: row.accessToken,
    scope: row.scope,
  })
}

export const deleteSession = async () => {
  await db.delete(shopifySession)
}

export const createOfflineSession = (params: {
  shop: string
  accessToken: string
  scope: string
}) => {
  const session = new Session({
    id: `offline_${params.shop}`,
    shop: params.shop,
    state: "offline",
    isOnline: false,
  })

  session.accessToken = params.accessToken
  session.scope = params.scope

  return session
}
