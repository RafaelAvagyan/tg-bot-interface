<script>
  import { onMount } from "svelte";
  import { supabase } from "$lib/supabaseClient";

  let tasks = $state([]);
  let isLoading = $state(true);

  onMount(async () => {
    if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.ready()
        window.Telegram.WebApp.expand()
    }
      const { data } = await supabase
        .from("Todos")
        .select("*")
        .limit(5)

      tasks = data || [];
      isLoading = false
  });
</script>

{#each tasks as task}
  <div>{task.text}</div>
{/each}
<a href="/test">Test</a>