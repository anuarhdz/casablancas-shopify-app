import { SHOPIFY_API_SECRET } from "$env/static/private"
import crypto from "crypto"

export function verifyShopifyHmac(url: URL) {
  const params = new URLSearchParams(url.search)

  const hmac = params.get("hmac")
  if (!hmac) {
    throw new Error("Missing HMAC")
  }

  params.delete("hmac")
  params.delete("signature")

  const message = params.toString()

  const digest = crypto
    .createHmac("sha256", SHOPIFY_API_SECRET)
    .update(message)
    .digest("hex")

  if (digest !== hmac) {
    throw new Error("Invalid HMAC")
  }
}
