import { supabase } from "./client";

/** 방문자마다 익명 Supabase Auth 세션을 보장한다. 로그인 화면 없이 조용히 이루어지며,
 * 이 세션의 user id가 RLS의 소유권 기준(businesses.owner_id)이 된다. 승인 후 이메일/비밀번호를
 * 발급하면 같은 user id를 유지한 채 영구 계정으로 전환된다(lib/businesses/adminStore.ts의
 * issueBusinessLoginAsAdmin). */
export async function ensureSession(): Promise<string> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (session) return session.user.id;

  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) throw error;
  return data.user!.id;
}
