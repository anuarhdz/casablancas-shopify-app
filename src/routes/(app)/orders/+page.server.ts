import { requireLogin } from "$lib/server/login"
import { fetchOrders } from "$lib/shopify"
import type { PageServerLoad } from "./$types"

export const load: PageServerLoad = async () => {
  const { data, error, success } = await fetchOrders()
  console.log(data)
  console.log(error)
  console.log(success)
  const orders = data?.orders

  return {
    user: requireLogin(),
    orders,
    error,
  }
}
