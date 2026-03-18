import { Telegraf, Markup } from 'telegraf';
import { message } from 'telegraf/filters';

const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(express.json());

const STATS_FILE = path.join(__dirname, 'stats.json');

// --- Конфигурация (ЗАМЕНИ НА СВОИ ДАННЫЕ) ---
const BOT_TOKEN = '7685117804:AAH7TwiEjqpbHprCDpO-0-DI8yL52fDFndk'; // Вставь свой токен
// !!! ВАЖНО: После деплоя фронтенда вставь сюда ссылку на GitHub Pages !!!
const WEB_APP_URL = 'https://mishaelboss.github.io/test_bot/'; 
// Например: 'https://ivan-ivanov.github.io/pzk-clicker-tma'

// --- Инициализация бота ---
const bot = new Telegraf(BOT_TOKEN);

// --- Обработка команды /start ---
bot.command('start', (ctx) => {
  ctx.reply(
    '👋 Добро пожаловать в PzkClicker! Нажимай на монетку, зарабатывай PzkCoins и покупай бусты.',
    Markup.inlineKeyboard([
      // Кнопка для открытия мини-приложения
      Markup.button.webApp('🚀 Открыть игру', WEB_APP_URL)
    ])
  );
});

// --- Обработка данных из WebApp (необязательно, но добавим для обратной связи) ---
bot.on(message('web_app_data'), async (ctx) => {
  const data = ctx.webAppData.data;
  console.log('Получены данные из WebApp:', data);
  // Здесь можно обработать данные, например, сохранить рекорд в БД
  await ctx.reply('✅ Данные получены! Спасибо за игру.');
});

// --- Запуск бота ---
bot.launch().then(() => {
  console.log('Бот PzkClicker запущен!');
});

// --- Graceful stop ---
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

// Эндпоинт для Django
app.post('/api/deduct-coins', (req, res) => {
    const { telegram_id, amount, secret_key } = req.body;

    // Проверка безопасности (тот же ключ, что в Django)
    if (secret_key !== BOT_TOKEN) {
        return res.status(403).json({ error: 'Forbidden' });
    }

    try {
        // 1. Читаем текущие статы
        let stats = JSON.parse(fs.readFileSync(STATS_FILE, 'utf8'));

        // 2. Ищем юзера и вычитаем монеты
        const userId = String(telegram_id);
        if (stats[userId]) {
            stats[userId].coins = (stats[userId].coins || 0) - amount;
            
            // 3. Сохраняем обратно в stats.json
            fs.writeFileSync(STATS_FILE, JSON.stringify(stats, null, 2));
            
            console.log(`[Shop] Вычли ${amount} монет у ${userId}. Остаток: ${stats[userId].coins}`);
            return res.json({ success: true, new_balance: stats[userId].coins });
        }
        
        res.status(404).json({ error: 'User not found' });
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
});

// Запускаем API бота на порту 3001
app.listen(3001, () => {
    console.log('API для связи с Django запущено на порту 3001');
});