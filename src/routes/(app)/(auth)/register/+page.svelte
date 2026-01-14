<script lang="ts">
  import { enhance } from "$app/forms"
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
  import { Input, InputPassword } from "$lib/components/ui/input"
  import { Spinner } from "$lib/components/ui/spinner"

  const id = $props.id()

  let { form } = $props()

  let pending = $state(false)
</script>

<svelte:head>
  <title>Register - Segreto Dashboard</title>
</svelte:head>

<div class="w-full">
  <Card class="mx-auto w-full max-w-sm">
    <CardHeader>
      <CardTitle class="text-2xl">Create account</CardTitle>
      <CardDescription>Enter your email below to create your account</CardDescription>
    </CardHeader>
    <CardContent>
      <form
        novalidate
        method="POST"
        use:enhance={({ formElement, formData, action, cancel }) => {
          pending = true
          return async ({ update }) => {
            pending = false
            await update()
          }
        }}
      >
        <FieldGroup>
          <Field data-invalid={form?.errors?.name ? "" : undefined}>
            <FieldLabel for="name-{id}">Name</FieldLabel>
            <Input
              id="name-{id}"
              type="text"
              name="name"
              placeholder="John Doe"
              required
              autocomplete="name"
              inputmode="text"
              enterkeyhint="next"
              aria-invalid={form?.errors?.name ? "true" : "false"}
            />
            {#if form?.errors?.name}
              <FieldError>{form.errors.name}</FieldError>
            {/if}
          </Field>

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

          <Field data-invalid={form?.errors?.password ? "" : undefined}>
            <FieldLabel for="password-{id}">Password</FieldLabel>
            <InputPassword
              id="password-{id}"
              name="password"
              required
              autocomplete="new-password"
              inputmode="text"
              enterkeyhint="next"
              aria-invalid={form?.errors?.password ? "true" : "false"}
            />
            {#if form?.errors?.password}
              <FieldError>{form.errors.password}</FieldError>
            {:else}
              <FieldDescription>Password must be at least 8 characters</FieldDescription>
            {/if}
          </Field>

          <Field data-invalid={form?.errors?.confirmPassword ? "" : undefined}>
            <FieldLabel for="confirmPassword-{id}">Confirm Password</FieldLabel>
            <InputPassword
              id="confirmPassword-{id}"
              name="confirmPassword"
              required
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
              Register
            </Button>
            <FieldDescription class="text-center">
              Already have an account? <a href="/login">Log In</a>
            </FieldDescription>
          </Field>
        </FieldGroup>
      </form>
    </CardContent>
  </Card>
</div>
