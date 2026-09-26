import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

async function notifyTelegram(text: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    console.warn("[inquiries] TELEGRAM_BOT_TOKEN/TELEGRAM_CHAT_ID 미설정 — 알림을 건너뜁니다.");
    return;
  }
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text }),
    });
    if (!res.ok) {
      console.error("[inquiries] 텔레그램 알림 전송 실패", await res.text());
    }
  } catch (err) {
    console.error("[inquiries] 텔레그램 알림 전송 중 오류", err);
  }
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const businessRegistrationNumber = typeof body?.businessRegistrationNumber === "string" ? body.businessRegistrationNumber : "";
  const businessName = typeof body?.businessName === "string" ? body.businessName : "";
  const contactName = typeof body?.contactName === "string" ? body.contactName : "";
  const contactPhone = typeof body?.contactPhone === "string" ? body.contactPhone : "";
  const message = typeof body?.message === "string" ? body.message : "";

  if (!contactName.trim() || !contactPhone.trim()) {
    return NextResponse.json({ error: "담당자명과 연락처를 입력해주세요." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("inquiries")
    .insert({
      business_registration_number: businessRegistrationNumber || null,
      business_name: businessName || null,
      contact_name: contactName,
      contact_phone: contactPhone,
      message: message || null,
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const lines = [
    "📩 노무핏 정식 이용 문의",
    `사업장: ${businessName || "미입력"} (${businessRegistrationNumber || "사업자번호 미입력"})`,
    `담당자: ${contactName} / ${contactPhone}`,
    message ? `메시지: ${message}` : null,
  ].filter(Boolean);
  await notifyTelegram(lines.join("\n"));

  return NextResponse.json({ ok: true, id: data.id });
}
