"use client";

import { useState, useTransition } from "react";
import { BusinessRecord } from "@/lib/businesses/types";
import { deleteBusinessAction, logoutAdmin } from "./actions";

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
                <th className="px-4 py-3 text-right whitespace-nowrap">관리</th>
              </tr>
            </thead>
            <tbody>
              {businesses.map((b) => (
                <tr key={b.id} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-medium text-slate-900 whitespace-nowrap">
                    {b.businessName || "(상호 미입력)"}
                  </td>
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                    {b.businessRegistrationNumber}
                  </td>
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                    {b.representativeName || "-"}
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => handleDelete(b.id, b.businessName)}
                      disabled={isPending && pendingId === b.id}
                      className="text-red-600 hover:underline disabled:opacity-50"
                    >
                      {isPending && pendingId === b.id ? "삭제 중..." : "삭제"}
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
