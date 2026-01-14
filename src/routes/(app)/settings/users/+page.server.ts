import { auth } from "$lib/server/auth"
import { requireLogin } from "$lib/server/login"
import { error } from "@sveltejs/kit"
import type { PageServerLoad } from "./$types"

export const load: PageServerLoad = async ({ request }) => {
  const user = requireLogin()

  if (user.role !== "admin") {
    error(400, {
      message: "User does not have access rights to the content",
    })
  }

  const listUsers = await auth.api.listUsers({
    query: {
      sortBy: "name",
    },
    headers: request.headers,
  })

  return {
    user,
    listUsers,
  }
}
