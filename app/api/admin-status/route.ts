import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const ADMIN_COOKIE = "nomufit_admin";

/** 고객용 페이지(계약서/명세서/서식)에서 지금 보고 있는 사람이 관리자로 로그인되어 있는지
 * 확인하기 위한 용도. 관리자라면 승인 여부와 무관하게 인쇄/출력을 항상 허용한다. */
export async function GET() {
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get(ADMIN_COOKIE)?.value === "1";
  return NextResponse.json({ isAdmin });
}
