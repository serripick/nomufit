import { supabase } from "@/lib/supabase/client";
import { BusinessRecord, BusinessRecordInput } from "./types";

export interface BusinessRow {
  id: string;
  owner_id: string | null;
  business_registration_number: string;
  business_name: string | null;
  representative_name: string | null;
  business_address: string | null;
  business_phone: string | null;
  email: string | null;
  five_or_more_employees: boolean;
  approved: boolean;
}

export function fromRow(row: BusinessRow): BusinessRecord {
  return {
    id: row.id,
    ownerId: row.owner_id,
    businessRegistrationNumber: row.business_registration_number,
    businessName: row.business_name ?? "",
    representativeName: row.representative_name ?? "",
    businessAddress: row.business_address ?? "",
    businessPhone: row.business_phone ?? "",
    email: row.email ?? "",
    fiveOrMoreEmployees: row.five_or_more_employees,
    approved: row.approved,
  };
}

export function toRow(input: BusinessRecordInput) {
  const row: Record<string, unknown> = {
    business_registration_number: input.businessRegistrationNumber,
    business_name: input.businessName || null,
    representative_name: input.representativeName || null,
    business_address: input.businessAddress || null,
    business_phone: input.businessPhone || null,
    five_or_more_employees: input.fiveOrMoreEmployees,
  };
  // email은 계정 전환 흐름에서만 명시적으로 넘어온다 — 다른 일반 정보 수정이 실수로
  // 비우지 않도록, 호출자가 실제로 전달했을 때만 컬럼에 포함시킨다.
  if (input.email !== undefined) row.email = input.email || null;
  return row;
}

export async function findBusinessByRegistrationNumber(
  registrationNumber: string
): Promise<BusinessRecord | null> {
  const { data, error } = await supabase
    .from("businesses")
    .select("*")
    .eq("business_registration_number", registrationNumber)
    .maybeSingle();
  if (error) throw error;
  return data ? fromRow(data as BusinessRow) : null;
}

/** 현재 세션(익명 포함)이 소유한 사업장 목록. RLS가 활성화되면 자동으로 내 소유만 걸러진다. */
export async function listMyBusinesses(): Promise<BusinessRecord[]> {
  const { data, error } = await supabase
    .from("businesses")
    .select("*")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data as BusinessRow[]).map(fromRow);
}

export async function createBusiness(input: BusinessRecordInput): Promise<BusinessRecord> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from("businesses")
    .insert({ ...toRow(input), owner_id: user?.id ?? null })
    .select("*")
    .single();
  if (error) throw error;
  return fromRow(data as BusinessRow);
}

export async function updateBusiness(
  id: string,
  input: BusinessRecordInput
): Promise<BusinessRecord> {
  const { data, error } = await supabase
    .from("businesses")
    .update({ ...toRow(input), updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return fromRow(data as BusinessRow);
}
