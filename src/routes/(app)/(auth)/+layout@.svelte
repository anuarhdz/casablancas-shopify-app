<script lang="ts">
  let { children } = $props()
</script>

<div class="isolate flex min-h-svh flex-col bg-accent text-accent-foreground">
  <main class="flex w-full grow items-center justify-center px-4">
    {@render children()}
  </main>
</div>
