import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  const { name, tel, menu, date, time, message, mode } = await req.json();

  if (!name) {
    return NextResponse.json({ error: "必須項目が不足しています" }, { status: 400 });
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  const isCalendar = mode === "calendar";
  const mailContent = isCalendar
    ? `
【治療院ほとり】ご予約が届きました

お名前：${name}
お電話番号：${tel || "未記入"}
ご希望メニュー：${menu || "未選択"}
ご希望日：${date || "未記入"}
ご希望時間：${time || "未記入"}

備考：
${message || "なし"}
    `.trim()
    : `
【治療院ほとり】メール相談が届きました

お名前：${name}
お電話番号：${tel || "未記入"}

お問い合わせ内容：
${message}
    `.trim();

  const subject = isCalendar
    ? `【ほとり】ご予約：${name}様（${date} ${time}）`
    : `【ほとり】メール相談：${name}様`;

  try {
    await transporter.sendMail({
      from: `"治療院ほとり お問い合わせ" <${process.env.GMAIL_USER}>`,
      to: process.env.CONTACT_TO_EMAIL,
      replyTo: process.env.GMAIL_USER,
      subject,
      text: mailContent,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "送信に失敗しました" }, { status: 500 });
  }
}
