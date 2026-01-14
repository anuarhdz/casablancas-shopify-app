<script lang="ts">
  import type { User } from "$lib/auth-client"
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
  import { renderComponent } from "$lib/table"
  import type { ColumnDef } from "@tanstack/table-core"

  let { data } = $props()

  let tableData = $derived<User[]>(data.listUsers.users)

  const windowSize = useWindowSize({ defaultHeight: 760 })
  const gridHeight = $derived(Math.max(400, windowSize.height - 150))

  const filterFn = getFilterFn<User>()

  const columns: ColumnDef<User, unknown>[] = [
    {
      id: "select",
      size: 40,
      enableSorting: false,
      enableHiding: false,
      enableResizing: false,
      header: ({ table }) => renderComponent(RowSelectHeader, { table }),
      meta: {
        label: "Select",
        cell: {
          variant: "row-select",
        },
      },
    },
    {
      id: "name",
      accessorKey: "name",
      header: "Name",
      minSize: 180,
      filterFn,
      meta: {
        label: "Name",
        cell: {
          variant: "short-text",
        },
      },
    },
    {
      id: "email",
      accessorKey: "email",
      header: "Email",
      minSize: 240,
      filterFn,
      meta: {
        label: "Email",
        cell: {
          variant: "short-text",
        },
      },
    },
    {
      id: "role",
      accessorKey: "role",
      header: "Role",
      minSize: 240,
      filterFn,
      meta: {
        label: "Role",
        cell: {
          variant: "short-text",
        },
      },
    },
    {
      id: "createdAt",
      accessorKey: "createdAt",
      header: "Created At",
      minSize: 150,
      filterFn,
      cell: ({ row }) => row.original.createdAt.toLocaleDateString(),
      meta: {
        label: "Created At",
        cell: {
          variant: "date",
        },
      },
    },
    {
      id: "updatedAt",
      accessorKey: "updatedAt",
      header: "Updated At",
      minSize: 150,
      filterFn,
      cell: ({ row }) => row.original.updatedAt.toLocaleDateString(),
      meta: {
        label: "Created At",
        cell: {
          variant: "date",
        },
      },
    },
    {
      id: "banned",
      accessorKey: "banned",
      header: "Banned",
      minSize: 140,
      filterFn,
      meta: {
        label: "Banned",
        cell: {
          variant: "checkbox",
        },
      },
    },
    {
      id: "banReason",
      accessorKey: "banReason",
      header: "Ban Reason",
      minSize: 240,
      filterFn,
      meta: {
        label: "Ban Reason",
        cell: {
          variant: "short-text",
        },
      },
    },
    {
      id: "banExpires",
      accessorKey: "banExpires",
      header: "Ban Expires",
      minSize: 240,
      filterFn,
      cell: ({ row }) => row.original.banExpires?.toLocaleDateString(),
      meta: {
        label: "Ban Expires",
        cell: {
          variant: "date",
        },
      },
    },
  ]

  const { table, ...dataGridProps } = useDataGrid({
    data: () => tableData,
    columns,
    onDataChange: (newData) => {
      tableData = newData
    },
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
  <title>Users Management - Segreto Dashboard</title>
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
  <!-- svelte-ignore state_referenced_locally -->
  <DataGrid {...dataGridProps} {table} height={gridHeight} />
</div>
