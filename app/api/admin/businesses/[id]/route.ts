import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin/isAdminRequest";
import { getBusinessByIdAsAdmin, updateBusinessAsAdmin } from "@/lib/businesses/adminStore";
import { BusinessRecordInput } from "@/lib/businesses/types";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 403 });
  }
  const { id } = await params;
  const business = await getBusinessByIdAsAdmin(id);
  if (!business) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(business);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 403 });
  }
  const { id } = await params;
  const input = (await request.json()) as BusinessRecordInput;
  const business = await updateBusinessAsAdmin(id, input);
  return NextResponse.json(business);
}
