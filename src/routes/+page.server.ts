import { getOrders } from "$lib/shopify"
import type { PageServerLoad } from "./$types"

export const load: PageServerLoad = async () => {
  const { data } = await getOrders()

  return {
    orders: data,
  }
}
