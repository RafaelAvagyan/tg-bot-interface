<script>
  const sendTestData = () => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.sendData(
        JSON.stringify({ test: "✅ Всё работает!" })
      );
      window.Telegram.WebApp.close();
    }
  };

  if (window.Telegram?.WebApp) {
    window.Telegram.WebApp.ready();
    window.Telegram.WebApp.expand();
  }
</script>

<h1>Test WebApp</h1>
<button on:click={sendTestData}> Отправить тестовое сообщение </button>

<style>
  button {
    padding: 1rem;
    background-color: #007aff;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 1.1rem;
    margin-top: 2rem;
  }
</style>
