import {
  PRIVATE_SHOPIFY_ADMIN_API_ACCESS_TOKEN,
  PRIVATE_SHOPIFY_API_VERSION,
  PRIVATE_SHOPIFY_STORE_DOMAIN,
} from "$env/static/private"
import { BULK_PRODUCTS_MUTATION } from "$lib/mutations/products"
import { COUNT_ORDERS_QUERY, GET_ORDERS_QUERY } from "$lib/queries/orders"
import {
  BULK_PRODUCTS_OPERATION_BY_ID,
  BULK_PRODUCTS_QUERY,
  GET_PRODUCTS_QUERY,
} from "$lib/queries/products"
import { createAdminApiClient } from "@shopify/admin-api-client"
import "@shopify/shopify-api/adapters/node"

export const client = createAdminApiClient({
  accessToken: PRIVATE_SHOPIFY_ADMIN_API_ACCESS_TOKEN,
  storeDomain: PRIVATE_SHOPIFY_STORE_DOMAIN,
  apiVersion: PRIVATE_SHOPIFY_API_VERSION,
})

export const getTotalOrders = async () => {
  try {
    const response = await client.request(COUNT_ORDERS_QUERY)

    return {
      success: true,
      data: response.data,
    }
  } catch (error) {
    console.error("error fetching orders:", error)
    return {
      success: false,
      data: null,
    }
  }
}

export const getOrders = async (limit: number = 2) => {
  try {
    const response = await client.request(GET_ORDERS_QUERY, {
      variables: {
        first: limit,
      },
    })

    return {
      success: true,
      data: response.data,
    }
  } catch (error) {
    console.error("error fetching orders:", error)
    return {
      success: false,
      orders: [],
    }
  }
}

export const getProducts = async () => {
  try {
    const response = await client.request(GET_PRODUCTS_QUERY, {
      variables: {
        first: 10,
      },
    })
    console.log(response.extensions)

    return {
      success: true,
      data: response.data,
    }
  } catch (error) {
    console.error("error fetching products: ", error)
    return {
      success: false,
      data: null,
    }
  }
}

export const getBulkProducts = async () => {
  try {
    const response = await client.request(BULK_PRODUCTS_MUTATION, {
      variables: {
        query: BULK_PRODUCTS_QUERY,
      },
    })

    return {
      success: true,
      data: response.data ?? null,
    }
  } catch (error) {
    console.log("error fetching bulk products", error)
    return {
      success: false,
      data: null,
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

  while (true) {
    const response = await client.request(BULK_PRODUCTS_OPERATION_BY_ID, {
      variables: {
        id: bulkOperationId,
      },
    })

    const node = response.data?.node

    if (!node) {
      throw new Error(`Bulk operation not found for id: ${bulkOperationId}`)
    }

    const { id, status, url, errorCode, objectCount } = node as BulkOperationResult

    if (status === "COMPLETED") {
      return { id, status, url, errorCode, objectCount }
    }

    if (status === "FAILED" || status === "CANCELED") {
      throw new Error(`Bulk operation ${status}. ErrorCode: ${errorCode ?? "N/A"}`)
    }

    if (Date.now() - start > timeoutMs) {
      throw new Error("Bulk operation polling timed out")
    }

    await new Promise((resolve) => setTimeout(resolve, intervalMs))
  }
}
