// import crypto from 'crypto'
// import { json } from "@sveltejs/kit";
// import { env } from '$env/dynamic/private';


// const BOT_TOKEN = env.BOT_TOKEN

// export async function POST({ request  }) {
//     const body = await request.formData();
//     const data = {};


//     for (const [key, value] of body.entries()) {
//         data[key] = value
//     }

//     const checkString = Object.keys(data)
//     .filter((key) => key !== 'hash')
//     .sort()
//     .map((key) => `${key}=${data[key]}`)
//     .join('\n');


//     const secretKey = crypto
//     .createHash('sha256')
//     .update(BOT_TOKEN)
//     .digest();


//     const hmac = crypto
//     .createHmac('sha256', secretKey)
//     .update(checkString)
//     .digest('hex');

//     if (hmac !== data.hash) {
//         console.error('Ошибка авторизации: Неверная подпись');
//         return json({ success: false, message: 'Unauthorized' }, { status: 403 });
//     }

//     console.log('Пользователь успешно авторизован через Telegram:', data);

//     return json({ success: true, user: data });
// }