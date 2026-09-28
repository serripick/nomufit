"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { listMyBusinesses } from "@/lib/businesses/store";
import { BusinessRecord } from "@/lib/businesses/types";
import { AppShell, PageHeading } from "@/components/layout/AppShell";
import { FieldLabel, TextInput } from "@/components/forms/fields";

const PASSWORD_PATTERN = /^[A-Z0-9]{8}$/;

export default function AccountPage() {
  const [loading, setLoading] = useState(true);
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [businesses, setBusinesses] = useState<BusinessRecord[]>([]);
  const [newPassword, setNewPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setIsAnonymous(user ? Boolean(user.is_anonymous) : true);
      if (user) {
        try {
          setBusinesses(await listMyBusinesses());
        } catch {
          // 조회 실패는 조용히 무시 — 아래에서 빈 목록으로 표시된다.
        }
      }
      setLoading(false);
    })();
  }, []);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!PASSWORD_PATTERN.test(newPassword)) {
      setErrorMessage("비밀번호는 8자리, 대문자 영문과 숫자만 사용할 수 있습니다.");
      setStatus("error");
      return;
    }
    setStatus("saving");
    setErrorMessage("");
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      setErrorMessage("비밀번호 변경에 실패했습니다.");
      setStatus("error");
      return;
    }
    setStatus("done");
    setNewPassword("");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  if (loading) {
    return (
      <AppShell>
        <PageHeading title="내 워크스페이스" description="불러오는 중입니다..." />
      </AppShell>
    );
  }

  if (isAnonymous) {
    return (
      <AppShell>
        <PageHeading
          title="내 워크스페이스"
          description="아직 정식 계정으로 전환되지 않았습니다."
        />
        <div className="mx-auto max-w-sm px-4 py-10 sm:px-6">
          <div className="rounded-2xl border border-[#dcecff] bg-gradient-to-br from-[#f0f8ff] to-[#edf7ff] p-7 text-sm text-slate-700 shadow-sm">
            <p>
              정식 이용 승인 후 담당자로부터 접속 아이디(사업자등록번호)와 비밀번호를 안내받으면
              로그인해서 이 화면에서 비밀번호를 변경할 수 있습니다.
            </p>
            <Link href="/login" className="primary-link mt-4 inline-flex">
              로그인하러 가기
            </Link>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageHeading
        title="내 워크스페이스"
        description="접속 계정 정보를 확인하고 비밀번호를 변경할 수 있습니다."
      />
      <div className="mx-auto max-w-sm space-y-6 px-4 py-10 sm:px-6">
        <div className="rounded-2xl border border-[#dcecff] bg-gradient-to-br from-[#f0f8ff] to-[#edf7ff] p-7 shadow-sm">
          <p className="text-sm font-semibold text-slate-900">등록된 사업장</p>
          {businesses.length === 0 ? (
            <p className="mt-2 text-xs text-slate-500">등록된 사업장이 없습니다.</p>
          ) : (
            <ul className="mt-2 space-y-1 text-sm text-slate-700">
              {businesses.map((b) => (
                <li key={b.id}>
                  {b.businessName || "(상호 미입력)"} ({b.businessRegistrationNumber})
                </li>
              ))}
            </ul>
          )}
        </div>

        <form
          onSubmit={handleChangePassword}
          className="space-y-3 rounded-2xl border border-[#dcecff] bg-white p-7 shadow-sm"
        >
          <p className="text-sm font-semibold text-slate-900">비밀번호 변경</p>
          <div>
            <FieldLabel>새 비밀번호</FieldLabel>
            <TextInput
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value.toUpperCase())}
              placeholder="예: AB23CD45"
              required
            />
            <p className="mt-1 text-xs text-slate-400">
              8자리, 대문자 영문과 숫자만 사용할 수 있습니다.
            </p>
          </div>
          {status === "error" && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">{errorMessage}</p>
          )}
          {status === "done" && (
            <p className="rounded-md bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
              비밀번호가 변경되었습니다.
            </p>
          )}
          <button
            type="submit"
            disabled={status === "saving"}
            className="primary-link w-full disabled:opacity-50"
          >
            {status === "saving" ? "변경 중..." : "비밀번호 변경"}
          </button>
        </form>

        <button type="button" onClick={handleLogout} className="secondary-link w-full">
          로그아웃
        </button>
      </div>
    </AppShell>
  );
}
