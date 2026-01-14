import { adminClient } from "better-auth/client/plugins"
import { createAuthClient } from "better-auth/svelte"

export const authClient = createAuthClient({
  plugins: [adminClient()],
})

type Session = typeof authClient.$Infer.Session
export type User = NonNullable<Session>["user"]
