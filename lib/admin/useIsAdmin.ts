"use client";

import { useEffect, useState } from "react";

/** 관리자로 로그인되어 있으면 true — 승인 여부와 무관하게 인쇄/출력을 항상 허용하기 위해 쓴다. */
export function useIsAdmin(): boolean {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    fetch("/api/admin-status")
      .then((res) => res.json())
      .then((data) => setIsAdmin(Boolean(data?.isAdmin)))
      .catch(() => setIsAdmin(false));
  }, []);

  return isAdmin;
}
