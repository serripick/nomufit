import { supabase } from "@/lib/supabase/client";
import { BusinessRecord, BusinessRecordInput } from "./types";

interface BusinessRow {
  id: string;
  business_registration_number: string;
  business_name: string | null;
  representative_name: string | null;
  business_address: string | null;
  business_phone: string | null;
  five_or_more_employees: boolean;
}

function fromRow(row: BusinessRow): BusinessRecord {
  return {
    id: row.id,
    businessRegistrationNumber: row.business_registration_number,
    businessName: row.business_name ?? "",
    representativeName: row.representative_name ?? "",
    businessAddress: row.business_address ?? "",
    businessPhone: row.business_phone ?? "",
    fiveOrMoreEmployees: row.five_or_more_employees,
  };
}

function toRow(input: BusinessRecordInput) {
  return {
    business_registration_number: input.businessRegistrationNumber,
    business_name: input.businessName || null,
    representative_name: input.representativeName || null,
    business_address: input.businessAddress || null,
    business_phone: input.businessPhone || null,
    five_or_more_employees: input.fiveOrMoreEmployees,
  };
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

export async function createBusiness(input: BusinessRecordInput): Promise<BusinessRecord> {
  const { data, error } = await supabase
    .from("businesses")
    .insert(toRow(input))
    .select("*")
    .single();
  if (error) throw error;
  return fromRow(data as BusinessRow);
}

export async function listBusinesses(): Promise<BusinessRecord[]> {
  const { data, error } = await supabase
    .from("businesses")
    .select("*")
    .order("business_registration_number");
  if (error) throw error;
  return (data as BusinessRow[]).map(fromRow);
}

export async function deleteBusiness(id: string): Promise<void> {
  const { error } = await supabase.from("businesses").delete().eq("id", id);
  if (error) throw error;
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
