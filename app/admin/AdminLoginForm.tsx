"use client";

import { useActionState } from "react";
import { LogoMark } from "@/components/layout/AppShell";
import { loginAdmin, LoginState } from "./actions";

const initialState: LoginState = {};

export function AdminLoginForm() {
  const [state, formAction, pending] = useActionState(loginAdmin, initialState);

  return (
    <form
      action={formAction}
      className="space-y-4 rounded-2xl border border-[#dcecff] bg-gradient-to-br from-[#f0f8ff] to-[#edf7ff] p-7 shadow-sm"
    >
      <div className="mb-1 flex justify-center">
        <LogoMark size={40} />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          관리자 비밀번호
        </label>
        <input
          type="password"
          name="password"
          autoFocus
          required
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button type="submit" disabled={pending} className="primary-link w-full disabled:opacity-50">
        {pending ? "확인 중..." : "입장"}
      </button>
    </form>
  );
}
