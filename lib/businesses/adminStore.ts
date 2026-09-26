import { supabaseAdmin } from "@/lib/supabase/adminClient";
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
