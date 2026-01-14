import {
  SHOPIFY_API_KEY,
  SHOPIFY_API_SECRET,
  SHOPIFY_SCOPES,
  SHOPIFY_STORE_DOMAIN,
} from "$env/static/private"
import { BULK_PRODUCTS_MUTATION } from "$lib/mutations/products"
import { GET_ORDERS_QUERY } from "$lib/queries/orders"
import {
  BULK_PRODUCTS_OPERATION_BY_ID,
  BULK_PRODUCTS_QUERY,
  GET_PRODUCTS_QUERY,
} from "$lib/queries/products"
import { deleteSession, loadSession } from "$lib/server/db/shopify.session"
import type { GraphqlClient } from "@shopify/shopify-api"
import { ApiVersion, shopifyApi } from "@shopify/shopify-api"
import "@shopify/shopify-api/adapters/node"
import { redirect } from "@sveltejs/kit"
import type {
  GetOrdersQuery,
  GetProductsQuery,
  RunProductsBulkOperationMutation,
} from "../../types/admin.generated"

type FetchResult<T> =
  | { success: true; data: T }
  | { success: false; error: GraphQLErrors }

type GraphQLErrors = {
  code?: "REAUTH_REQUIRED"
  networkStatusCode?: number
  message?: string
  graphQLErrors?: any[]
}

export const shopify = shopifyApi({
  apiKey: SHOPIFY_API_KEY,
  apiSecretKey: SHOPIFY_API_SECRET,
  scopes: SHOPIFY_SCOPES.split(","),
  hostName: SHOPIFY_STORE_DOMAIN,
  apiVersion: ApiVersion.January26,
  isEmbeddedApp: false,
})

export const withShopify = async <T>(
  fn: (client: GraphqlClient) => Promise<T>
): Promise<T> => {
  const session = await loadSession()

  if (!session) {
    throw new Error("REAUTH_REQUIRED")
  }

  const client = new shopify.clients.Graphql({ session })

  try {
    return await fn(client)
  } catch (err: any) {
    const code = err?.response?.statusCode

    if (code === 401 || code === 403) {
      await deleteSession()
      throw new Error("REAUTH_REQUIRED")
    }

    throw err
  }
}

type ShopifyLoadResult<T> =
  | { success: true; data: T }
  | { success: false; error?: { code?: string; message?: string } }

export const withShopifyLoad = async <T>(
  fn: () => Promise<ShopifyLoadResult<T>>
): Promise<T> => {
  const result = await fn()

  if (!result.success && result.error?.code === "REAUTH_REQUIRED") {
    throw redirect(302, "/api/auth")
  }

  if (!result.success) {
    throw new Error(result.error?.message ?? "Shopify request failed")
  }

  return result.data
}

export const fetchProducts = async (
  limit: number = 50
): Promise<FetchResult<GetProductsQuery>> => {
  try {
    const response = await withShopify((client) =>
      client.request<GetProductsQuery>(GET_PRODUCTS_QUERY, {
        variables: {
          first: limit,
        },
      })
    )

    return {
      success: true,
      data: response.data!,
    }
  } catch (error) {
    if (error instanceof Error && error.message === "REAUTH_REQUIRED") {
      return {
        success: false,
        error: {
          code: "REAUTH_REQUIRED",
          message: "Shopify authentication expired",
        },
      }
    }

    console.error("error fetching products:", error)

    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : "Error desconocido",
      },
    }
  }
}

export const fetchOrders = async (
  limit: number = 50
): Promise<FetchResult<GetOrdersQuery>> => {
  try {
    const response = await withShopify((client) =>
      client.request<GetOrdersQuery>(GET_ORDERS_QUERY, {
        variables: {
          first: limit,
        },
      })
    )

    return {
      success: true,
      data: response.data!,
    }
  } catch (error) {
    if (error instanceof Error && error.message === "REAUTH_REQUIRED") {
      return {
        success: false,
        error: {
          code: "REAUTH_REQUIRED",
          message: "Shopify authentication expired",
        },
      }
    }

    console.error("error fetching orders:", error)

    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : "Error desconocido",
      },
    }
  }
}

export const fetchBulkProducts = async (
  client: GraphqlClient
): Promise<FetchResult<RunProductsBulkOperationMutation>> => {
  try {
    const response = await client.request<RunProductsBulkOperationMutation>(
      BULK_PRODUCTS_MUTATION,
      {
        variables: {
          query: BULK_PRODUCTS_QUERY,
        },
      }
    )

    return {
      success: true,
      data: response.data!,
    }
  } catch (error) {
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : "Error desconocido",
      },
    }
  }
}

type BulkStatus = "CREATED" | "RUNNING" | "COMPLETED" | "FAILED" | "CANCELED"

interface BulkOperationResult {
  id: string
  status: BulkStatus
  url: string | null
  errorCode: string | null
  objectCount: string | null // viene como string
}

export const pollBulkOperationById = async ({
  bulkOperationId,
  intervalMs = 3000,
  timeoutMs = 5 * 60 * 1000,
}: {
  bulkOperationId: string
  intervalMs?: number
  timeoutMs?: number
}): Promise<BulkOperationResult> => {
  const start = Date.now()

  return withShopify(async (client) => {
    while (true) {
      const response = await client.request<{
        node: BulkOperationResult | null
      }>(BULK_PRODUCTS_OPERATION_BY_ID, {
        variables: {
          id: bulkOperationId,
        },
      })

      const node = response.data?.node

      if (!node) {
        throw new Error(`Bulk operation not found for id: ${bulkOperationId}`)
      }

      const { id, status, url, errorCode, objectCount } = node

      if (status === "COMPLETED") {
        return { id, status, url, errorCode, objectCount }
      }

      if (status === "FAILED" || status === "CANCELED") {
        throw new Error(`Bulk operation ${status}. ErrorCode: ${errorCode ?? "N/A"}`)
      }

      if (Date.now() - start > timeoutMs) {
        throw new Error("Bulk operation polling timed out")
      }

      await new Promise((r) => setTimeout(r, intervalMs))
    }
  })
}
