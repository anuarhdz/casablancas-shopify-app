import { SHOPIFY_API_KEY, SHOPIFY_APP_URL, SHOPIFY_SCOPES } from "$env/static/private"
import { redirect } from "@sveltejs/kit"
import type { RequestHandler } from "./$types"

export const GET: RequestHandler = async ({ url }) => {
  const shop = url.searchParams.get("shop")
  if (!shop) return new Response("Missing shop", { status: 400 })

  const state = crypto.randomUUID()

  const params = new URLSearchParams({
    client_id: SHOPIFY_API_KEY,
    scope: SHOPIFY_SCOPES,
    redirect_uri: `${SHOPIFY_APP_URL}/api/auth/callback`,
    state,
  })

  throw redirect(302, `https://${shop}/admin/oauth/authorize?${params.toString()}`)
}
