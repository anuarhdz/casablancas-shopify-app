import { SHOPIFY_API_KEY, SHOPIFY_API_SECRET } from "$env/static/private"
import { saveSession } from "$lib/server/db/shopify.session"
import { redirect } from "@sveltejs/kit"
import type { RequestHandler } from "./$types"

export const GET: RequestHandler = async ({ url, fetch }) => {
  const shop = url.searchParams.get("shop")!
  const code = url.searchParams.get("code")!

  const tokenRes = await fetch(`https://${shop}/admin/oauth/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: SHOPIFY_API_KEY,
      client_secret: SHOPIFY_API_SECRET,
      code,
    }),
  })

  const { access_token, scope } = await tokenRes.json()

  await saveSession({
    shop,
    accessToken: access_token,
    scope,
  })

  throw redirect(302, "/")
}
