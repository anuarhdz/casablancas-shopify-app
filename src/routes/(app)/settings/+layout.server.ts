import { requireLogin } from "$lib/server/login"
import { redirect } from "@sveltejs/kit"
import type { LayoutServerLoad } from "./$types"

export const load: LayoutServerLoad = async ({ url }) => {
  if (url.pathname === "/settings") {
    redirect(302, "/settings/sync")
  }

  return {
    user: requireLogin(),
  }
}
