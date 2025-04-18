<script>
  import { onMount } from "svelte";
  import { supabase } from "$lib/supabaseClient";

  let categories = $state([]);
  let isLoading = $state(true);

  const handleCategoryClick = async (item) => {
    const {data, error} = await supabase
      .from('Todos')
      .update({ categories_id: item.id })

    if (error) {
      console.log('Ошибка todos', + error.message)
    } else {
      console.log('Успешно', data)
    }

    window.Telegram.WebApp.close()
  }


  onMount(async () => {
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
