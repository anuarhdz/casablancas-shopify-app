<script lang="ts">
  import Header from "$lib/components/header.svelte"
  let { children } = $props()
</script>

<div
  class="isolate flex min-h-svh flex-col bg-background text-foreground lg:bg-accent lg:text-accent-foreground"
>
  <Header />
  <main class="flex flex-1 grow flex-col pb-2 lg:px-2">
    <div
      class="grow p-2 pb-0 lg:rounded-lg lg:bg-background lg:shadow-xs lg:ring-1 lg:ring-border"
    >
      {@render children()}
    </div>
  </main>
</div>
