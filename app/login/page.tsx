"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { AppShell, LogoMark, PageHeading } from "@/components/layout/AppShell";
import { FieldLabel, TextInput } from "@/components/forms/fields";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setErrorMessage("이메일 또는 비밀번호가 올바르지 않습니다.");
      setStatus("error");
      return;
    }
    router.push("/apply");
  };

  return (
    <AppShell>
      <PageHeading
        title="로그인"
        description="정식 이용 승인 후 설정한 이메일과 비밀번호로 로그인하면, 다른 기기에서도 우리 사업장 정보를 이어서 관리할 수 있습니다."
      />
      <div className="mx-auto max-w-sm px-4 py-10 sm:px-6">
        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-2xl border border-[#dcecff] bg-gradient-to-br from-[#f0f8ff] to-[#edf7ff] p-7 shadow-sm"
        >
          <div className="mb-1 flex justify-center">
            <LogoMark size={40} />
          </div>
          <div>
            <FieldLabel>이메일</FieldLabel>
            <TextInput
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <FieldLabel>비밀번호</FieldLabel>
            <TextInput
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {status === "error" && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">{errorMessage}</p>
          )}
          <button
            type="submit"
            disabled={status === "loading"}
            className="primary-link w-full disabled:opacity-50"
          >
            {status === "loading" ? "로그인 중..." : "로그인"}
          </button>
          <p className="text-xs text-slate-500">
            아직 계정이 없으신가요? 처음 방문 시 자동으로 임시로 이용해보실 수 있고, 정식 이용
            승인 후 계정을 설정하실 수 있습니다.
          </p>
        </form>
      </div>
    </AppShell>
  );
}
