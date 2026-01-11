<script lang="ts">
  let { children } = $props()
</script>

<div class="isolate flex min-h-svh flex-col">
  <main class="grow">
    {@render children()}
  </main>
</div>
