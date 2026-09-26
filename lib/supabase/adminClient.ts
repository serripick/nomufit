import { createClient } from "@supabase/supabase-js";

if (typeof window !== "undefined") {
  throw new Error("lib/supabase/adminClient는 서버 코드에서만 import할 수 있습니다.");
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/** 서버 전용 관리자 클라이언트. service role 키를 쓰므로 RLS를 완전히 우회한다 —
 * 절대 클라이언트 컴포넌트나 브라우저로 노출되는 코드에서 import하면 안 된다. */
export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});
