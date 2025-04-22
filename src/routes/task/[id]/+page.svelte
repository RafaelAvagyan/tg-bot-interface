<script>
  import { onMount } from "svelte";
  import { page } from "$app/stores";
  import { supabase } from "$lib/supabaseClient";

  let task = $state(null);
  let isLoading = $state(true);

  onMount(async () => {
    const taskId = $page.params.id;

    const { data, error } = await supabase
      .from("Todos")
      .select("*, Categories(name)")
      .eq("id", taskId)
      .single();

    if (error) {
      console.error("Ошибка при загрузке задачи:", error.message);
    } else {
      task = data;
    }

    isLoading = false;
  });

  function showStatus(status) {
    if (status === 1) {
      return "В ожидании";
    } else {
      return "В работе";
    }
  }
</script>

{#if isLoading}
  <p>Загрузка задачи...</p>
{:else if task}
  <button>
    <a href="/">Назад</a>
  </button>
  <div class="item">
    <strong>Автор:</strong>
    <div>{task.original_author}</div>
  </div>
  <div class="item">
    <strong>Задача:</strong>
    <div>{task.text}</div>
  </div>
  <div class="item">
    <strong>Категория:</strong>
    <div>{task.Categories.name}</div>
  </div>
  <div class="item">
    <strong>Статус:</strong>
    <div>{showStatus(task.status)}</div>
  </div>
  <div class="item">
    <strong>Дата создания</strong>
    <div>{task.created_at}</div>
  </div>
{:else}
  <p>Задача не найдена</p>
{/if}

<style>
  .item {
    display: flex;
    gap: 5px;
  }
</style>
