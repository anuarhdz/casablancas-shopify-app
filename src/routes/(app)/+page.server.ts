import { requireLogin } from "$lib/server/login"
import type { PageServerLoad } from "./$types"

export const load: PageServerLoad = async ({ request }) => {
  const user = requireLogin()

  // const data = await auth.api.setRole({
  //   body: {
  //     userId: user.id,
  //     role: "admin",
  //   },
  //   headers: request.headers,
  // })
  // console.log(data)
  console.log(user)
  return {
    user,
  }
}
