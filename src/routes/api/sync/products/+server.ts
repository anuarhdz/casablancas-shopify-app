import { withSystemContext } from "$lib/server/db"
import { db } from "$lib/server/db"
import { bulkOperation as bulkOperationTable } from "$lib/server/db/schema"
import { fetchBulkProducts, withShopify } from "$lib/shopify"
import { error, json } from "@sveltejs/kit"
import type { RequestHandler } from "./$types"

export const POST: RequestHandler = async () => {
  let result

  try {
    result = await withShopify((client) => fetchBulkProducts(client))
  } catch (err: any) {
    if (err.message === "REAUTH_REQUIRED") {
      throw error(401, "Shopify reauth required")
    }

    throw err
  }

  if (!result.success) {
    throw error(500, result.error?.message ?? "Error de Shopify")
  }

  const { bulkOperationRunQuery } = result.data

  if (!bulkOperationRunQuery) {
    throw error(500, "No se recibió respuesta de la operación")
  }

  const { bulkOperation, userErrors } = bulkOperationRunQuery

  if (userErrors?.length > 0) {
    const messages = userErrors.map((e) => e.message).join(", ")
    throw error(400, messages)
  }

  if (!bulkOperation) {
    throw error(500, "No se pudo crear la operación bulk")
  }

  try {
    // Use system context for Shopify sync operations
    await withSystemContext(() =>
      db.insert(bulkOperationTable).values({
        shopifyId: bulkOperation.id,
        status: bulkOperation.status,
        url: bulkOperation.url,
      })
    )
  } catch (dbError) {
    const message = dbError instanceof Error ? dbError.message : "Error desconocido"
    throw error(500, `Error al guardar en DB: ${message}`)
  }

  return json(bulkOperation)
}
