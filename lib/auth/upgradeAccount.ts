import { supabase } from "@/lib/supabase/client";

/** 승인된 사업장의 방문자가 이메일+비밀번호를 설정해, 지금 쓰고 있는 익명 세션을 영구
 * 계정으로 전환한다. auth.uid()가 그대로 유지되므로 businesses.owner_id 등 기존 데이터는
 * 별도 이전 작업 없이 그대로 이어진다. */
export async function upgradeAnonymousAccount(email: string, password: string) {
  const { data, error } = await supabase.auth.updateUser({ email, password });
  if (error) throw error;
  return data;
}
