import { supabaseAdmin } from "@/lib/supabase/adminClient";
import { registrationNumberToLoginEmail } from "@/lib/auth/loginId";
import { BusinessRecord, BusinessRecordInput } from "./types";
import { BusinessRow, fromRow, toRow } from "./store";

/** 관리자(service role) 전용 — RLS를 완전히 우회하므로 반드시 isAdminRequest()로
 * 검증된 서버 코드(Server Action, Route Handler)에서만 호출해야 한다. */

export async function listAllBusinesses(): Promise<BusinessRecord[]> {
  const { data, error } = await supabaseAdmin
    .from("businesses")
    .select("*")
    .order("business_registration_number");
  if (error) throw error;
  return (data as BusinessRow[]).map(fromRow);
}

export async function getBusinessByIdAsAdmin(id: string): Promise<BusinessRecord | null> {
  const { data, error } = await supabaseAdmin
    .from("businesses")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? fromRow(data as BusinessRow) : null;
}

export async function updateBusinessAsAdmin(
  id: string,
  input: BusinessRecordInput
): Promise<BusinessRecord> {
  const { data, error } = await supabaseAdmin
    .from("businesses")
    .update({ ...toRow(input), updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return fromRow(data as BusinessRow);
}

export async function deleteBusinessAsAdmin(id: string): Promise<void> {
  const { error } = await supabaseAdmin.from("businesses").delete().eq("id", id);
  if (error) throw error;
}

export async function approveBusinessAsAdmin(
  id: string,
  approved: boolean
): Promise<BusinessRecord> {
  const { data, error } = await supabaseAdmin
    .from("businesses")
    .update({ approved, approved_at: approved ? new Date().toISOString() : null })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return fromRow(data as BusinessRow);
}

/** 접속 아이디(사업자등록번호)+비밀번호 로그인 계정을 발급/재발급한다. 고객의 원래 익명
 * 세션이 살아있는지와 무관하게, 통화 중 관리자가 직접 만들어줄 수 있다. */
export async function issueBusinessLoginAsAdmin(
  business: BusinessRecord,
  password: string
): Promise<void> {
  if (!business.ownerId) {
    throw new Error("이 사업장은 소유자 세션이 없어 계정을 발급할 수 없습니다.");
  }
  const { error } = await supabaseAdmin.auth.admin.updateUserById(business.ownerId, {
    email: registrationNumberToLoginEmail(business.businessRegistrationNumber),
    password,
    email_confirm: true,
  });
  if (error) throw error;
}
