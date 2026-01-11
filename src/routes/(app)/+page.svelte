<script lang="ts">
  import ShopStatus from "$lib/components/shop-status.svelte"

  let { data } = $props()

  let user = $derived(data.user)

  // const { data: authData, error } = await authClient.admin.setRole({
  //   userId: "ULcdrPIqkl0aWzSVnLlRX5wPWa3vO6hh",
  //   role: "admin",
  // })

  // $inspect(authData)

  // import SyncGroup from "$lib/components/sync-group.svelte"
</script>

<div class="p-5 lg:p-10">
  <ShopStatus />
  <!-- <SyncGroup /> -->
</div>
