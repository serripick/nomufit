import { InquiryInput, InquiryRecord } from "./types";

export interface InquiryRow {
  id: string;
  created_at: string;
  business_registration_number: string | null;
  business_name: string | null;
  contact_name: string | null;
  contact_phone: string | null;
  message: string | null;
  status: InquiryRecord["status"];
}

export function fromRow(row: InquiryRow): InquiryRecord {
  return {
    id: row.id,
    createdAt: row.created_at,
    businessRegistrationNumber: row.business_registration_number ?? "",
    businessName: row.business_name ?? "",
    contactName: row.contact_name ?? "",
    contactPhone: row.contact_phone ?? "",
    message: row.message ?? "",
    status: row.status,
  };
}

/** 문의는 서버 라우트(/api/inquiries)를 거쳐 저장한다 — 저장과 동시에 텔레그램 알림을
 * 서버에서 보내야 하고, 텔레그램 봇 토큰은 클라이언트에 노출되면 안 되기 때문이다.
 * 조회/상태변경은 관리자 전용이라 lib/inquiries/adminStore.ts로 옮겼다. */
export async function submitInquiry(input: InquiryInput): Promise<void> {
  const res = await fetch("/api/inquiries", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error || "문의 접수에 실패했습니다.");
  }
}
