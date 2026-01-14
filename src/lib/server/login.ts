import { getRequestEvent } from "$app/server"
import { redirect } from "@sveltejs/kit"

export const requireLogin = () => {
  const { locals, url } = getRequestEvent()

  if (!locals.user) {
    const redirectTo = url.pathname + url.search
    const params = new URLSearchParams({ redirectTo })

    redirect(307, url.pathname !== "/" ? `/login?${params}` : "/login")
  }

  return locals.user
}
