import { requireLogin } from "$lib/server/login"
import { fetchProducts, withShopifyLoad } from "$lib/shopify"
import type { PageServerLoad } from "./$types"

export const load: PageServerLoad = async () => {
  const data = await withShopifyLoad(() => fetchProducts())
  const user = requireLogin()

  const { products } = data

  return {
    user,
    products,
  }
}
