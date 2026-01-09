<script lang="ts">
  import favicon from "$lib/assets/favicon.svg"
  import "./layout.css"

  let { children } = $props()
</script>

<svelte:head
  ><link
    rel="icon"
    href={favicon} /></svelte:head>

<div class="isolate flex min-h-svh flex-col">
  <main class="grow">
    {@render children()}
  </main>
</div>
