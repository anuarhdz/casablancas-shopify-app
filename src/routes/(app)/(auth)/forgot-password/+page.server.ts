import { ForgotPasswordSchema } from "$lib/schema"
import { auth } from "$lib/server/auth"
import { fail, redirect } from "@sveltejs/kit"
import { APIError } from "better-auth/api"
import * as v from "valibot"
import type { Actions, PageServerLoad } from "./$types"

export const load: PageServerLoad = async ({ locals }) => {
  const { user, session } = locals

  if (user || session) {
    redirect(302, "/")
  }
}

export const actions: Actions = {
  default: async ({ request, url }) => {
    const formData = await request.formData()
    const data = Object.fromEntries(formData)

    const result = v.safeParse(ForgotPasswordSchema, data)

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

    const redirectTo = url.origin + "/reset-password"
    let authData

    try {
      authData = await auth.api.requestPasswordReset({
        body: {
          email: result.output.email,
          redirectTo,
        },
      })
    } catch (error) {
      if (error instanceof APIError) {
        console.log(error.message, error.status)
      }
    }
    console.log(authData)

    return { message: authData?.message }
  },
}
