<script>
  import { onMount } from "svelte";
  import { supabase } from "$lib/supabaseClient";

  let tasks = $state([]);
  let categories = $state([]);
  let filteredTasks = $state([]);
  let isLoading = $state(true);
  let selectedCategoryId = $state(null);

  let telegramUser = $state(null);
  let showTelegramButton = $state(false);

  onMount(async () => {
    if (window.Telegram?.WebApp?.initDataUnsafe?.user) {
      telegramUser = window.Telegram.WebApp.initDataUnsafe.user;
      console.log("Открыто в Telegram:", telegramUser);
      await addUser(telegramUser);
    } else {
      showTelegramButton = true;
      console.log("Режим браузера - показываем кнопку");
    }
  });

  async function addUser(user) {
    const userData = {
      telegramId: user.id,
      name: `${user.first_name} ${user.last_name || ""}`.trim(),
      isAdmin: false,
    };

    const { data, error } = await supabase
      .from("Users")
      .insert(userData)
      .select();

    if (error) {
      console.log("Ошибка добавление пользователя", error.message);
    }
  }

  // function loadTelegramAuth() {
  //   const script = document.createElement("script");
  //   script.src = "https://telegram.org/js/telegram-widget.js?22";
  //   script.async = true;
  //   script.setAttribute("data-telegram-login", "CreateTodoBot");
  //   script.setAttribute(
  //     "data-auth-url",
  //     "https://tg-bot-interface.vercel.app/"
  //   );
  //   script.setAttribute("data-request-access", "write");

  //   script.onload = () => {
  //     console.log("Telegram Widget загружен");
  //   };

  //   document.body.appendChild(script);
  // }

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

{#if telegramUser}
  <div class="user-panel">
    <h2>Привет, {telegramUser.first_name}!</h2>
    <p>ID: {telegramUser.id}</p>
    {#if telegramUser.username}
      <p>@{telegramUser.username}</p>
    {/if}
  </div>
{/if}
<!-- {:else if showTelegramButton}
  <div class="auth-panel">
    <button on:click={loadTelegramAuth} class="tg-button">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="#0088cc">
        <path
          d="M12 0C5.373 0 0 5.373 0 12C0 18.627 5.373 24 12 24C18.627 24 24 18.627 24 12C24 5.373 18.627 0 12 0ZM18.578 7.2L16.011 17.6C15.822 18.396 15.289 18.57 14.622 18.222L10.8 15.466L8.933 17.244C8.756 17.421 8.611 17.566 8.267 17.566L8.578 13.689L15.822 7.022C16.111 6.767 15.756 6.633 15.378 6.889L6.489 12.689L2.689 11.511C1.911 11.256 1.889 10.656 2.844 10.244L17.956 5.067C18.6 4.822 19.156 5.244 18.578 7.2Z"
        />
      </svg>
      Войти через Telegram
    </button>
    <div id="telegram-login-container"></div>
  </div>
{/if} -->
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
