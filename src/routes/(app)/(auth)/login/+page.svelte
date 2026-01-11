<script lang="ts">
  import { applyAction, enhance } from "$app/forms"
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
  import { Input } from "$lib/components/ui/input"
  import { Spinner } from "$lib/components/ui/spinner"

  const id = $props.id()

  let { form } = $props()

  let pending = $state(false)
</script>

<div class="w-full">
  <Card class="mx-auto w-full max-w-sm">
    <CardHeader>
      <CardTitle class="text-2xl">Login</CardTitle>
      <CardDescription>Enter your email below to login to your account</CardDescription>
    </CardHeader>
    <CardContent>
      <form
        novalidate
        method="POST"
        use:enhance={({ formElement, formData, action, cancel }) => {
          pending = true
          return async ({ update, result }) => {
            //await update()
            console.log(result)
            pending = false
            await applyAction(result)
          }
        }}
      >
        <FieldGroup>
          <Field data-invalid={form?.errors?.email ? "" : undefined}>
            <FieldLabel for="email-{id}">Email</FieldLabel>
            <Input
              id="email-{id}"
              type="email"
              name="email"
              placeholder="email@example.com"
              required
              autocomplete="email"
              inputmode="email"
              enterkeyhint="next"
              aria-invalid={form?.errors?.email ? "true" : "false"}
            />
            {#if form?.errors?.email}
              <FieldError>{form.errors.email}</FieldError>
            {/if}
          </Field>
          <Field data-invalid={form?.errors?.email ? "" : undefined}>
            <div class="flex items-center">
              <FieldLabel for="password-{id}">Password</FieldLabel>
              <a href="##" class="ms-auto inline-block text-sm underline">
                Forgot your password?
              </a>
            </div>
            <Input
              id="password-{id}"
              name="password"
              type="password"
              required
              autocomplete="current-password"
              inputmode="text"
              enterkeyhint="send"
              aria-invalid={form?.errors?.password ? "true" : "false"}
            />
            {#if form?.errors?.password}
              <FieldError>{form.errors.password}</FieldError>
            {:else}
              <FieldDescription>Password must be at least 8 characters</FieldDescription>
            {/if}
          </Field>
          <Field>
            <Button type="submit" class="w-full" disabled={pending}>
              {#if pending}
                <Spinner />
              {/if}
              Login
            </Button>
            <FieldDescription class="text-center">
              Don't have an account? <a href="/register">Sign up</a>
            </FieldDescription>
          </Field>
        </FieldGroup>
      </form>
    </CardContent>
  </Card>
</div>
