<script lang="ts">
  import { enhance } from "$app/forms"
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
  import { Button } from "$lib/components/ui/button"
  import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "$lib/components/ui/dialog"
  import {
    Field,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
    FieldSet,
  } from "$lib/components/ui/field"
  import { Input } from "$lib/components/ui/input"
  import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
  } from "$lib/components/ui/select"
  import { Spinner } from "$lib/components/ui/spinner"
  import { useDataGrid } from "$lib/hooks/use-data-grid.svelte"
  import { useWindowSize } from "$lib/hooks/use-window-size.svelte"
  import { renderComponent } from "$lib/table"
  import type { ColumnDef } from "@tanstack/table-core"
  import { toast } from "svelte-sonner"

  let { data, form } = $props()

  let selectedRole = $state("")
  const roles = [
    { value: "user", label: "User" },
    { value: "admin", label: "Admin" },
  ]
  let rolesLabel = $derived(
    roles.find((r) => r.value === selectedRole)?.label ?? "Choose role"
  )
  let open = $state(false)
  let pending = $state(false)

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
      header: "Full Name",
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

  const id = $props.id()
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
    <div class="flex items-center gap-4">
      <Dialog bind:open>
        <DialogTrigger>
          {#snippet child({ props })}
            <Button {...props}>New User</Button>
          {/snippet}
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create new user</DialogTitle>
            <DialogDescription
              >The user’s initial password will be their email address. They’ll be asked
              to change it on first login. All user details can be edited later from their
              profile.</DialogDescription
            >
          </DialogHeader>
          <div>
            <form
              id="createUserForm"
              method="POST"
              novalidate
              use:enhance={() => {
                pending = true
                return async ({ result, update }) => {
                  if (result.type === "success") {
                    open = false
                    toast.success("User successfully created")
                  }

                  pending = false
                  await update()
                }
              }}
            >
              <FieldSet>
                <FieldGroup>
                  <Field data-invalid={form?.errors?.fullName ? "" : undefined}>
                    <FieldLabel for="fullName-{id}">Full name</FieldLabel>
                    <Input
                      id="fullName-{id}"
                      name="fullName"
                      type="text"
                      inputmode="text"
                      autocomplete="off"
                      enterkeyhint="next"
                      placeholder="John Doe"
                      aria-invalid={form?.errors?.fullName ? "true" : "false"}
                    />
                    {#if form?.errors?.fullName}
                      <FieldError>{form.errors.fullName}</FieldError>
                    {/if}
                  </Field>

                  <Field data-invalid={form?.errors?.email ? "" : undefined}>
                    <FieldLabel for="email-{id}">Email</FieldLabel>
                    <Input
                      id="email-{id}"
                      name="email"
                      type="email"
                      inputmode="email"
                      autocomplete="off"
                      enterkeyhint="next"
                      placeholder="example@email.com"
                      aria-invalid={form?.errors?.email ? "true" : "false"}
                    />
                    {#if form?.errors?.email}
                      <FieldError>{form.errors.email}</FieldError>
                    {/if}
                  </Field>

                  <Field data-invalid={form?.errors?.role ? "" : undefined}>
                    <FieldLabel for="role-{id}">Role</FieldLabel>
                    <Select type="single" bind:value={selectedRole}>
                      <SelectTrigger
                        id="role-{id}"
                        aria-invalid={form?.errors?.role ? "true" : "false"}
                        >{rolesLabel}</SelectTrigger
                      >
                      <SelectContent>
                        {#each roles as role (role.value)}
                          <SelectItem {...role} />
                        {/each}
                      </SelectContent>
                    </Select>
                    <input type="hidden" value={selectedRole} name="role" />
                    <FieldDescription
                      >Define the level of permissions the user will have.</FieldDescription
                    >
                    {#if form?.errors?.role}
                      <FieldError>{form.errors.role}</FieldError>
                    {/if}
                  </Field>

                  <Field orientation="horizontal">
                    <Button type="submit" disabled={pending}>
                      {#if pending}
                        <Spinner />
                      {/if}
                      Submit
                    </Button>
                  </Field>
                </FieldGroup>
              </FieldSet>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  </div>
  <!-- svelte-ignore state_referenced_locally -->
  <DataGrid {...dataGridProps} {table} height={gridHeight} />
</div>
