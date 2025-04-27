<script>
  import { onMount } from "svelte";
  import { supabase } from "$lib/supabaseClient";

  let tasks = $state([]);
  let categories = $state([]);
  let filteredTasks = $state([]);
  let isLoading = $state(true);
  let selectedCategoryId = $state(null);

  let telegramUser = $state(null);

  // Объединяем логику в одном onMount
  onMount(async () => {
    // Проверяем, что Telegram-объект доступен в глобальном контексте
    if (typeof window !== "undefined" && window.Telegram?.WebApp) {
      // Проверка данных из мини-приложения
      if (window.Telegram.WebApp.initDataUnsafe?.user) {
        telegramUser = window.Telegram.WebApp.initDataUnsafe.user;
        console.log("Мини-приложение открыл пользователь:", telegramUser);
      } else {
        console.log("Пользовательские данные не найдены.");
      }

      // Инициализация Telegram WebApp
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();

      // Функция для обработки авторизации через Telegram
      window.handleTelegramAuth = (user) => {
        telegramUser = user;
        console.log("Пользователь авторизован через браузер:", telegramUser);
      };
    }

    // Загружаем данные из Supabase
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
    return status === 1 ? "В ожидании" : "В работе";
  }
</script>

{#if telegramUser}
  <h1>Добро пожаловать, {telegramUser.first_name}!</h1>
  <p>@{telegramUser.username}</p>
  <p>ID: {telegramUser.id}</p>
  {#if telegramUser.photo_url}
    <img
      src={telegramUser.photo_url}
      alt="Avatar"
      width="100"
      style="border-radius: 50%;"
    />
  {/if}
{:else}
  <h1>Вы не авторизованы</h1>
  <div id="telegram-login-button"></div>
  <script
    async
    src="https://telegram.org/js/telegram-widget.js?22"
    data-telegram-login="CreateTodoBot"
    data-size="large"
    data-userpic="true"
    data-radius="12"
    data-request-access="write"
    data-on-auth="handleTelegramAuth"
  ></script>
{/if}

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
