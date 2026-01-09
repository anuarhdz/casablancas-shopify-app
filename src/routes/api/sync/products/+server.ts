import { db } from "$lib/server/db"
import { bulkOperation as bulkOperationTable } from "$lib/server/db/schema"
import { getBulkProducts } from "$lib/shopify"
import { error, json } from "@sveltejs/kit"
import type { RequestHandler } from "./$types"

export const POST: RequestHandler = async () => {
  const { data } = await getBulkProducts()

  if (!data || !data.bulkOperationRunQuery) {
    return error(400, "An error has occurred")
  }

  const { bulkOperation, userErrors } = data.bulkOperationRunQuery

  if (userErrors?.length) {
    console.error("Bulk operation errors:", userErrors)
    return error(400, userErrors[0].message)
  }

  if (bulkOperation) {
    try {
      await db.insert(bulkOperationTable).values({
        shopifyId: bulkOperation.id,
        status: bulkOperation.status,
        url: bulkOperation.url,
      })
    } catch (err) {
      console.error("Failed to save bulk operation:", err)
      return error(500, "Failed to save bulk operation to database")
    }
  }

  return json({ status: 200, bulkOperation })
}
