"use client";

import { useState, useTransition } from "react";
import { BusinessRecord } from "@/lib/businesses/types";
import { approveBusinessAction, deleteBusinessAction, issueLoginAction, logoutAdmin } from "./actions";

export function AdminBusinessList({ businesses }: { businesses: BusinessRecord[] }) {
  const [isPending, startTransition] = useTransition();
  const [pendingId, setPendingId] = useState<string | null>(null);

  const handleDelete = (id: string, name: string) => {
    if (
      !confirm(
        `"${name || "(상호 미입력)"}" 사업장과 소속 직원 정보를 모두 삭제할까요?\n되돌릴 수 없습니다.`
      )
    )
      return;
    setPendingId(id);
    startTransition(async () => {
      await deleteBusinessAction(id);
      setPendingId(null);
    });
  };

  const handleOpen = (id: string) => {
    window.open(`/apply?adminBusinessId=${id}`, "_blank");
  };

  const handleToggleApprove = (id: string, approved: boolean) => {
    setPendingId(id);
    startTransition(async () => {
      await approveBusinessAction(id, approved);
      setPendingId(null);
    });
  };

  const handleIssueLogin = (id: string, regNumber: string) => {
    if (
      !confirm(
        `"${regNumber}"의 로그인 비밀번호를 새로 발급할까요?\n기존 비밀번호가 있었다면 무효화됩니다.`
      )
    )
      return;
    setPendingId(id);
    startTransition(async () => {
      try {
        const { password } = await issueLoginAction(id);
        window.prompt(
          `접속 아이디: ${regNumber} (사업자등록번호 그대로)\n비밀번호를 복사해서 전달하세요:`,
          password
        );
      } catch (err) {
        alert(err instanceof Error ? err.message : "비밀번호 발급에 실패했습니다.");
      }
      setPendingId(null);
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">총 {businesses.length}개 사업장</p>
        <form action={logoutAdmin}>
          <button type="submit" className="text-sm text-slate-500 hover:underline">
            로그아웃
          </button>
        </form>
      </div>

      {businesses.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-sm text-slate-400">
          등록된 사업장이 없습니다.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs text-slate-500">
              <tr>
                <th className="px-4 py-3 whitespace-nowrap">사업장명</th>
                <th className="px-4 py-3 whitespace-nowrap">사업자등록번호</th>
                <th className="px-4 py-3 whitespace-nowrap">대표자</th>
                <th className="px-4 py-3 whitespace-nowrap">상태</th>
                <th className="px-4 py-3 text-right whitespace-nowrap">관리</th>
              </tr>
            </thead>
            <tbody>
              {businesses.map((b) => (
                <tr key={b.id} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-medium text-slate-900 whitespace-nowrap">
                    {b.businessName || "(상호 미입력)"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => handleOpen(b.id)}
                      className="text-slate-600 underline decoration-dotted hover:text-blue-600"
                      title="이 사업장 정보 전체 보기"
                    >
                      {b.businessRegistrationNumber}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                    {b.representativeName || "-"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {b.approved ? (
                      <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">
                        승인됨
                      </span>
                    ) : (
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-500">
                        미승인
                      </span>
                    )}
                  </td>
                  <td className="space-x-3 px-4 py-3 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => handleToggleApprove(b.id, !b.approved)}
                      disabled={isPending && pendingId === b.id}
                      className={
                        "hover:underline disabled:opacity-50 " +
                        (b.approved ? "text-slate-500" : "text-blue-600")
                      }
                    >
                      {isPending && pendingId === b.id ? "처리 중..." : b.approved ? "승인 취소" : "승인"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleIssueLogin(b.id, b.businessRegistrationNumber)}
                      disabled={isPending && pendingId === b.id}
                      className="text-emerald-600 hover:underline disabled:opacity-50"
                    >
                      비밀번호 발급
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(b.id, b.businessName)}
                      disabled={isPending && pendingId === b.id}
                      className="text-red-600 hover:underline disabled:opacity-50"
                    >
                      삭제
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
