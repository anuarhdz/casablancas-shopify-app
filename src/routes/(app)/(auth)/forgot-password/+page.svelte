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
  import { toast } from "svelte-sonner"

  const id = $props.id()

  let { form } = $props()

  let pending = $state(false)
</script>

<svelte:head>
  <title>Forgot Password - Segreto Dashboard</title>
</svelte:head>

<div class="w-full">
  <Card class="mx-auto w-full max-w-sm">
    <CardHeader>
      <CardTitle class="text-2xl">Forgot your password?</CardTitle>
      <CardDescription
        >Enter your email address below to reset your password</CardDescription
      >
    </CardHeader>
    <CardContent>
      <form
        novalidate
        method="POST"
        use:enhance={({ formElement, formData, action, cancel }) => {
          pending = true
          return async ({ update, result }) => {
            if (result.type === "success") {
              toast.success(result.data?.message as string)
              await update()
            } else {
              toast.info("An error occurred in your request. Please try again later.")
            }
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
    </CardContent>
  </Card>
</div>
