import { requireLogin } from "$lib/server/login"
import type { PageServerLoad } from "./$types"

export const load: PageServerLoad = async () => {
  const user = requireLogin()

  console.log(user)

  return {
    user,
  }
}
