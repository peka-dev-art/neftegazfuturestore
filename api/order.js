const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    const { orders, name, email, phone, country, city, delivery, address } = req.body;

    const itemsList = orders.map(o =>
        `<tr>
            <td style="padding:8px"><img src="${o.image_url}" width="64" height="64" style="border-radius:4px"></td>
            <td style="padding:8px"><strong>${o.name}</strong><br><span style="color:#888">Цвет: ${o.colour} | Размер: ${o.size} | ${o.gender}</span></td>
        </tr>`
    ).join('');

    const html = `
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

    try {
        await transporter.sendMail({
            from: process.env.MAIL_FROM,
            to: process.env.MAIL_TO,
            subject: `НЕФТЕГАЗ#БУДУЩЕЕ — Заказ от ${name}`,
            html,
        });
        res.status(200).json({ ok: true });
    } catch (err) {
        console.error('Send error:', err);
        res.status(500).json({ ok: false, error: err.message });
    }
};
