<script lang="ts">
  import { goto, onNavigate } from "$app/navigation"
  import { page } from "$app/state"
  import { authClient } from "$lib/auth-client"
  import { Avatar, AvatarImage } from "$lib/components/ui/avatar"
  import { Popover, PopoverContent, PopoverTrigger } from "$lib/components/ui/popover"

  let { user } = $derived(page.data)

  const navigationLinks = [
    {
      title: "My Profile",
      href: "/account",
    },
    {
      title: "Settings",
      href: "/settings",
    },
    {
      title: "Privacy policy",
      href: "#",
    },
    {
      title: "Sign Out",
      href: "/logout",
    },
  ]

  let open = $state(false)

  onNavigate(() => {
    open = false
  })

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          goto("/login")
        },
      },
    })
  }
</script>

<Popover bind:open>
  <PopoverTrigger
    class="flex w-full cursor-pointer items-center gap-3 rounded-lg px-2 py-2.5 text-left text-base/6 font-medium text-sidebar-foreground hover:bg-sidebar-foreground/5 hover:text-sidebar-accent-foreground active:bg-sidebar-foreground/5 active:text-sidebar-accent-foreground aria-current:bg-sidebar-foreground/5 aria-current:text-sidebar-accent-foreground aria-expanded:bg-sidebar-foreground/5 aria-expanded:text-sidebar-accent-foreground *:data-[slot=avatar]:-m-0.5 *:data-[slot=avatar]:size-7 *:data-[slot=icon]:size-6 *:data-[slot=icon]:shrink-0 *:data-[slot=icon]:stroke-sidebar-foreground *:last:data-[slot=icon]:ml-auto *:last:data-[slot=icon]:size-5 hover:*:data-[slot=icon]:stroke-sidebar-accent-foreground active:*:data-[slot=icon]:stroke-sidebar-accent-foreground aria-current:*:data-[slot=icon]:stroke-sidebar-accent-foreground aria-expanded:*:data-[slot=icon]:stroke-sidebar-accent-foreground *:data-[slot=label]:truncate sm:py-2 sm:text-sm/5 sm:*:data-[slot=avatar]:size-6 sm:*:data-[slot=icon]:size-5 sm:*:last:data-[slot=icon]:size-4"
  >
    <span
      class="absolute top-1/2 left-1/2 size-[max(100%,2.75rem)] -translate-x-1/2 -translate-y-1/2 pointer-fine:hidden"
      aria-hidden="true"
    ></span>
    <Avatar
      class="inline-grid shrink-0 rounded-(--avatar-radius) align-middle outline -outline-offset-1 outline-black/10 [--avatar-radius:20%] *:col-start-1 *:row-start-1 *:rounded-(--avatar-radius) dark:outline-white/10"
    >
      <AvatarImage src="/profile-photo.jpg" class="size-full" />
    </Avatar>
  </PopoverTrigger>
  <PopoverContent
    side="bottom"
    align="end"
    class="isolate w-max min-w-64 overflow-y-auto rounded-xl bg-popover/75 p-1 outline outline-transparent backdrop-blur-xl supports-[grid-template-columns:subgrid]:grid supports-[grid-template-columns:subgrid]:grid-cols-[auto_1fr_1.5rem_0.5rem_auto]"
  >
    {#each navigationLinks as navLink (navLink.title)}
      {#if navLink.title === "Sign Out"}
        <div
          class="col-span-full mx-3.5 my-1 h-px border-0 bg-zinc-950/5 sm:mx-3 dark:bg-white/10"
          role="separator"
        ></div>
        <button
          class="group col-span-full grid cursor-pointer grid-cols-[auto_1fr_1.5rem_0.5rem_auto] items-center rounded-lg px-3.5 py-2.5 text-left text-base/6 text-sidebar-foreground forced-color-adjust-none hover:bg-sidebar-focus hover:text-white focus:outline-hidden focus-visible:bg-sidebar-focus focus-visible:text-white disabled:opacity-50 *:data-[slot=avatar]:mr-2.5 *:data-[slot=avatar]:-ml-1 *:data-[slot=avatar]:size-6 *:data-[slot=icon]:col-start-1 *:data-[slot=icon]:row-start-1 *:data-[slot=icon]:mr-2.5 *:data-[slot=icon]:-ml-0.5 *:data-[slot=icon]:size-5 *:data-[slot=icon]:text-sidebar-foreground hover:*:data-[slot=icon]:text-white focus-visible:*:data-[slot=icon]:text-white *:data-[slot=label]:col-start-2 *:data-[slot=label]:row-start-1 supports-[grid-template-columns:subgrid]:grid-cols-subgrid sm:px-3 sm:py-1.5 sm:text-sm/6 sm:*:data-[slot=avatar]:mr-2 sm:*:data-[slot=avatar]:size-5 sm:*:data-[slot=icon]:mr-2 sm:*:data-[slot=icon]:size-4"
          type="button"
          onclick={handleSignOut}>{navLink.title}</button
        >
      {:else}
        <a
          class="group col-span-full grid grid-cols-[auto_1fr_1.5rem_0.5rem_auto] items-center rounded-lg px-3.5 py-2.5 text-left text-base/6 text-sidebar-foreground forced-color-adjust-none hover:bg-sidebar-focus hover:text-white focus:outline-hidden focus-visible:bg-sidebar-focus focus-visible:text-white disabled:opacity-50 *:data-[slot=avatar]:mr-2.5 *:data-[slot=avatar]:-ml-1 *:data-[slot=avatar]:size-6 *:data-[slot=icon]:col-start-1 *:data-[slot=icon]:row-start-1 *:data-[slot=icon]:mr-2.5 *:data-[slot=icon]:-ml-0.5 *:data-[slot=icon]:size-5 *:data-[slot=icon]:text-sidebar-foreground hover:*:data-[slot=icon]:text-white focus-visible:*:data-[slot=icon]:text-white *:data-[slot=label]:col-start-2 *:data-[slot=label]:row-start-1 supports-[grid-template-columns:subgrid]:grid-cols-subgrid sm:px-3 sm:py-1.5 sm:text-sm/6 sm:*:data-[slot=avatar]:mr-2 sm:*:data-[slot=avatar]:size-5 sm:*:data-[slot=icon]:mr-2 sm:*:data-[slot=icon]:size-4"
          href={navLink.href}>{navLink.title}</a
        >
      {/if}
    {/each}
  </PopoverContent>
</Popover>
