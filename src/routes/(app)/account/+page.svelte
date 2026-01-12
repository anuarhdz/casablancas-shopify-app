<script lang="ts">
  import { Card, CardContent, CardHeader, CardTitle } from "$lib/components/ui/card"
  import { codeToHtml } from "shiki"

  let { data } = $props()
  let code = $state("")

  $effect(() => {
    const json = JSON.stringify(data.user, null, 2)
    codeToHtml(json, {
      theme: "material-theme-lighter",
      lang: "json",
    }).then((html) => {
      code = html
    })
  })
</script>

<div class="mx-auto w-full max-w-2xl py-5 lg:py-10">
  <Card>
    <CardHeader>
      <CardTitle>Account Details</CardTitle>
    </CardHeader>
    <CardContent>
      <div class="overflow-hidden rounded-lg ring ring-border *:p-2 *:text-sm">
        {@html code}
      </div>
    </CardContent>
  </Card>
</div>
