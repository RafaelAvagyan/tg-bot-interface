<script>
  import { onMount } from "svelte";

  export let botUsername = "CreateTodoBot";
  export let authUrl = "/api/auth/telegram";
  export let size = "large";
  export let radius = "20"; 
  export let requestAccess = "write";

  onMount(() => {
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.dataset.telegramLogin = botUsername;
    script.dataset.size = size;
    script.dataset.radius = radius; // Добавляем радиус
    script.dataset.authUrl = authUrl;
    script.dataset.requestAccess = requestAccess;
    document.body.appendChild(script);

    return () => document.body.removeChild(script);
  });

</script>

<div id="telegram-login-button"></div>

<style>
  #telegram-login-button {
    margin: 1rem 0;
    min-height: 40px;
  }
</style>
