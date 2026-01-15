import { CreateUserSchema } from "$lib/schema"
import { auth } from "$lib/server/auth"
import { requireLogin } from "$lib/server/login"
import { error, fail } from "@sveltejs/kit"
import { APIError } from "better-auth/api"
import * as v from "valibot"
import type { Actions, PageServerLoad } from "./$types"

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

export const actions: Actions = {
  default: async ({ request }) => {
    const formData = await request.formData()
    const values = Object.fromEntries(formData)

    const result = v.safeParse(CreateUserSchema, values)

    if (!result.success) {
      const errors: Record<string, string> = {}
      for (const issue of result.issues) {
        const key = issue.path?.[0]?.key as string
        if (key && !errors[key]) {
          errors[key] = issue.message
        }
      }
      return fail(400, { errors, values })
    }

    let data

    try {
      data = await auth.api.createUser({
        body: {
          email: result.output.email,
          password: result.output.email,
          name: result.output.fullName,
          role: result.output.role,
        },
      })
    } catch (error) {
      if (error instanceof APIError) {
        console.log(error.message, error.status)
        return fail(400, error)
      }
    }

    if (data?.user) {
      return { newUser: data.user }
    }
  },
}
