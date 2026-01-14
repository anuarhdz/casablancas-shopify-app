import { verifyShopifyHmac } from "$lib/hmac"
import { loadSession } from "$lib/server/db/shopify.session"
import { redirect } from "@sveltejs/kit"
import type { LayoutServerLoad } from "./$types"

export const load: LayoutServerLoad = async ({ url }) => {
  const shop = url.searchParams.get("shop")

  if (!shop) {
    return {}
  }

  verifyShopifyHmac(url)

  const session = await loadSession(shop)

  if (!session) {
    throw redirect(302, `/api/auth?shop=${shop}`)
  }

  return { shop }
}
