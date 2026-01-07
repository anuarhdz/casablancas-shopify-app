<script lang="ts">
  let { data } = $props()
  let orders = $derived(data.orders)
  $inspect(orders)
</script>
