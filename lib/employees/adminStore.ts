import { supabaseAdmin } from "@/lib/supabase/adminClient";
import { EmployeeRecord, EmployeeRecordInput } from "./types";
import { EmployeeRow, fromRow, toRow } from "./store";

/** 관리자(service role) 전용 — 반드시 isAdminRequest()로 검증된 서버 코드에서만 호출한다. */

export async function listEmployeesAsAdmin(businessId: string): Promise<EmployeeRecord[]> {
  const { data, error } = await supabaseAdmin
    .from("employees")
    .select("*")
    .eq("business_id", businessId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as EmployeeRow[]).map(fromRow);
}

export async function insertEmployeeAsAdmin(
  businessId: string,
  input: EmployeeRecordInput
): Promise<EmployeeRecord> {
  const { data, error } = await supabaseAdmin
    .from("employees")
    .insert({ ...toRow(input), business_id: businessId })
    .select("*")
    .single();
  if (error) throw error;
  return fromRow(data as EmployeeRow);
}

export async function updateEmployeeAsAdmin(
  id: string,
  input: EmployeeRecordInput
): Promise<EmployeeRecord> {
  const { data, error } = await supabaseAdmin
    .from("employees")
    .update({ ...toRow(input), updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return fromRow(data as EmployeeRow);
}

export async function deleteEmployeeAsAdmin(id: string): Promise<void> {
  const { error } = await supabaseAdmin.from("employees").delete().eq("id", id);
  if (error) throw error;
}
