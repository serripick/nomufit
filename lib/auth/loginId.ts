const LOGIN_EMAIL_DOMAIN = "login.nomufit.internal";

/** 로그인 아이디(사업자등록번호)를 Supabase Auth가 요구하는 이메일 형식으로 변환한다.
 * 실제로 메일을 주고받는 주소가 아니라 내부 인증용 식별자일 뿐이며, 화면에는 노출하지 않는다. */
export function registrationNumberToLoginEmail(registrationNumber: string): string {
  const digits = registrationNumber.replace(/[^0-9]/g, "");
  return `biz-${digits}@${LOGIN_EMAIL_DOMAIN}`;
}
