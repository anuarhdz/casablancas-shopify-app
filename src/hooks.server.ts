import { building } from "$app/environment"
import { auth } from "$lib/server/auth"
import type { Handle } from "@sveltejs/kit"
import { sequence } from "@sveltejs/kit/hooks"
import { svelteKitHandler } from "better-auth/svelte-kit"

export const handleAuth: Handle = async ({ event, resolve }) => {
  const session = await auth.api.getSession({
    headers: event.request.headers,
  })

  if (session) {
    event.locals.session = session.session
    event.locals.user = session.user
  }

  return svelteKitHandler({ event, resolve, auth, building })
}

// https://svelte.dev/docs/cli/devtools-json
export const handleDevTools: Handle = async ({ event, resolve }) => {
  if (event.url.pathname.startsWith("/.well-known/appspecific/com.chrome.devtools")) {
    return new Response(null, { status: 204 }) // Return empty response with 204 No Content
  }

  return await resolve(event)
}

export const handle: Handle = sequence(handleAuth, handleDevTools)
