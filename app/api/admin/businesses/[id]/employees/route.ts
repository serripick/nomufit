import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin/isAdminRequest";
import { insertEmployeeAsAdmin, listEmployeesAsAdmin } from "@/lib/employees/adminStore";
import { EmployeeRecordInput } from "@/lib/employees/types";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 403 });
  }
  const { id } = await params;
  const employees = await listEmployeesAsAdmin(id);
  return NextResponse.json(employees);
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 403 });
  }
  const { id } = await params;
  const input = (await request.json()) as EmployeeRecordInput;
  const employee = await insertEmployeeAsAdmin(id, input);
  return NextResponse.json(employee);
}
