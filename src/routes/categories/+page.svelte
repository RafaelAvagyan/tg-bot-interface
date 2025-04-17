<script>
  import { page } from "$app/stores";

  let taskId = $state();

  taskId = $page.url.searchParams.get("taskId");

  const handleCategoryClick = (category) => {
    const tg = window.Telegram?.WebApp;

    if (tg && taskId) {
      tg.sendData(
        JSON.stringify({
          task_id: taskId,
          category_id: category.id,
        })
      );
      tg.close()
    }
  };
  let categories = $state([
    { id: 1, name: "Дизайн" },
    { id: 2, name: "Доработки" },
    { id: 3, name: "Остальное" },
  ]);
</script>

<h1>Выберите категорию</h1>

<div class="list">
  {#each categories as item}
    <div on:click={() => handleCategoryClick(item)} class="list-item">{item.name}</div>
  {/each}
</div>

<style>
  .list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .list-item {
    cursor: pointer;
  }
</style>
