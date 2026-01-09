import { processBulkRecord } from "$lib/server/db/bulk-record"
import { pollBulkOperationById } from "$lib/shopify"
import { streamJsonlFromUrl } from "$lib/stream-jsonl"
import type { RequestHandler } from "./$types"

export const POST: RequestHandler = async ({ params }) => {
  const { id } = params

  if (!id) {
    return new Response(JSON.stringify({ error: "Missing bulk operation id" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    })
  }

  try {
    console.log("📊 Starting poll for bulk operation:", id)
    const result = await pollBulkOperationById({
      bulkOperationId: id,
      intervalMs: 5000,
      timeoutMs: 10 * 60 * 1000,
    })
    console.log("📊 Poll result:", result)

    if (result.status !== "COMPLETED" || !result.url) {
      return new Response(
        JSON.stringify({
          error: "Bulk operation not completed",
          status: result.status,
          errorCode: result.errorCode,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      )
    }

    // 2. Descargar y procesar JSONL línea por línea
    console.log("📥 Starting to download and process JSONL from:", result.url)
    await streamJsonlFromUrl(result.url, processBulkRecord)
    console.log("✅ Finished processing JSONL")
    console.log("📊 Total objects processed:", result.objectCount)

    return new Response(
      JSON.stringify({
        success: true,
        bulkOperationId: result.id,
        objectCount: result.objectCount,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    )

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Error during bulk import by ID", error)

    return new Response(
      JSON.stringify({
        error: error.message ?? "Unknown error",
        bulkOperationId: id,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    )
  }
}
