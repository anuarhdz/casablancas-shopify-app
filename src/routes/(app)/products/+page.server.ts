import { requireLogin } from "$lib/server/login"
import { fetchProducts } from "$lib/shopify"
import type { PageServerLoad } from "./$types"

export const load: PageServerLoad = async () => {
  const { data, error } = await fetchProducts()
  const products = data?.products

  return {
    user: requireLogin(),
    products,
    error,
  }
}
