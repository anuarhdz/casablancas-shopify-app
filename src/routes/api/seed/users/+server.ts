import { PRIVATE_API_SEED_USERS } from "$env/static/private"
import { auth } from "$lib/server/auth"
import { userData } from "$lib/user-seed"
import { error, json } from "@sveltejs/kit"
import type { RequestHandler } from "./$types"

export const POST: RequestHandler = async () => {
  if (PRIVATE_API_SEED_USERS !== "enabled") {
    return error(400, "Unauthorized endpoint")
  }

  const data = await auth.api.createUser({
    body: {
      name: userData.name,
      email: userData.email,
      password: userData.password,
      role: userData.isAdmin ? "admin" : "user",
    },
  })

  if (!data) {
    return error(400, "Unauthorized sign up")
  }

  return json({ sucess: true, data })
}
