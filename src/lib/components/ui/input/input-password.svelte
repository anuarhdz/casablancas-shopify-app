<script lang="ts">
  import { Button } from "$lib/components/ui/button"
  import { Input } from "$lib/components/ui/input"
  import { cn, type WithElementRef } from "$lib/utils"
  import { Eye, EyeOff } from "@lucide/svelte"
  import type { HTMLInputAttributes } from "svelte/elements"

  type Props = WithElementRef<
    Omit<HTMLInputAttributes, "type" | "files">,
    HTMLInputElement
  >

  let {
    ref = $bindable(null),
    value = $bindable(),
    class: className,
    ...restProps
  }: Props = $props()

  let showPassword = $state(false)

  const togglePassword = () => {
    const { selectionStart, selectionEnd } = ref || {}
    showPassword = !showPassword
    requestAnimationFrame(() => {
      if (ref && selectionStart != null && selectionEnd != null) {
        ref.focus()
        ref.setSelectionRange(selectionStart, selectionEnd)
      }
    })
  }
</script>

<div class="relative">
  <Input
    bind:ref
    bind:value
    type={showPassword ? "text" : "password"}
    class={cn("pr-9", className)}
    {...restProps}
  />
  {#if !restProps.disabled}
    <Button
      type="button"
      class="absolute top-1 right-0.5 bottom-1 m-auto"
      size="icon-sm"
      variant="ghost"
      tabindex={-1}
      onclick={togglePassword}
    >
      <span class="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
      {#if showPassword}
        <EyeOff data-slot="icon" />
      {:else}
        <Eye data-slot="icon" />
      {/if}
    </Button>
  {/if}
</div>
