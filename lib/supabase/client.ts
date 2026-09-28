import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// 익명 체험 세션은 등록→유선 확인→승인까지 시간차가 있고, 승인 후 계정 설정(이메일/비밀번호)도
// 같은 세션이 살아있어야 가능하다. 탭을 닫아도 세션이 유지되어야 이 흐름이 끊기지 않으므로
// 기본 localStorage 저장을 그대로 쓴다(세션 초기화는 "예시로 초기화" 버튼으로만 한다).
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
