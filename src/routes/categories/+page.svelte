<script>
  import { onMount } from "svelte";
  import { supabase } from "$lib/supabaseClient";
  import { page } from "$app/stores";
  import { get } from "svelte/store";

  let categories = $state([]);
  let isLoading = $state(true);
  let taskId = null;

  const handleCategoryClick = async (item) => {
    if (!taskId) {
      console.log("Нет taskId");
      return;
    }

    const { data, error } = await supabase
      .from("Todos")
      .update({ categories_id: item.id })
      .eq("id", taskId);

    if (error) {
      console.log("Ошибка todos", +error.message);
    } else {
      console.log("Задача обновлена", data);
    }

    window.Telegram.WebApp.close();
  };

  onMount(async () => {
    const url = get(page).url;
    taskId = url.searchParams.get("taskId");
    const { data, error } = await supabase.from("Categories").select("*");

    if (error) {
      console.log("Ошибка" + error.message);
    } else {
      categories = data;
    }

    isLoading = false;
  });
</script>

<h1>Выберите категорию</h1>

<div class="list">
  {#each categories as item}
    <div on:click={() => handleCategoryClick(item)} class="item-list">
      {item.name}
    </div>
  {/each}
</div>

<style>
  .list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .item-list {
    cursor: pointer;
  }
</style>
