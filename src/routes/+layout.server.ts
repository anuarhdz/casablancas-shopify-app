import { getTotalOrders } from "$lib/shopify"
import type { LayoutServerLoad } from "./$types"

export const load: LayoutServerLoad = async () => {
  const { data } = await getTotalOrders()

  console.log(data)
}
