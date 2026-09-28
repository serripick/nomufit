"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { isAdminRequest } from "@/lib/admin/isAdminRequest";
import {
  approveBusinessAsAdmin,
  deleteBusinessAsAdmin,
  getBusinessByIdAsAdmin,
  issueBusinessLoginAsAdmin,
} from "@/lib/businesses/adminStore";
import { deleteInquiryAsAdmin, updateInquiryStatusAsAdmin } from "@/lib/inquiries/adminStore";
import { InquiryRecord } from "@/lib/inquiries/types";
import { generateTempPassword } from "@/lib/auth/tempPassword";

const ADMIN_COOKIE = "nomufit_admin";

export type LoginState = { error?: string };

export async function loginAdmin(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const password = formData.get("password");
  if (typeof password !== "string" || password.length === 0) {
    return { error: "비밀번호를 입력해주세요." };
  }
  if (password !== process.env.ADMIN_PASSWORD) {
    return { error: "비밀번호가 올바르지 않습니다." };
  }

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE, "1", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    // "/"로 열어둬야 /apply, /payslip, /forms 등 고객 페이지에서도 관리자 여부를 확인할 수 있다
    // (거기서 관리자는 승인 여부와 무관하게 항상 출력이 허용된다).
    path: "/",
    maxAge: 60 * 60 * 12,
  });
  redirect("/admin");
}

export async function logoutAdmin(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete({ name: ADMIN_COOKIE, path: "/" });
  redirect("/admin");
}

/** 아래 세 액션은 service role(RLS 완전 우회)을 쓰므로, 반드시 이 검사를 통과해야만 실행된다 —
 * 이전에는 admin/page.tsx가 버튼을 안 보여주는 것에만 기대고 있어 직접 호출 시 뚫리는 구멍이었다. */
async function assertAdmin(): Promise<void> {
  if (!(await isAdminRequest())) {
    throw new Error("관리자만 사용할 수 있습니다.");
  }
}

export async function deleteBusinessAction(id: string): Promise<void> {
  await assertAdmin();
  await deleteBusinessAsAdmin(id);
  revalidatePath("/admin");
}

export async function approveBusinessAction(id: string, approved: boolean): Promise<void> {
  await assertAdmin();
  await approveBusinessAsAdmin(id, approved);
  revalidatePath("/admin");
}

export async function updateInquiryStatusAction(
  id: string,
  status: InquiryRecord["status"]
): Promise<void> {
  await assertAdmin();
  await updateInquiryStatusAsAdmin(id, status);
  revalidatePath("/admin");
}

export async function deleteInquiryAction(id: string): Promise<void> {
  await assertAdmin();
  await deleteInquiryAsAdmin(id);
  revalidatePath("/admin");
}

export async function issueLoginAction(businessId: string): Promise<{ password: string }> {
  await assertAdmin();
  const business = await getBusinessByIdAsAdmin(businessId);
  if (!business) throw new Error("사업장을 찾을 수 없습니다.");
  const password = generateTempPassword();
  await issueBusinessLoginAsAdmin(business, password);
  revalidatePath("/admin");
  return { password };
}
