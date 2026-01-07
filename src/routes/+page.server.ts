import { getProducts } from "$lib/shopify"
import type { PageServerLoad } from "./$types"

export const load: PageServerLoad = async () => {
  const { data } = await getProducts()

  return {
    products: data?.products.edges ?? [],
  }
}
