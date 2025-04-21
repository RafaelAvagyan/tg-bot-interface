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

    const { error } = await supabase
      .from("Todos")
      .update({ categories_id: item.id })
      .eq("id", taskId);

    if (error) {
      console.error("Ошибка обновления:", error);
      alert("Ошибка при обновлении категории!");
      return;
    }

    // Отправляем данные обратно в бота
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.sendData(
        JSON.stringify({
          action: "category_selected",
          category_id: item.id,
          category_name: item.name,
          task_id: taskId
        })
      );
      window.Telegram.WebApp.close();
    }
  };

  onMount(async () => {
    const urlParams = new URLSearchParams(window.location.search);
    taskId = urlParams.get("task_id");
    console.log("Task ID:", taskId);

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

{#if isLoading}
  <p>Загрузка категорий...</p>
{:else}
  <div class="list">
    {#each categories as item}
      <button on:click={() => handleCategoryClick(item)} class="item-list">
        {item.name}
      </button>
    {/each}
  </div>
{/if}

<style>
  .list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .item-list {
    padding: 12px;
    background: var(--tg-theme-secondary-bg-color, #f3f3f3);
    border-radius: 8px;
    cursor: pointer;
    transition: background 0.2s;
  }

  .item-list:hover {
    background: var(--tg-theme-button-color, #2481cc);
    color: var(--tg-theme-button-text-color, #fff);
  }
</style>