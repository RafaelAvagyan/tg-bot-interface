<script>
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabaseClient';
  import TelegramAuthButton from '$lib/components/TelegramAuthButton.svelte';
  import { page } from '$app/stores';

  let tasks = $state([]);
  let categories = $state([]);
  let filteredTasks = $state([]);
  let isLoading = $state(true);
  let selectedCategoryId = $state(null);
  let user = $state(null);
  let showAuthButton = $state(false);

  async function checkAuth() {
    // Проверка Telegram Mini App
    if (window.Telegram?.WebApp?.initDataUnsafe?.user) {
      const tgUser = window.Telegram.WebApp.initDataUnsafe.user;
      user = await handleTelegramUser(tgUser);
      return;
    }

    // Проверка сессии Supabase
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      user = session.user;
      return;
    }

    showAuthButton = true;
  }

  async function handleTelegramUser(tgUser) {
    const userData = {
      telegramId: tgUser.id,
      name: `${tgUser.first_name} ${tgUser.last_name || ""}`.trim(),
      isAdmin: false,
    };

    const { data, error } = await supabase
      .from("Users")
      .upsert(userData, { onConflict: "telegramId" })
      .select()
      .single();

    if (error) console.error("User error:", error);
    return data;
  }

  async function loadData() {
    const [categoriesRes, tasksRes] = await Promise.all([
      supabase.from("Categories").select("*"),
      supabase.from("Todos").select("*"),
    ]);

    categories = categoriesRes.data || [];
    tasks = tasksRes.data || [];
    filteredTasks = tasks;
    isLoading = false;
  }

  onMount(async () => {
    await checkAuth();
    loadData();
    
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
    }
  });

  function filterTasksByCategory(itemId) {
    selectedCategoryId = itemId;
    filteredTasks = tasks.filter((task) => task.categories_id === itemId);
  }

  function showStatus(status) {
    return status === 1 ? "В ожидании" : "В работе";
  }
</script>

<div class="main">
  {#if !user && showAuthButton}
    <div class="auth-overlay">
      <h2>Для работы с приложением требуется авторизация</h2>
      <TelegramAuthButton 
        botUsername="CreateTodoBot" 
        authUrl={`/api/auth/telegram?return=${$page.url.pathname}`} 
      />
    </div>
  {:else}
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
  {/if}
</div>

<style>
  .auth-overlay {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
    gap: 1rem;
  }
  
  .categories {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
    flex-wrap: wrap;
  }
  
  .category {
    padding: 0.5rem 1rem;
    background: #eee;
    border-radius: 0.5rem;
    cursor: pointer;
  }
  
  .category.selected {
    background: #007bff;
    color: white;
  }
  
  ul {
    list-style: none;
    padding: 0;
  }
  
  li {
    margin-bottom: 1rem;
    border: 1px solid #ddd;
    border-radius: 0.5rem;
    padding: 1rem;
  }
  
  .item {
    margin-bottom: 0.5rem;
  }
</style>