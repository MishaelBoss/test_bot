import { Telegraf, Markup } from 'telegraf';
import { message } from 'telegraf/filters';

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
app.post('/update-balance', (req, res) => {
    const { telegram_id, amount, secret_key } = req.body;

    if (secret_key !== '7685117804:AAH7TwiEjqpbHprCDpO-0-DI8yL52fDFndk') return res.status(403).send('Forbidden');

    // Логика списания монет в твоем stats.json (или другой БД)
    try {
        const stats = JSON.parse(fs.readFileSync('./stats.json', 'utf8'));
        
        // Находим юзера и отнимаем монеты
        if (stats[telegram_id]) {
            stats[telegram_id].coins -= amount;
            fs.writeFileSync('./stats.json', JSON.stringify(stats, null, 2));
            
            // ОПЦИОНАЛЬНО: Отправляем сообщение юзеру через бота
            bot.telegram.sendMessage(telegram_id, `💳 Списано ${amount} PZK за покупку скидки на сайте!`);
            
            return res.send({ status: 'ok' });
        }
        res.status(404).send('User not found');
    } catch (e) {
        res.status(500).send('Error updating stats.json');
    }
});

app.listen(3001, () => console.log('Bot API listener on port 3001'));