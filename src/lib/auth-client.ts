import { BETTER_AUTH_URL } from "$env/static/private"
import { adminClient } from "better-auth/client/plugins"
import { createAuthClient } from "better-auth/svelte"

export const authClient = createAuthClient({
  baseURL: BETTER_AUTH_URL,
  plugins: [adminClient()],
})
