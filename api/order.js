const nodemailer = require("nodemailer");

function createTransporter() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT);
  const secure = process.env.SMTP_SECURE === "true";
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  console.log("SMTP config:", {
    host,
    port,
    secure,
    user: user ? user.slice(0, 3) + "***" : "MISSING",
    pass: pass ? "***" : "MISSING",
  });
  console.log("MAIL_FROM:", process.env.MAIL_FROM || "MISSING");
  console.log("MAIL_TO:", process.env.MAIL_TO || "MISSING");

  if (!host || !user || !pass) {
    return { error: "Missing SMTP environment variables" };
  }

  return {
    transporter: nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
    }),
  };
}

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

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

  const { transporter, error } = createTransporter();
  if (error) {
    console.error("Config error:", error);
    res.status(500).json({ ok: false, error });
    return;
  }

  try {
    await transporter.verify();
    console.log("SMTP connection verified");

    const [adminInfo, customerInfo] = await Promise.all([
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

    console.log("Admin email:", {
      messageId: adminInfo.messageId,
      accepted: adminInfo.accepted,
      rejected: adminInfo.rejected,
    });
    console.log("Customer email:", {
      messageId: customerInfo.messageId,
      accepted: customerInfo.accepted,
      rejected: customerInfo.rejected,
    });
    res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Send error:", err.message, err.code);
    res.status(500).json({ ok: false, error: err.message, code: err.code });
  }
};
