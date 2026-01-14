import type { Session } from "$lib/server/auth"
// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
  namespace App {
    // interface Error {}
    interface Locals {
      session?: Session["session"]
      user?: Session["user"]
    }
    interface PageData {
      user?: Session["user"]
    }
    interface ActionData {
      success?: boolean
      errors?: Record<string, string>
      data?: Record<string, FormDataEntryValue>
    }
    // interface PageState {}
    // interface Platform {}
  }
}

export {}
