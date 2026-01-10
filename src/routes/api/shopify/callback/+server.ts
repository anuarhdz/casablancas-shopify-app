import { SHOPIFY_API_KEY, SHOPIFY_API_SECRET, SHOPIFY_APP_URL } from "$env/static/private"
import { db } from "$lib/server/db"
import { shopifyStore } from "$lib/server/db/schema"
import { redirect } from "@sveltejs/kit"
import type { RequestHandler } from "./$types"

export const GET: RequestHandler = async ({ url, cookies, fetch }) => {
  const code = url.searchParams.get("code")
  const shop = url.searchParams.get("shop")
  const state = url.searchParams.get("state")

  if (!code || !shop || !state) {
    return new Response("Missing required OAuth parameters", { status: 400 })
  }

  // validate state
  const storedState = cookies.get("shopify_oauth_state")
  if (!storedState || storedState !== state) {
    return new Response("Invalid state parameter", { status: 400 })
  }

  cookies.delete("shopify_oauth_state", { path: "/" })

  // exchange code for access token
  const tokenUrl = `https://${shop}/admin/oauth/access_token`

  const tokenResponse = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: SHOPIFY_API_KEY,
      client_secret: SHOPIFY_API_SECRET,
      code,
    }),
  })

  if (!tokenResponse.ok) {
    const errorText = await tokenResponse.text()
    console.error("Error fetching access token from Shopify:", errorText)
    return new Response("Failed to exchange code for access token", {
      status: 500,
    })
  }

  const tokenData = (await tokenResponse.json()) as {
    access_token: string
    scope: string
  }

  const accessToken = tokenData.access_token

  // save shop in db
  await db
    .insert(shopifyStore)
    .values({
      shopDomain: shop,
      accessToken,
      scope: tokenData.scope,
    })
    .onConflictDoUpdate({
      target: shopifyStore.shopDomain,
      set: {
        accessToken,
        scope: tokenData.scope,
        updatedAt: new Date(),
      },
    })

  console.log("Shop authenticated and stored for domain:", shop)

  const redirectUrl = new URL(SHOPIFY_APP_URL)
  redirectUrl.searchParams.set("shop", shop)

  redirect(302, redirectUrl.toString())
}
