import { BusinessRecord, BusinessRecordInput } from "@/lib/businesses/types";
import { EmployeeRecord, EmployeeRecordInput } from "@/lib/employees/types";

/** 관리자가 /apply, /payslip, /forms에서 특정 사업장을 "열기"로 들어왔을 때 쓰는 클라이언트
 * 어댑터. 일반 고객용 store 함수와 시그니처를 맞춰서, 페이지 쪽 분기를 최소화한다.
 * 실제로는 /api/admin/* 라우트(서버에서 service role로 처리)를 호출한다. */

async function parseOrThrow<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error || `요청이 실패했습니다 (${res.status})`);
  }
  return res.json();
}

export async function getBusiness(id: string): Promise<BusinessRecord | null> {
  const res = await fetch(`/api/admin/businesses/${id}`);
  if (res.status === 404) return null;
  return parseOrThrow<BusinessRecord>(res);
}

export async function updateBusinessInfo(
  id: string,
  input: BusinessRecordInput
): Promise<BusinessRecord> {
  const res = await fetch(`/api/admin/businesses/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return parseOrThrow<BusinessRecord>(res);
}

export async function listEmployees(businessId: string): Promise<EmployeeRecord[]> {
  const res = await fetch(`/api/admin/businesses/${businessId}/employees`);
  return parseOrThrow<EmployeeRecord[]>(res);
}

export async function insertEmployee(
  businessId: string,
  input: EmployeeRecordInput
): Promise<EmployeeRecord> {
  const res = await fetch(`/api/admin/businesses/${businessId}/employees`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return parseOrThrow<EmployeeRecord>(res);
}

export async function updateEmployee(
  id: string,
  input: EmployeeRecordInput
): Promise<EmployeeRecord> {
  const res = await fetch(`/api/admin/employees/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return parseOrThrow<EmployeeRecord>(res);
}

export async function deleteEmployee(id: string): Promise<void> {
  const res = await fetch(`/api/admin/employees/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error || "삭제에 실패했습니다.");
  }
}
