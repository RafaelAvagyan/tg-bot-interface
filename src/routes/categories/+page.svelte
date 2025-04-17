<script>
    let categories = $state([
        {id: 1, name: 'Дизайн'},
        {id: 2, name: 'Доработки'},
        {id: 3, name: 'Остальное'}
    ])
</script>

<h1>Выберите категорию</h1>

<div class="list">
    {#each categories as item}
        <div class="list-item">{item.name}</div>
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
