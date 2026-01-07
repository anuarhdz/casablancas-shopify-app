import {
  PRIVATE_SHOPIFY_ADMIN_API_ACCESS_TOKEN,
  PRIVATE_SHOPIFY_API_VERSION,
  PRIVATE_SHOPIFY_STORE_DOMAIN,
} from "$env/static/private"
import { COUNT_ORDERS_QUERY, GET_ORDERS_QUERY } from "$lib/queries/orders"
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
