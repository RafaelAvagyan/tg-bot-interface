import { redirect } from '@sveltejs/kit';
import { supabase } from '$lib/supabaseClient';
import crypto from 'crypto';

export async function handle({ event, resolve }) {
  // Пропускаем публичные маршруты
  const publicRoutes = ['/api/auth/telegram'];
  if (publicRoutes.includes(event.url.pathname)) {
    return resolve(event);
  }

  // Проверка для Telegram Mini App
  if (event.url.searchParams.has('tgWebAppData')) {
    const user = await verifyTelegramUser(event);
    if (user) {
      event.locals.user = user;
      return resolve(event);
    }
  }

  // Проверка сессии Supabase
  const { data: { session } } = await supabase.auth.getSession();
  event.locals.user = session?.user;

  // Защита маршрутов
  const protectedRoutes = ['/categories', '/task'];
  if (protectedRoutes.some(route => event.url.pathname.startsWith(route))) {
    if (!event.locals.user) {
      throw redirect(303, `/?return=${encodeURIComponent(event.url.pathname)}`);
    }
  }

  return resolve(event);
}

async function verifyTelegramUser(event) {
  const tgWebAppData = event.url.searchParams.get('tgWebAppData');
  if (!tgWebAppData) return null;

  const params = new URLSearchParams(tgWebAppData);
  const hash = params.get('hash');
  const authDate = Number(params.get('auth_date'));
  const now = Math.floor(Date.now() / 1000);

  // Проверяем срок действия данных (не старше 1 дня)
  if (now - authDate > 86400) {
    console.log('Telegram data expired');
    return null;
  }

  // Проверяем хэш данных
  if (!verifyTelegramHash(tgWebAppData, process.env.BOT_TOKEN)) {
    console.log('Invalid Telegram hash');
    return null;
  }

  const user = {
    id: params.get('id'),
    first_name: params.get('first_name'),
    last_name: params.get('last_name'),
    username: params.get('username'),
    photo_url: params.get('photo_url')
  };

  // Сохраняем/обновляем пользователя в Supabase
  const { data, error } = await supabase
    .from('Users')
    .upsert({
      telegramId: user.id,
      name: `${user.first_name} ${user.last_name || ''}`.trim(),
      username: user.username,
      photoUrl: user.photo_url,
      isAdmin: false
    }, { onConflict: 'telegramId' })
    .select()
    .single();

  if (error) {
    console.error('Error saving Telegram user:', error);
    return null;
  }

  return data;
}

function verifyTelegramHash(initData, botToken) {
  const params = new URLSearchParams(initData);
  const hash = params.get('hash');
  params.delete('hash');
  
  const dataCheckString = Array.from(params.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('\n');
  
  const secretKey = crypto.createHash('sha256')
    .update(botToken)
    .digest();
  
  const calculatedHash = crypto.createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex');
    
  return calculatedHash === hash;
}