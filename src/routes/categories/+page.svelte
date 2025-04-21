<script>
  import { onMount } from "svelte";
  import { supabase } from "$lib/supabaseClient";
  import { page } from "$app/stores";
  import { get } from "svelte/store";

  let categories = $state([]);
  let isLoading = $state(true);
  let taskId = $state(null);

  const handleCategoryClick = async (item) => {
    if (!taskId) {
      console.error("Не найден taskId");
      return;
    }

    const { data, error } = await supabase
      .from("Todos")
      .update({ categories_id: item.id })
      .eq("id", taskId);

    if (error) {
      console.log("Ошибка", +error.message);
      alert("Ошибка при обновлений категорий");
    } else {
      if (window.Telegram?.WebApp) {
        window.Telegram?.WebApp.close();
      }
    }
  };

  onMount(async () => {
    const urlParams = new URLSearchParams(window.location.search);
    taskId = urlParams.get("task_id");
    console.log("Task ID", taskId);

    const { data, error } = await supabase.from("Categories").select("*");

    if (error) {
      console.error("Ошибка загрузки категорий:", error.message);
    } else {
      categories = data;
    }

    isLoading = false;

    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.expand();
      window.Telegram.WebApp.ready();
    }
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
