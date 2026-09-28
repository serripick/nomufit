import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

function isAnonymousSessionValue(value: string): boolean {
  try {
    return Boolean(JSON.parse(value)?.user?.is_anonymous);
  } catch {
    return false;
  }
}

/** 승인 전 체험(익명) 세션은 탭을 닫으면 사라지도록 sessionStorage에, 승인 후
 * 이메일/비밀번호로 전환한 정식 계정 세션은 보통의 로그인처럼 유지되도록 localStorage에
 * 저장한다. 같은 탭 안에서의 새로고침/페이지 이동에는 영향 없다 — sessionStorage도
 * 탭이 살아있는 동안은 유지되기 때문이다. */
const hybridAuthStorage = {
  getItem(key: string) {
    if (typeof window === "undefined") return null;
    return window.sessionStorage.getItem(key) ?? window.localStorage.getItem(key);
  },
  setItem(key: string, value: string) {
    if (typeof window === "undefined") return;
    if (isAnonymousSessionValue(value)) {
      window.sessionStorage.setItem(key, value);
      window.localStorage.removeItem(key);
    } else {
      window.localStorage.setItem(key, value);
      window.sessionStorage.removeItem(key);
    }
  },
  removeItem(key: string) {
    if (typeof window === "undefined") return;
    window.sessionStorage.removeItem(key);
    window.localStorage.removeItem(key);
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { storage: hybridAuthStorage },
});
