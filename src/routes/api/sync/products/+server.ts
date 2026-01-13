import { db } from "$lib/server/db"
import { bulkOperation as bulkOperationTable } from "$lib/server/db/schema"
import { fetchBulkProducts } from "$lib/shopify"
import { error, json } from "@sveltejs/kit"
import type { RequestHandler } from "./$types"

export const POST: RequestHandler = async () => {
  const result = await fetchBulkProducts()

  if (!result.success) {
    throw error(500, result.error.message ?? "Error de Shopify")
  }

  const { bulkOperationRunQuery } = result.data

  if (!bulkOperationRunQuery) {
    throw error(500, "No se recibió respuesta de la operación")
  }

  const { bulkOperation, userErrors } = bulkOperationRunQuery

  if (userErrors.length > 0) {
    const messages = userErrors.map((e) => e.message).join(", ")
    throw error(400, messages)
  }

  if (!bulkOperation) {
    throw error(500, "No se pudo crear la operación bulk")
  }

  if (bulkOperation) {
    try {
      await db.insert(bulkOperationTable).values({
        shopifyId: bulkOperation.id,
        status: bulkOperation.status,
        url: bulkOperation.url,
      })
    } catch (dbError) {
      const message = dbError instanceof Error ? dbError.message : "Error desconocido"
      throw error(500, `Error al guardar en DB: ${message}`)
    }
  }

  return json(bulkOperation)
}
