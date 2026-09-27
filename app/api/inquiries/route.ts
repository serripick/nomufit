import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/adminClient";

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

  // 익명 방문자도 문의는 남길 수 있어야 하는데, inquiries는 개인정보(연락처)가 있어 공개
  // SELECT 정책을 두지 않았다 — INSERT ... RETURNING(=.select())은 RLS상 SELECT 권한도
  // 요구하므로, 이 경로는 RLS를 우회하는 서버 전용 service role 클라이언트로 처리한다.
  const { data, error } = await supabaseAdmin
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
