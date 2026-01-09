import { db } from "$lib/server/db"
import { bulkOperation as bulkOperationTable } from "$lib/server/db/schema"
import { getBulkProducts } from "$lib/shopify"
import { error } from "@sveltejs/kit"
import type { RequestHandler } from "./$types"

export const POST: RequestHandler = async () => {
  const { data } = await getBulkProducts()

  if (!data || !data.bulkOperationRunQuery) {
    return error(400, "An error has occurred")
  }

  const { bulkOperation, userErrors } = data.bulkOperationRunQuery

  if (userErrors?.length) {
    console.error("Bulk operation errors", userErrors)
    return new Response(JSON.stringify({ errors: userErrors }), { status: 400 })
  }

  if (bulkOperation) {
    await db.insert(bulkOperationTable).values({
      shopifyId: bulkOperation.id,
      status: bulkOperation.status,
      url: bulkOperation.url,
    })
  }

  return new Response(JSON.stringify({ bulkOperation }), { status: 200 })
}
