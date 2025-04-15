<script>
  import { onMount } from "svelte";
  import { supabase } from "$lib/supabaseClient";

  let tasks = $state([]);
  let isLoading = $state(true);

  onMount(async () => {
      const { data } = await supabase
        .from("Todos")
        .select("*")
        .limit(5)

      tasks = data || [];
  });
</script>

{#each tasks as task}
  <div>{task.text}</div>
{/each}