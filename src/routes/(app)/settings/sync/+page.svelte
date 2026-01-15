<script lang="ts">
  import SyncGroup from "$lib/components/sync-group.svelte"
  let { data } = $props()
  $inspect(data)
</script>

<svelte:head>
  <title>Shopify Sync - Segreto Dashboard</title>
</svelte:head>

<div class="flex justify-center">
  <SyncGroup />
</div>
