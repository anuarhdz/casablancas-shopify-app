<script lang="ts">
  import Header from "$lib/components/header.svelte"
  let { children } = $props()
</script>

<div
  class="isolate flex min-h-svh flex-col bg-background text-foreground lg:bg-accent lg:text-accent-foreground"
>
  <Header />
  <main class="flex flex-1 flex-col pb-2 lg:px-2">
    <div
      class="grow p-6 lg:rounded-lg lg:bg-background lg:p-10 lg:shadow-xs lg:ring-1 lg:ring-border"
    >
      {@render children()}
    </div>
  </main>
</div>
