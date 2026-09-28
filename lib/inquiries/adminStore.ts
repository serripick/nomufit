import { supabaseAdmin } from "@/lib/supabase/adminClient";
import { InquiryRecord } from "./types";
import { InquiryRow, fromRow } from "./store";

/** 관리자(service role) 전용 — 반드시 isAdminRequest()로 검증된 서버 코드에서만 호출한다.
 * inquiries 테이블은 RLS상 select/update 정책이 없어, 이 경로가 유일한 조회/변경 수단이다. */

export async function listInquiriesAsAdmin(): Promise<InquiryRecord[]> {
  const { data, error } = await supabaseAdmin
    .from("inquiries")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as InquiryRow[]).map(fromRow);
}

export async function updateInquiryStatusAsAdmin(
  id: string,
  status: InquiryRecord["status"]
): Promise<void> {
  const { error } = await supabaseAdmin.from("inquiries").update({ status }).eq("id", id);
  if (error) throw error;
}

export async function deleteInquiryAsAdmin(id: string): Promise<void> {
  const { error } = await supabaseAdmin.from("inquiries").delete().eq("id", id);
  if (error) throw error;
}
