<script lang="ts">
  import { Button } from "$lib/components/ui/button"
  import {
    Item,
    ItemActions,
    ItemContent,
    ItemDescription,
    ItemGroup,
    ItemSeparator,
    ItemTitle,
  } from "$lib/components/ui/item"
  import { cn } from "$lib/utils"
  import { CheckCircle2, RefreshCw, XCircle } from "@lucide/svelte"

  interface DataItem {
    handle: string
    title: string
    description: string
  }

  const dataItems: DataItem[] = [
    {
      handle: "products",
      title: "Products",
      description: "Sync products, variants, and media from Shopify",
    },
    {
      handle: "orders",
      title: "Orders",
      description: "Sync orders and customer data (coming soon)",
    },
    {
      handle: "customers",
      title: "Customers",
      description: "Sync customer information (coming soon)",
    },
  ]

  type SyncStatus = "idle" | "starting" | "polling" | "processing" | "success" | "error"

  let pending = $state(false)
  let syncBy = $state("")
  let syncStatus = $state<SyncStatus>("idle")
  let statusMessage = $state("")
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let lastResult = $state<any>(null)

  const handleSync = async (handler: string) => {
    pending = true
    syncBy = handler
    lastResult = null
    syncStatus = "starting"
    statusMessage = "Initiating bulk operation..."

    try {
      const response = await fetch("/api/sync/products", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
      })

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ message: "Unknown error" }))
        throw new Error(errorData.message || "Failed to sync")
      }

      const result = await response.json()

      if (result) {
        syncStatus = "polling"
        statusMessage = `Waiting for Shopify to prepare data... (Operation: ${result.id.split("/").pop()})`

        // Automatically start polling and processing
        const encodedId = encodeURIComponent(result.id)
        const statusResponse = await fetch(`/api/sync/products/status/${encodedId}`, {
          method: "POST",
        })

        if (!statusResponse.ok) {
          const statusError = await statusResponse
            .json()
            .catch(() => ({ error: "Unknown error" }))
          throw new Error(statusError.error || "Failed to process bulk operation")
        }

        const statusResult = await statusResponse.json()

        syncStatus = "success"
        statusMessage = `Successfully synced ${statusResult.objectCount} records!`
        lastResult = { ...result, statusResult }

        // Clear success message after 5 seconds
        setTimeout(() => {
          if (syncStatus === "success") {
            syncStatus = "idle"
            statusMessage = ""
          }
        }, 5000)
      }
    } catch (err) {
      console.error("Sync error:", err)
      syncStatus = "error"
      statusMessage = err instanceof Error ? err.message : "Failed to start sync"
      lastResult = { error: err instanceof Error ? err.message : "Failed to start sync" }
    } finally {
      pending = false
      syncBy = ""
    }
  }
</script>

{#snippet BlockItem(dataItem: DataItem, renderSeparator: boolean)}
  <Item>
    <ItemContent>
      <ItemTitle>{dataItem.title}</ItemTitle>
      <ItemDescription>{dataItem.description}</ItemDescription>
    </ItemContent>
    <ItemActions>
      <Button
        onclick={() => handleSync(dataItem.handle)}
        disabled={pending || dataItem.handle !== "products"}
        variant="outline"
        size="sm"
      >
        {#if pending && syncBy === dataItem.handle}
          <RefreshCw class="animate-spin" />
        {:else if syncStatus === "success" && syncBy === dataItem.handle}
          <CheckCircle2 class="text-green-600" />
        {:else if syncStatus === "error" && syncBy === dataItem.handle}
          <XCircle class="text-red-600" />
        {:else}
          <RefreshCw />
        {/if}
        {pending && syncBy === dataItem.handle ? "Syncing..." : "Start Sync"}
      </Button>
    </ItemActions>
  </Item>
  {#if renderSeparator}
    <ItemSeparator />
  {/if}
{/snippet}

<div class="max-w-4xl space-y-4">
  <ItemGroup class="rounded-lg border">
    {#each dataItems as dataItem, index (dataItem.handle)}
      {@render BlockItem(dataItem, index !== dataItems.length - 1)}
    {/each}
  </ItemGroup>

  {#if statusMessage}
    <div
      class={cn(
        "rounded-lg border p-4 transition-all",
        syncStatus === "success" &&
          "border-green-600/50 bg-green-50 dark:bg-green-950/20",
        syncStatus === "error" && "border-red-600/50 bg-red-50 dark:bg-red-950/20",
        (syncStatus === "starting" || syncStatus === "polling") &&
          "border-blue-600/50 bg-blue-50 dark:bg-blue-950/20"
      )}
    >
      <div class="flex items-start gap-3">
        <div class="mt-0.5">
          {#if syncStatus === "success"}
            <CheckCircle2 class="h-5 w-5 text-green-600" />
          {:else if syncStatus === "error"}
            <XCircle class="h-5 w-5 text-red-600" />
          {:else}
            <RefreshCw class="h-5 w-5 animate-spin text-blue-600" />
          {/if}
        </div>
        <div class="flex-1">
          <p
            class={cn(
              "text-sm font-medium",
              syncStatus === "success" && "text-green-900 dark:text-green-100",
              syncStatus === "error" && "text-red-900 dark:text-red-100",
              (syncStatus === "starting" || syncStatus === "polling") &&
                "text-blue-900 dark:text-blue-100"
            )}
          >
            {statusMessage}
          </p>
          {#if syncStatus === "polling"}
            <p class="mt-1 text-xs text-blue-700 dark:text-blue-300">
              This may take a few minutes depending on the data volume...
            </p>
          {/if}
        </div>
      </div>
    </div>
  {/if}

  {#if syncStatus === "success" && lastResult?.statusResult}
    <div class="rounded-lg border bg-card p-4">
      <h3 class="mb-3 text-sm font-semibold">Sync Summary</h3>
      <div class="grid grid-cols-2 gap-4">
        <div class="space-y-1">
          <p class="text-xs text-muted-foreground">Total Records</p>
          <p class="text-2xl font-bold">{lastResult.statusResult.objectCount}</p>
        </div>
        <div class="space-y-1">
          <p class="text-xs text-muted-foreground">Status</p>
          <p class="flex items-center gap-1 text-sm font-medium text-green-600">
            <CheckCircle2 class="h-4 w-4" />
            Completed
          </p>
        </div>
      </div>
      {#if lastResult.bulkOperation}
        <div class="mt-3 border-t pt-3">
          <p class="text-xs text-muted-foreground">Operation ID</p>
          <p class="mt-1 font-mono text-xs break-all">
            {lastResult.bulkOperation.id.split("/").pop()}
          </p>
        </div>
      {/if}
    </div>
  {/if}

  {#if syncStatus === "error" && lastResult?.error}
    <div class="rounded-lg border border-red-600/50 bg-red-50 p-4 dark:bg-red-950/20">
      <h3 class="mb-2 text-sm font-semibold text-red-900 dark:text-red-100">
        Error Details
      </h3>
      <p class="text-xs wrap-break-word text-red-800 dark:text-red-200">
        {lastResult.error}
      </p>
    </div>
  {/if}
</div>
