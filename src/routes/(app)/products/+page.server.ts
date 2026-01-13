import { requireLogin } from "$lib/server/login"
import { fetchProducts } from "$lib/shopify"
import type { PageServerLoad } from "./$types"

export const load: PageServerLoad = async () => {
  const result = await fetchProducts()
  const products = result.success ? result.data : null

  return {
    user: requireLogin(),
    products,
  }
}
