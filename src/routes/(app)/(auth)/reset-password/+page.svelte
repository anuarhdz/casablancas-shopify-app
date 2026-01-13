<script lang="ts">
  import { applyAction, enhance } from "$app/forms"
  import { goto } from "$app/navigation"
  import { page } from "$app/state"
  import { Button } from "$lib/components/ui/button"
  import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from "$lib/components/ui/card"
  import {
    Field,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
  } from "$lib/components/ui/field"
  import { InputPassword } from "$lib/components/ui/input"
  import { Item, ItemContent, ItemDescription, ItemTitle } from "$lib/components/ui/item"
  import { Spinner } from "$lib/components/ui/spinner"
  import { toast } from "svelte-sonner"

  const id = $props.id()

  let { form } = $props()

  let pending = $state(false)
  let errorToken = $derived(page.url.searchParams.get("error") ?? false)
  let token = $derived(page.url.searchParams.get("token") ?? false)
</script>

<svelte:head>
  <title>Reset Password - Segreto Dashboard</title>
</svelte:head>

<div class="w-full">
  <Card class="mx-auto w-full max-w-sm">
    <CardHeader>
      <CardTitle class="text-2xl">Reset your password</CardTitle>
      <CardDescription>Enter a new password and confirm it</CardDescription>
    </CardHeader>
    <CardContent>
      {#if errorToken}
        <Item variant="outline" class="border-destructive text-destructive">
          <ItemContent>
            <ItemTitle>Invalid token</ItemTitle>
            <ItemDescription class="text-destructive">
              An error occurred in your request. Please request a new link to <a
                href="/forgot-password"
                class="text-destructive! underline">reset your password</a
              >.
            </ItemDescription>
          </ItemContent>
        </Item>
      {/if}
      {#if token}
        <form
          novalidate
          method="POST"
          use:enhance={({ formElement, formData, action, cancel }) => {
            pending = true
            return async ({ update, result }) => {
              if (result.type === "success" && result.data?.status) {
                toast.success("Operation successful. Use your new password to log in.")
                await new Promise((fulfil) => setTimeout(fulfil, 500))
                goto("/login")
              }
              pending = false
              await applyAction(result)
            }
          }}
        >
          <input type="hidden" name="token" value={token} />

          <FieldGroup>
            <Field data-invalid={form?.errors?.password ? "" : undefined}>
              <FieldLabel for="password-{id}">Password</FieldLabel>
              <InputPassword
                id="password-{id}"
                name="password"
                required
                disabled={errorToken ? true : false}
                autocomplete="off"
                enterkeyhint="next"
                aria-invalid={form?.errors?.password ? "true" : "false"}
              />
              {#if form?.errors?.password}
                <FieldError>{form.errors.password}</FieldError>
              {:else}
                <FieldDescription>Password must be at least 8 characters</FieldDescription
                >
              {/if}
            </Field>

            <Field data-invalid={form?.errors?.confirmPassword ? "" : undefined}>
              <FieldLabel for="confirmPassword-{id}">Confirm Password</FieldLabel>
              <InputPassword
                id="confirmPassword-{id}"
                name="confirmPassword"
                required
                disabled={errorToken ? true : false}
                autocomplete="off"
                inputmode="text"
                enterkeyhint="send"
                aria-invalid={form?.errors?.confirmPassword ? "true" : "false"}
              />
              {#if form?.errors?.confirmPassword}
                <FieldError>{form.errors.confirmPassword}</FieldError>
              {/if}
            </Field>

            <Field>
              <Button type="submit" class="w-full" disabled={pending}>
                {#if pending}
                  <Spinner />
                {/if}
                Reset your password
              </Button>
              <FieldDescription class="text-center">
                Remember your password? <a href="/login">Log In</a>
              </FieldDescription>
            </Field>
          </FieldGroup>
        </form>
      {/if}
    </CardContent>
  </Card>
</div>
