import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin/isAdminRequest";
import { deleteEmployeeAsAdmin, updateEmployeeAsAdmin } from "@/lib/employees/adminStore";
import { EmployeeRecordInput } from "@/lib/employees/types";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 403 });
  }
  const { id } = await params;
  const input = (await request.json()) as EmployeeRecordInput;
  const employee = await updateEmployeeAsAdmin(id, input);
  return NextResponse.json(employee);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 403 });
  }
  const { id } = await params;
  await deleteEmployeeAsAdmin(id);
  return NextResponse.json({ ok: true });
}
