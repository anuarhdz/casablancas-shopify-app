import {
  SHOPIFY_API_KEY,
  SHOPIFY_APP_URL,
  SHOPIFY_SCOPES,
  SHOPIFY_STORE_DOMAIN,
} from "$env/static/private"
import { redirect } from "@sveltejs/kit"
import type { RequestHandler } from "./$types"

const generateState = () => crypto.randomUUID()

export const GET: RequestHandler = async ({ cookies }) => {
  // create state and save in cookie
  const state = generateState()
  cookies.set("shopify_oauth_state", state, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    maxAge: 60 * 10, // 10 minutos
  })

  // callback
  const redirectUri = `${SHOPIFY_APP_URL}/api/shopify/callback`

  // build shopify auth url
  const authUrl = new URL(`https://${SHOPIFY_STORE_DOMAIN}/admin/oauth/authorize`)
  authUrl.searchParams.set("client_id", SHOPIFY_API_KEY)
  authUrl.searchParams.set("scope", SHOPIFY_SCOPES)
  authUrl.searchParams.set("redirect_uri", redirectUri)
  authUrl.searchParams.set("state", state)

  redirect(302, authUrl.toString())
}
