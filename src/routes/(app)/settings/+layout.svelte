<script lang="ts">
  import { page } from "$app/state"
  import { Button } from "$lib/components/ui/button"

  let { children } = $props()

  let pathname = $derived(page.url.pathname)

  const links = [
    {
      title: "Shopify Sync",
      href: "/settings/sync",
    },
    {
      title: "Users Management",
      href: "/settings/users",
    },
  ]
</script>

<div class="-mt-2">
  <div class="mb-4 border-b px-4 py-2">
    <ul class="flex items-center">
      {#each links as link (link.title)}
        <Button
          href={link.href}
          aria-current={link.href === pathname ? "page" : undefined}
          variant={link.href === pathname ? "secondary" : "ghost"}>{link.title}</Button
        >
      {/each}
    </ul>
  </div>

  {@render children()}
</div>
