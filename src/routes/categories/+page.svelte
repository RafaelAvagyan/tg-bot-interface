<script>
  import { onMount } from "svelte";
  import { supabase } from "$lib/supabaseClient";
  import { page } from "$app/stores";
  import { get } from "svelte/store";

  let categories = $state([]);
  let isLoading = $state(true);
  let selectedCategory = $state(null);

  onMount(async () => {
    const { data, error } = await supabase.from("Categories").select("*");

    if (error) {
      console.error("Ошибка загрузки категорий:", error.message);
    } else {
      categories = data;
    }

    isLoading = false;
  });

  const handleCategoryClick = async (category) => {
    selectedCategory = category.id;
    console.log("Выбрана категория ID:", category.id);

    const testTaskId = 1;

    const { data, error } = await supabase
      .from("Todos")
      .update({ categories_id: category.id })
      .eq("id", testTaskId)
      .select();

    if (error) {
      console.error("Ошибка обновления:", error);
      alert("Ошибка при обновлении категории!");
    } else {
      console.log("Успешно обновлено:", data);
      alert(`Категория "${category.name}" записана в задачу!`);
    }

    window.Telegram?.WebApp.close();
  };
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
