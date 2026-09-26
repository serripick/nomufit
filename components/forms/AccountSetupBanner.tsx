"use client";

import { useState } from "react";
import { upgradeAnonymousAccount } from "@/lib/auth/upgradeAccount";
import { updateBusiness } from "@/lib/businesses/store";
import { BusinessRecord } from "@/lib/businesses/types";
import { FieldLabel, TextInput } from "./fields";

/** 승인된 사업장이 아직 익명 세션이면 /apply에 노출된다. 이메일+비밀번호를 설정하면 지금
 * 세션이 영구 계정으로 바뀌어 다른 기기에서도 로그인할 수 있게 된다. */
export function AccountSetupBanner({ business }: { business: BusinessRecord }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setErrorMessage("비밀번호는 6자 이상으로 입력해주세요.");
      setStatus("error");
      return;
    }
    setStatus("saving");
    setErrorMessage("");
    try {
      await upgradeAnonymousAccount(email, password);
      await updateBusiness(business.id, {
        businessRegistrationNumber: business.businessRegistrationNumber,
        businessName: business.businessName,
        representativeName: business.representativeName,
        businessAddress: business.businessAddress,
        businessPhone: business.businessPhone,
        fiveOrMoreEmployees: business.fiveOrMoreEmployees,
        email,
      });
      setStatus("done");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "계정 설정에 실패했습니다.");
      setStatus("error");
    }
  };

  if (status === "done") {
    return (
      <div className="rounded-md border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 print:hidden">
        계정이 설정되었습니다. 이제 다른 기기에서도 이 이메일과 비밀번호로 로그인해 이어서
        관리할 수 있습니다.
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3 rounded-md border border-blue-200 bg-blue-50 p-4 print:hidden"
    >
      <div>
        <p className="text-sm font-semibold text-slate-900">정식 이용이 승인되었습니다!</p>
        <p className="mt-1 text-xs text-slate-600">
          이메일과 비밀번호를 설정하면, 다른 기기에서도 로그인해서 우리 사업장 정보를 이어서
          관리할 수 있습니다.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
          <FieldLabel>비밀번호 (6자 이상)</FieldLabel>
          <TextInput
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
      </div>
      {status === "error" && <p className="text-xs text-red-600">{errorMessage}</p>}
      <button
        type="submit"
        disabled={status === "saving"}
        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {status === "saving" ? "설정 중..." : "계정 설정하기"}
      </button>
    </form>
  );
}
