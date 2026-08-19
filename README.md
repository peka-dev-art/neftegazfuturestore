# НЕФТЕГАЗ#БУДУЩЕЕ — Лендинг + Магазин

> Примечание: этот README переведён с языка оригинала машинным способом с помощью
> ИИ-модели DeepSeek V4 Flash в редакторе Zed Code Editor версии 1.15.0.
> Возможны неточности формулировок.

Сайт-магазин без регистрации. Сайт сделан на простом HTML/CSS/JS, сервер на Express.
Когда покупатель оформляет заказ, сервер отправляет письмо по email через SMTP. Никаких внешних сервисов (типа EmailJS) не нужно.

## Из чего состоит

- Сайт: `index.html`, `style.css`, `script.js` (обычные файлы, работает на компьютере и на телефоне)
- Сервер: `server.js` — Express, принимает заказ по адресу `POST /api/order`
- Письма: Nodemailer (библиотека для отправки почты по SMTP)
- Настройки: файл `.env` (там лежат пароли и адреса)

## Как запустить у себя на компьютере

```bash
npm install
cp .env.example .env   # впишите туда свои настоящие данные от почты
npm start              # сайт откроется по адресу http://localhost:3000
```

Сервер сам показывает сайт, поэтому всё работает с одного адреса.

## Как работает отправка заказа

Сайт отправляет запрос `POST /api/order` с данными заказа:

```json
{
  "orders": [
    { "name": "…", "colour": "…", "size": "…", "gender": "…", "image_url": "…" }
  ],
  "name": "…",
  "email": "…",
  "phone": "…",
  "country": "…",
  "city": "…",
  "delivery": "…",
  "address": "…"
}
```

Сервер отправляет **два письма**:

1. **Администратору** — на адрес из настройки `MAIL_TO` (новый заказ)
2. **Покупателю** — на адрес, который он написал в форме (подтверждение заказа)

## Как установить на сервер компании

Нужен Node.js версии 18 или новее.

1. **Скопируйте проект** на сервер (например, в папку `/opt/neftegazfuturestore`).
2. **Создайте файл `.env`** по образцу из `.env.example` и впишите настоящие данные:

   | Настройка     | Что это                                                               | Пример                                         |
   | ------------- | --------------------------------------------------------------------- | ---------------------------------------------- |
   | `SMTP_HOST`   | адрес почтового сервера                                               | `smtp.ingenix-group.ru` или `smtp.mail.me.com` |
   | `SMTP_PORT`   | порт почтового сервера                                                | `587` (обычный) / `465` (SSL)                  |
   | `SMTP_SECURE` | `true` если порт 465, `false` если 587                                | `false`                                        |
   | `SMTP_USER`   | логин от почтового ящика                                              | `orders@ingenix-group.ru`                      |
   | `SMTP_PASS`   | пароль от ящика (или специальный пароль для приложений)               | —                                              |
   | `MAIL_FROM`   | адрес, от которого приходят письма (обычно такой же, как `SMTP_USER`) | `orders@ingenix-group.ru`                      |
   | `MAIL_TO`     | ящик администратора, куда приходят заказы                             | `admin@ingenix-group.ru`                       |
   | `PORT`        | номер порта (необязательно, по умолчанию `3000`)                      | `3000`                                         |

   > Совет: если у компании есть свой почтовый сервер — используйте его.
   > Тогда письма точно дойдут до внутренних адресов.
   > Если используете iCloud или Gmail — нужен специальный пароль для
   > приложений, а IP-адрес сервера лучше добавить в белый список на почте.

3. **Установите пакеты и запустите**:

   ```bash
   npm install --omit=dev
   ```

   Чтобы сервер работал постоянно (выберите один способ):

   ```bash
   # способ 1: systemd (рекомендуется) — файл /etc/systemd/system/neftegazfuturestore.service
   [Unit]
   Description=Neftegaz Future Store
   After=network.target

   [Service]
   WorkingDirectory=/opt/neftegazfuturestore
   ExecStart=/usr/bin/node server.js
   Restart=always
   Environment=NODE_ENV=production

   [Install]
   WantedBy=multi-user.target
   ```

   ```bash
   # способ 2: pm2
   npm install -g pm2
   pm2 start server.js --name neftegazfuturestore
   pm2 save
   ```

4. **Необязательно** — nginx, чтобы сайт открывался по обычному адресу (порт 80) с защитой:

   ```nginx
   server {
       listen 80;
       server_name store.ingenix-group.ru;
       location / {
           proxy_pass http://127.0.0.1:3000;
           proxy_set_header Host $host;
       }
   }
   ```

5. **Проверьте**: откройте сайт, добавьте товар в корзину, оформите заказ —
   администратору должно прийти письмо о заказе, а покупателю — подтверждение.

## Как обновлять сайт (через git)

Рекомендуемый способ. Проект уже лежит в git-репозитории (ветка `main`).

**Первый раз на сервере** — склонируйте репозиторий (папка `.git` появится сама):

```bash
git clone https://github.com/peka-dev-art/neftegazfuturestore /opt/neftegazfuturestore
cd /opt/neftegazfuturestore
npm install --omit=dev
```

**Дальше каждое обновление:**

```bash
# на компьютере разработчика:
git add -A
git commit -m "что поменялось"
git push

# на сервере:
cd /opt/neftegazfuturestore
git pull
npm install --omit=dev              # только если изменился package.json
pm2 restart neftegazfuturestore     # или: systemctl restart neftegazfuturestore
```

Почему так удобно:

- всегда видно, что и когда менялось;
- можно откатиться назад (`git checkout <старый-коммит>`);
- ничего не потеряется.

> Важно: файл `.env` в git не хранится (он в списке исключений).
> Его нужно создать на сервере один раз вручную.

## Vercel (необязательно)

В проекте есть ещё вариант для Vercel (файл `api/order.js`).
Те же настройки нужно добавить в панели Vercel (Settings → Environment Variables).
