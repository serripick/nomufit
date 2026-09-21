import { supabase } from "@/lib/supabase/client";
import { Gender } from "@/lib/contract-templates/types";
import { EmployeeRecord, EmployeeRecordInput } from "./types";

interface EmployeeRow {
  id: string;
  created_at: string;
  updated_at: string;
  worker_name: string;
  worker_gender: Gender | null;
  worker_birth_date: string | null;
  worker_address: string | null;
  worker_phone: string | null;
  job_description: string | null;
  work_location: string | null;
  contract_start_date: string | null;
  contract_end_date: string | null;
  employment_pattern: EmployeeRecord["employmentPattern"];
  break_times: EmployeeRecord["breakTimes"];
  wage: EmployeeRecord["wage"];
  five_or_more_employees: boolean;
  note: string | null;
}

function fromRow(row: EmployeeRow): EmployeeRecord {
  return {
    id: row.id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    workerName: row.worker_name,
    workerGender: row.worker_gender ?? "M",
    workerBirthDate: row.worker_birth_date ?? "",
    workerAddress: row.worker_address ?? "",
    workerPhone: row.worker_phone ?? "",
    jobDescription: row.job_description ?? "",
    workLocation: row.work_location ?? "",
    contractStartDate: row.contract_start_date ?? "",
    contractEndDate: row.contract_end_date,
    employmentPattern: row.employment_pattern,
    breakTimes: row.break_times,
    wage: row.wage,
    fiveOrMoreEmployees: row.five_or_more_employees,
    note: row.note ?? "",
  };
}

function toRow(input: EmployeeRecordInput) {
  return {
    worker_name: input.workerName,
    worker_gender: input.workerGender,
    worker_birth_date: input.workerBirthDate || null,
    worker_address: input.workerAddress || null,
    worker_phone: input.workerPhone || null,
    job_description: input.jobDescription || null,
    work_location: input.workLocation || null,
    contract_start_date: input.contractStartDate || null,
    contract_end_date: input.contractEndDate || null,
    employment_pattern: input.employmentPattern,
    break_times: input.breakTimes,
    wage: input.wage,
    five_or_more_employees: input.fiveOrMoreEmployees,
    note: input.note || null,
  };
}

export async function listEmployees(businessId: string): Promise<EmployeeRecord[]> {
  const { data, error } = await supabase
    .from("employees")
    .select("*")
    .eq("business_id", businessId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as EmployeeRow[]).map(fromRow);
}

export async function insertEmployee(
  businessId: string,
  input: EmployeeRecordInput
): Promise<EmployeeRecord> {
  const { data, error } = await supabase
    .from("employees")
    .insert({ ...toRow(input), business_id: businessId })
    .select("*")
    .single();
  if (error) throw error;
  return fromRow(data as EmployeeRow);
}

export async function updateEmployee(
  id: string,
  input: EmployeeRecordInput
): Promise<EmployeeRecord> {
  const { data, error } = await supabase
    .from("employees")
    .update({ ...toRow(input), updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return fromRow(data as EmployeeRow);
}

export async function deleteEmployee(id: string): Promise<void> {
  const { error } = await supabase.from("employees").delete().eq("id", id);
  if (error) throw error;
}
