import { LoginSchema } from "$lib/schema"
import { auth } from "$lib/server/auth"
import { fail, redirect } from "@sveltejs/kit"
import { APIError } from "better-auth/api"
import * as v from "valibot"
import type { Actions, PageServerLoad } from "./$types"

export const load: PageServerLoad = async ({ locals }) => {
  const { user, session } = locals
  console.log(user)

  if (user || session) {
    redirect(302, "/")
  }
}

export const actions: Actions = {
  default: async ({ request, url }) => {
    const formData = await request.formData()
    const data = Object.fromEntries(formData)

    const result = v.safeParse(LoginSchema, data)

    if (!result.success) {
      const errors: Record<string, string> = {}
      for (const issue of result.issues) {
        const key = issue.path?.[0]?.key as string
        if (key && !errors[key]) {
          errors[key] = issue.message
        }
      }
      return fail(400, { errors, data })
    }

    const redirectTo = url.searchParams.get("redirectTo")
    let authData

    try {
      authData = await auth.api.signInEmail({
        body: {
          email: result.output.email,
          password: result.output.password,
        },
        headers: request.headers,
      })
    } catch (error) {
      if (error instanceof APIError) {
        console.log(error.message, error.status)
      }
    }
    console.log(result.output)
    console.log(authData)

    if (authData?.user) {
      redirect(302, redirectTo ?? "/")
    }

    return { success: true, data: authData }
  },
}
