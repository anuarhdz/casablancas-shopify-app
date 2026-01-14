import { query } from "$app/server"
import { db } from "$lib/server/db"

export const getShopData = query(async () => {
  const result = await db.query.shopifyStore.findFirst()

  return result
})
