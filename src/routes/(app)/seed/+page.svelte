<script lang="ts">
  import { Button } from "$lib/components/ui/button"

  const handleSeedUser = async () => {
    try {
      const response = await fetch("/api/seed/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const result = await response.json()

      console.log(result)
    } catch (error) {
      console.error(error)
    }
  }
</script>

<div class="grid min-h-screen place-content-center">
  <Button onclick={handleSeedUser}>Seed user</Button>
</div>
