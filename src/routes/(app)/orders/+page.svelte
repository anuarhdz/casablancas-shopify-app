<script lang="ts">
  import {
    DataGrid,
    DataGridFilterMenu,
    DataGridKeyboardShortcuts,
    DataGridRowHeightMenu,
    DataGridSortMenu,
    DataGridViewMenu,
    getFilterFn,
  } from "$lib/components/data-grid"
  import { RowSelectHeader } from "$lib/components/data-grid/cells"
  import { useDataGrid } from "$lib/hooks/use-data-grid.svelte"
  import { useWindowSize } from "$lib/hooks/use-window-size.svelte"
  import type { Order } from "$lib/shopify.types"
  import { renderComponent } from "$lib/table"
  import type { ColumnDef, Table } from "@tanstack/table-core"
  let { data } = $props()
  let tableData = $derived<Order[]>(data.orders ?? [])

  const windowSize = useWindowSize({ defaultHeight: 760 })
  const gridHeight = $derived(Math.max(400, windowSize.height - 150))

  const filterFn = getFilterFn<Order>()

  const columns: ColumnDef<Order, unknown>[] = [
    {
      id: "select",
      size: 40,
      enableSorting: false,
      enableHiding: false,
      enableResizing: false,
      header: ({ table }: { table: Table<Order> }) =>
        renderComponent(RowSelectHeader, { table }),
      meta: {
        label: "Select",
        cell: {
          variant: "row-select",
        },
      },
    },
    {
      id: "id",
      filterFn,
      accessorKey: "id",
      header: "ID",
      meta: { cell: { variant: "short-text" } },
    },
    {
      id: "createdAt",
      filterFn,
      minSize: 200,
      accessorKey: "createdAt",
      header: "Created",
      meta: { cell: { variant: "short-text" } },
    },
    {
      id: "name",
      filterFn,
      accessorKey: "name",
      header: "Order name",
      meta: { cell: { variant: "short-text" } },
    },
    {
      id: "customerId",
      filterFn,
      accessorKey: "customerId",
      header: "Customer ID",
      meta: { cell: { variant: "short-text" } },
    },
    {
      id: "customerName",
      filterFn,
      minSize: 250,
      accessorKey: "customerName",
      header: "Customer name",
      meta: { cell: { variant: "short-text" } },
    },
    {
      id: "email",
      filterFn,
      minSize: 250,
      accessorKey: "email",
      header: "Customer email",
      meta: { cell: { variant: "short-text" } },
    },
    {
      id: "note",
      filterFn,
      minSize: 320,
      accessorKey: "note",
      header: "Note",
      meta: { cell: { variant: "long-text" } },
    },
    {
      id: "lineItemsTotal",
      filterFn,
      accessorKey: "lineItemsTotal",
      header: "Line items",
      meta: { cell: { variant: "number" } },
    },
    {
      id: "total",
      filterFn,
      minSize: 180,
      accessorKey: "total",
      header: "Total",
      meta: { cell: { variant: "short-text" } },
    },
    {
      id: "financialStatus",
      filterFn,
      minSize: 180,
      accessorKey: "financialStatus",
      header: "Financial status",
      meta: { cell: { variant: "short-text" } },
    },
    {
      id: "fulfillmentStatus",
      filterFn,
      minSize: 180,
      accessorKey: "fulfillmentStatus",
      header: "Fulfillment status",
      meta: { cell: { variant: "short-text" } },
    },
  ]

  const { table, ...dataGridProps } = useDataGrid({
    data: () => tableData,
    columns,
    onDataChange: (newData) => {
      tableData = newData
    },
    rowHeight: "extra-tall",
    getRowId: (row) => row.id,
    enableSearch: false,
    initialState: {
      columnPinning: {
        left: ["select"],
      },
    },
  })
</script>

<svelte:head>
  <title>Orders - Segreto Dashboard</title>
</svelte:head>

<div class="flex flex-col gap-4">
  <div
    role="toolbar"
    aria-orientation="horizontal"
    class="flex items-center justify-between"
  >
    <DataGridKeyboardShortcuts enableSearch={!!dataGridProps.searchState} />
    <div class="flex items-center gap-2">
      <DataGridFilterMenu {table} />
      <DataGridSortMenu {table} />
      <DataGridRowHeightMenu {table} />
      <DataGridViewMenu {table} />
    </div>
  </div>
  <DataGrid {...dataGridProps} {table} height={gridHeight} />
</div>
