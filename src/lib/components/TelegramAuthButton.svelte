<script>
  import { onMount } from "svelte";

  export let botUsername = "CreateTodoBot";
  export let authUrl = "/api/auth/telegram";
  export let size = "large";

  onMount(() => {
    const script = document.createElement("script");
    script.async = true;
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.setAttribute("data-telegram-login", botUsername);
    script.setAttribute("data-size", size);
    script.setAttribute("data-auth-url", authUrl);
    script.setAttribute("data-request-access", "write");
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  });
</script>

<div id="telegram-login-button"></div>

<style>
  #telegram-login-button {
    margin: 1rem 0;
    min-height: 40px;
  }
</style>
