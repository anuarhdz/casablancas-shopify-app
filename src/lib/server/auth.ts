import { dev } from "$app/environment"
import { getRequestEvent } from "$app/server"
import { BETTER_AUTH_SECRET, BETTER_AUTH_URL, SHOPIFY_APP_URL } from "$env/static/private"
import { db } from "$lib/server/db"
import * as schema from "$lib/server/db/schema"
import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { sveltekitCookies } from "better-auth/svelte-kit"

export const auth = betterAuth({
  baseURL: BETTER_AUTH_URL,
  secret: BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    requireEmailVerification: false,
  },
  emailVerification: {
    sendOnSignIn: true,
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url, token }, request) => {
      console.log(request)
      console.log(user)
      console.log(url)
      console.log(token)
    },
  },
  trustedOrigins: [BETTER_AUTH_URL, SHOPIFY_APP_URL],
  plugins: [sveltekitCookies(getRequestEvent)],
  logger: {
    disabled: !dev,
    level: dev ? "debug" : "error",
    log: (level, message) => {
      if (dev) {
        console.log(`[${level}] ${message}`)
      }
    },
  },
})

export type Session = typeof auth.$Infer.Session
