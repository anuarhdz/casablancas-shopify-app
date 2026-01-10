<script lang="ts">
  import { resolve } from "$app/paths"
  import { Button } from "$lib/components/ui/button"
  import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from "$lib/components/ui/card"
  import {
    Item,
    ItemActions,
    ItemContent,
    ItemDescription,
    ItemMedia,
    ItemTitle,
  } from "$lib/components/ui/item"
  import { Skeleton } from "$lib/components/ui/skeleton"
  import { getShopData } from "$lib/shop.remote"
  import {
    ChevronRightIcon,
    CircleCheck,
    Cog,
    Inbox,
    Tag,
    UsersRound,
    X,
  } from "@lucide/svelte"

  const shopData = getShopData()
</script>

<div class="flex flex-col items-center gap-8 lg:gap-10">
  <div class="prose text-center">
    <h1>Shopify Dashboard</h1>
    <p class="lead">Shopify store connection info.</p>
  </div>
  <div class="w-full max-w-4xl">
    <div class="grid grid-cols-4 gap-4">
      <div class="col-span-full">
        {#if shopData.error}
          <Card>
            <CardHeader>
              <CardTitle>Store is not connnected</CardTitle>
              <CardContent>
                <div class="flex justify-center">
                  <Button variant="outline">Connect</Button>
                </div>
              </CardContent>
            </CardHeader>
          </Card>
        {:else if shopData.loading}
          <Card>
            <CardHeader>
              <CardTitle>
                <Skeleton class="w-full" />
              </CardTitle>
              <CardDescription><Skeleton class="w-full" /></CardDescription>
              <CardContent>
                <div class="flex flex-col gap-4">
                  <div class="flex items-center gap-1 text-base text-foreground">
                    <Skeleton class="size-4 rounded-full" />
                    <Skeleton class="h-4 w-25" />
                  </div>
                </div>
              </CardContent>
            </CardHeader>
          </Card>
        {:else}
          <Card>
            <CardHeader>
              <CardTitle>Connection Status</CardTitle>
              <CardDescription
                >Eu ad officia mollit magna ullamco do ad non sint anim nisi.</CardDescription>
            </CardHeader>
            <CardContent>
              <div class="flex flex-col gap-5">
                <div class="flex items-center gap-1 text-base text-foreground">
                  {#if shopData.current?.accessToken}
                    <CircleCheck />
                    <p>Connected</p>
                  {:else}
                    <X />
                    <p>Disconnected</p>
                  {/if}
                </div>
                <div class="flex flex-col gap-2 text-sm">
                  <p>
                    <span class="font-semibold">Shop domain:</span>
                    {shopData.current?.shopDomain}
                  </p>
                  <p>
                    <span class="font-semibold">Last update: </span>
                    <span
                      class="inline-block rounded-sm bg-accent p-1 font-mono text-xs text-accent-foreground"
                      >{shopData.current?.updatedAt.toISOString()}</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        {/if}
      </div>

      <div class="col-span-2">
        <Item
          variant="outline"
          size="sm">
          {#snippet child({ props })}
            <a
              href={resolve("/")}
              {...props}>
              <ItemMedia>
                <Inbox class="size-5" />
              </ItemMedia>
              <ItemContent>
                <ItemTitle>Orders</ItemTitle>
                <ItemDescription>Manage orders and draft orders.</ItemDescription>
              </ItemContent>
              <ItemActions>
                <ChevronRightIcon class="size-4" />
              </ItemActions>
            </a>
          {/snippet}
        </Item>
      </div>
      <div class="col-span-2">
        <Item
          variant="outline"
          size="sm">
          {#snippet child({ props })}
            <a
              href={resolve("/")}
              {...props}>
              <ItemMedia>
                <Tag class="size-5" />
              </ItemMedia>
              <ItemContent>
                <ItemTitle>Products</ItemTitle>
                <ItemDescription>Manage products.</ItemDescription>
              </ItemContent>
              <ItemActions>
                <ChevronRightIcon class="size-4" />
              </ItemActions>
            </a>
          {/snippet}
        </Item>
      </div>
      <div class="col-span-2">
        <Item
          variant="outline"
          size="sm">
          {#snippet child({ props })}
            <a
              href={resolve("/")}
              {...props}>
              <ItemMedia>
                <UsersRound class="size-5" />
              </ItemMedia>
              <ItemContent>
                <ItemTitle>Customers</ItemTitle>
                <ItemDescription>Manage customers.</ItemDescription>
              </ItemContent>
              <ItemActions>
                <ChevronRightIcon class="size-4" />
              </ItemActions>
            </a>
          {/snippet}
        </Item>
      </div>
      <div class="col-span-2">
        <Item
          variant="outline"
          size="sm">
          {#snippet child({ props })}
            <a
              href={resolve("/")}
              {...props}>
              <ItemMedia>
                <Cog class="size-5" />
              </ItemMedia>
              <ItemContent>
                <ItemTitle>Settings</ItemTitle>
                <ItemDescription>Manage app settings.</ItemDescription>
              </ItemContent>
              <ItemActions>
                <ChevronRightIcon class="size-4" />
              </ItemActions>
            </a>
          {/snippet}
        </Item>
      </div>
    </div>
  </div>
</div>
