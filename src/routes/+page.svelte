<script>
  import { onMount } from "svelte";
  import { supabase } from "$lib/supabaseClient";

  let tasks = $state([]);
  let categories = $state([]);
  let filteredTasks = $state([]);
  let isLoading = $state(true);
  let selectedCategoryId = $state(null);

  onMount(async () => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
    }

    const [categoriesRes, tasksRes] = await Promise.all([
      supabase.from("Categories").select("*"),
      supabase.from("Todos").select("*"),
    ]);

    categories = categoriesRes.data || [];
    tasks = tasksRes.data || [];
    filteredTasks = tasks;
    console.log(filteredTasks, "tasks");

    isLoading = false;
  });

  const filterTasksByCategory = (itemId) => {
    selectedCategoryId = itemId;
    filteredTasks = tasks.filter((task) => task.categories_id === itemId);
  };

  function showStatus(status) {
    if (status === 1) {
      return "В ожидании";
    } else {
      return "В работе";
    }
  }
</script>

<h1>Главная</h1>
{#if isLoading}
  <p>Загрузка...</p>
{:else}
  <div class="categories">
    {#each categories as category}
      <div
        class="category {selectedCategoryId === category.id ? 'selected' : ''}"
        on:click={() => filterTasksByCategory(category.id)}
      >
        {category.name}
      </div>
    {/each}
    {#if selectedCategoryId}
      <div
        class="category {selectedCategoryId === null ? 'selected' : ''}"
        on:click={() => {
          selectedCategoryId = null;
          filteredTasks = tasks;
        }}
      >
        Показать все задачи
      </div>
    {/if}
  </div>

  <h2>📋 Задачи</h2>
  {#if filteredTasks.length > 0}
    <table></table>
    <ul>
      {#each filteredTasks as task}
        <li>
          <a href={`/task/${task.id}`}>
            <div class="item">
              <strong>Автор:</strong>
              <div>{task.original_author}</div>
            </div>
            <div class="item">
              <strong>Задача:</strong>
              <div>{task.text}</div>
            </div>
            <div class="item">
              <strong>Статус:</strong>
              <div>{showStatus(task.status)}</div>
            </div>
            <div class="item">
              <strong>Дата создания:</strong>
              <div>{task.created_at}</div>
            </div>
          </a>
        </li>
      {/each}
    </ul>
  {:else}
    <p>Нет задач в этой категории.</p>
  {/if}
{/if}

<style>
  .categories {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .category {
    padding: 0.8rem 1.2rem;
    background-color: #f2f2f2;
    border-radius: 10px;
    cursor: pointer;
    font-weight: bold;
  }

  .selected {
    background-color: #007aff;
    color: white;
  }

  ul {
    list-style: none;
    padding-left: 0;
  }

  li {
    padding: 1rem;
    background: #f8f8f8;
    border-left: 4px solid #007aff;
    border-radius: 8px;
    margin-bottom: 0.7rem;
    line-height: 1.4;
    cursor: pointer;
  }

  .item {
    display: flex;
    gap: 5px;
  }

  a {
    text-decoration: none;
    color: inherit;
  }
</style>
