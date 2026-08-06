const express = require("express");
const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const app = express();
app.use(express.static(__dirname));
app.use(express.json());

app.post("/api/order", async (req, res) => {
  const { orders, name, email, phone, country, city, delivery, address } =
    req.body;

  const itemsList = orders
    .map(
      (o) =>
        `<tr>
            <td style="padding:8px"><img src="${o.image_url}" width="64" height="64" style="border-radius:4px"></td>
            <td style="padding:8px"><strong>${o.name}</strong><br><span style="color:#888">Цвет: ${o.colour} | Размер: ${o.size} | ${o.gender}</span></td>
        </tr>`,
    )
    .join("");

  const adminHtml = `
        <div style="font-family:sans-serif;max-width:600px;margin:auto">
            <h2 style="border-bottom:3px solid #111;padding-bottom:8px">НЕФТЕГАЗ#БУДУЩЕЕ — Новый заказ</h2>
            <table style="width:100%;margin-bottom:16px">
                <tr><td style="color:#888;width:100px">Имя</td><td>${name}</td></tr>
                <tr><td style="color:#888">E-mail</td><td>${email}</td></tr>
                <tr><td style="color:#888">Телефон</td><td>${phone}</td></tr>
                <tr><td style="color:#888">Страна</td><td>${country}</td></tr>
                <tr><td style="color:#888">Город</td><td>${city}</td></tr>
                <tr><td style="color:#888">Доставка</td><td>${delivery}</td></tr>
                <tr><td style="color:#888">Адрес</td><td>${address}</td></tr>
            </table>
            <h3>Состав заказа</h3>
            <table style="width:100%;border-collapse:collapse">${itemsList}</table>
            <p style="color:#999;font-size:12px;margin-top:24px">Заказ с сайта neftegazfuture.store</p>
        </div>`;

  const customerHtml = `
        <div style="font-family:sans-serif;max-width:600px;margin:auto">
            <h2 style="border-bottom:3px solid #111;padding-bottom:8px">НЕФТЕГАЗ#БУДУЩЕЕ — Спасибо за заказ!</h2>
            <p>${name}, ваш заказ принят. Мы свяжемся с вами в ближайшее время.</p>
            <h3>Детали заказа</h3>
            <table style="width:100%;border-collapse:collapse">${itemsList}</table>
            <table style="width:100%;margin-top:16px">
                <tr><td style="color:#888;width:100px">Доставка</td><td>${delivery}</td></tr>
                <tr><td style="color:#888">Адрес</td><td>${address}</td></tr>
            </table>
            <p style="color:#999;font-size:12px;margin-top:24px">neftegazfuture.store</p>
        </div>`;

  try {
    await Promise.all([
      transporter.sendMail({
        from: process.env.MAIL_FROM,
        to: process.env.MAIL_TO,
        subject: `НЕФТЕГАЗ#БУДУЩЕЕ — Заказ от ${name}`,
        html: adminHtml,
      }),
      transporter.sendMail({
        from: process.env.MAIL_FROM,
        to: email,
        subject: `НЕФТЕГАЗ#БУДУЩЕЕ — Заказ подтверждён`,
        html: customerHtml,
      }),
    ]);
    res.json({ ok: true });
  } catch (err) {
    console.error("Send error:", err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server on port ${port}`));
