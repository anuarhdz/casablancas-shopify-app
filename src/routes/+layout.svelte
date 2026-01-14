<script lang="ts">
  import favicon from "$lib/assets/favicon.svg"
  import { Toaster } from "$lib/components/ui/sonner"
  import "./layout.css"

  let { children } = $props()
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
  <link
    href="https://fonts.googleapis.com/css2?family=Geist+Mono:wght@100..900&family=Geist:wght@100..900&display=swap"
    rel="stylesheet"
  />
</svelte:head>

<Toaster position="top-center" />
{@render children()}
