const KEY_PREFIX = "last-employee-id:";

/** 이 사업장에서 마지막으로 작업/선택한 직원 id. 근로계약서·임금명세서 페이지가 공유한다. */
export function getLastSelectedEmployeeId(businessId: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(KEY_PREFIX + businessId);
  } catch {
    return null;
  }
}

export function setLastSelectedEmployeeId(businessId: string, employeeId: string | null): void {
  if (typeof window === "undefined") return;
  try {
    if (employeeId) window.localStorage.setItem(KEY_PREFIX + businessId, employeeId);
    else window.localStorage.removeItem(KEY_PREFIX + businessId);
  } catch {
    // 접근 불가 환경에서는 조용히 무시한다.
  }
}
