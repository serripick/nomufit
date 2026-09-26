import { cookies } from "next/headers";

const ADMIN_COOKIE = "nomufit_admin";

/** 서버 코드(Server Action, Route Handler)에서 관리자 쿠키를 검사한다. service role 클라이언트를
 * 쓰는 모든 admin 전용 경로는 이 함수로 먼저 확인해야 한다 — service role은 RLS를 완전히
 * 우회하므로, 이 검사가 유일한 접근 제어다. */
export async function isAdminRequest(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get(ADMIN_COOKIE)?.value === "1";
}
