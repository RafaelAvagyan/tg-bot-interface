import { json } from '@sveltejs/kit';
import { supabase } from '$lib/supabaseClient';

export async function GET({ url }) {
  const tgData = {
    id: Number(url.searchParams.get('id')),
    first_name: url.searchParams.get('first_name'),
    last_name: url.searchParams.get('last_name'),
    username: url.searchParams.get('username'),
    photo_url: url.searchParams.get('photo_url'),
    auth_date: Number(url.searchParams.get('auth_date')),
    hash: url.searchParams.get('hash'),
    phone: url.searchParams.get('phone') 
  };

  console.log('Received Telegram data:', tgData);

  // Здесь должна быть проверка хэша
//   if (!verifyTelegramData(tgData)) return new Response('Invalid data', { status: 401 });

  const userData = {
    telegramId: tgData.id,
    name: `${tgData.first_name} ${tgData.last_name || ''}`.trim(),
    username: tgData.username,
    photoUrl: tgData.photo_url,
    isAdmin: false
  };

  // Сохраняем/обновляем пользователя в Supabase
  const { data: user, error } = await supabase
    .from('Users')
    .upsert(userData, { onConflict: 'telegramId' })
    .select()
    .single();

  if (error) {
    console.error('Auth error:', error);
    return new Response('Auth failed', { status: 500 });
  }

  // Создаем сессию в Supabase Auth
  const { data: session, error: sessionError } = await supabase.auth.signInWithPassword({
    email: `${tgData.id}@telegram`,
    password: tgData.hash
  });

  if (sessionError) {
    // Если пользователя нет, создаем его
    const { error: signUpError } = await supabase.auth.signUp({
      email: `${tgData.id}@telegram`,
      password: tgData.hash,
      options: {
        data: {
          telegram_id: tgData.id,
          full_name: userData.name
        }
      }
    });

    if (signUpError) return new Response('User creation failed', { status: 500 });
  }

  // Перенаправляем на главную или returnUrl
  const returnUrl = url.searchParams.get('return') || '/';
  return new Response(null, {
    status: 302,
    headers: {
      location: returnUrl,
      'set-cookie': `session=${session?.session?.access_token}; Path=/; HttpOnly`
    }
  });
}