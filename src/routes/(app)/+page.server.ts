import { requireLogin } from "$lib/server/login"
import type { PageServerLoad } from "./$types"

export const load: PageServerLoad = async ({ request }) => {
  const user = requireLogin()

  return {
    user,
  }
}
