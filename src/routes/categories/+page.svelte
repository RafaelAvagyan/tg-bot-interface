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

    const tg = window.Telegram?.WebApp;

    if (tg) {
      console.log("Telegram WebApp найден, отправка данных...");
      tg.sendData(
        JSON.stringify({
          task_id: taskId,
          category_id: item.id,
        })
      );
      tg.close();
    } else {
      console.log("Telegram WebApp НЕ найден");
    }
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
