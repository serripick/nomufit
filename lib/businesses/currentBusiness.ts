const CURRENT_BUSINESS_KEY = "current-business-registration-number";

/** 이 브라우저에서 마지막으로 조회/등록한 사업장의 사업자등록번호(숫자만). */
export function getStoredBusinessRegNumber(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(CURRENT_BUSINESS_KEY);
  } catch {
    return null;
  }
}

export function setStoredBusinessRegNumber(value: string | null): void {
  if (typeof window === "undefined") return;
  try {
    if (value) window.localStorage.setItem(CURRENT_BUSINESS_KEY, value);
    else window.localStorage.removeItem(CURRENT_BUSINESS_KEY);
  } catch {
    // 접근 불가 환경(시크릿 모드 등)에서는 조용히 무시한다.
  }
}
