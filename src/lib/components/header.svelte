<script lang="ts">
  import { page } from "$app/state"
  import PopoverUser from "$lib/components/popover-user.svelte"
  import { Button } from "$lib/components/ui/button"
  import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
  } from "$lib/components/ui/drawer"
  import { Menu, X } from "@lucide/svelte"

  let { user } = $derived(page.data)
  $inspect(page.url.pathname)

  const links = [
    {
      title: "Dashboard",
      href: "/",
    },
    {
      title: "Orders",
      href: "/orders",
    },
    {
      title: "Customers",
      href: "/customers",
    },
    {
      title: "Producs",
      href: "/products",
    },
    {
      title: "Settings",
      href: "/settings",
    },
  ]
</script>

<header class="flex items-center px-4">
  <div class="py-2.5 lg:hidden">
    <span class="relative">
      <Drawer>
        <DrawerTrigger>
          <span class="sr-only">Navigation</span>
          <Menu />
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Drawer nav</DrawerTitle>
            <DrawerDescription>Drawer description</DrawerDescription>
          </DrawerHeader>
          <DrawerFooter>
            <Button>Submit</Button>
            <DrawerClose>
              <span class="sr-only">Close drawer</span>
              <X />
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </span>
  </div>
  <div class="min-w-0 flex-1">
    <nav class="flex flex-1 items-center gap-4 py-2.5">
      <!-- <div
        class="h-6 w-px bg-zinc-950/10 max-lg:hidden dark:bg-white/10"
        aria-hidden="true"
      ></div> -->

      {#if user?.role === "admin"}
        <div class="-ml-2.25 flex items-center gap-3 max-lg:hidden">
          {#each links as link (link.title)}
            <span class="relative">
              <a
                href={link.href}
                aria-current={link.href === page.url.pathname ? "page" : undefined}
                class="flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left text-base/6 font-medium text-sidebar-foreground hover:bg-sidebar-foreground/5 focus-visible:bg-sidebar-foreground/5 aria-current:bg-sidebar-foreground/5 *:data-[slot=avatar]:-m-0.5 *:data-[slot=avatar]:size-7 *:data-[slot=icon]:size-6 *:data-[slot=icon]:shrink-0 *:data-[slot=icon]:fill-sidebar-ring *:last:data-[slot=icon]:ml-auto *:last:data-[slot=icon]:size-5 hover:*:data-[slot=icon]:fill-foreground focus-visible:*:data-[slot=icon]:fill-foreground aria-current:*:data-[slot=icon]:fill-foreground sm:py-2 sm:text-sm/5 sm:*:data-[slot=avatar]:size-6 sm:*:data-[slot=icon]:size-5 sm:*:last:data-[slot=icon]:size-4"
              >
                <span
                  class="absolute top-1/2 left-1/2 size-[max(100%,2.75rem)] -translate-x-1/2 -translate-y-1/2 pointer-fine:hidden"
                  aria-hidden="true"
                ></span>
                <span class="truncate">{link.title}</span>
              </a>
            </span>
          {/each}
        </div>
      {/if}

      <div class="-ml-4 flex-1" aria-hidden="true"></div>
      <div class="flex items-center gap-3">
        <span class="relative">
          <PopoverUser />
        </span>
      </div>
    </nav>
  </div>
</header>
