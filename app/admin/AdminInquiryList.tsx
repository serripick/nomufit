"use client";

import { useState, useTransition } from "react";
import { InquiryRecord } from "@/lib/inquiries/types";
import { updateInquiryStatusAction } from "./actions";

const STATUS_LABEL: Record<InquiryRecord["status"], string> = {
  new: "신규",
  contacted: "연락함",
  closed: "종료",
};

export function AdminInquiryList({ inquiries }: { inquiries: InquiryRecord[] }) {
  const [isPending, startTransition] = useTransition();
  const [pendingId, setPendingId] = useState<string | null>(null);

  const handleStatusChange = (id: string, status: InquiryRecord["status"]) => {
    setPendingId(id);
    startTransition(async () => {
      await updateInquiryStatusAction(id, status);
      setPendingId(null);
    });
  };

  if (inquiries.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-sm text-slate-400">
        접수된 문의가 없습니다.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {inquiries.map((inq) => (
        <div key={inq.id} className="rounded-xl border border-slate-200 bg-white p-4 text-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-semibold text-slate-900">
              {inq.businessName || "(상호 미입력)"}{" "}
              <span className="font-normal text-slate-400">({inq.businessRegistrationNumber || "번호 미입력"})</span>
            </p>
            <select
              value={inq.status}
              disabled={isPending && pendingId === inq.id}
              onChange={(e) => handleStatusChange(inq.id, e.target.value as InquiryRecord["status"])}
              className="rounded-md border border-slate-300 px-2 py-1 text-xs"
            >
              {(Object.keys(STATUS_LABEL) as InquiryRecord["status"][]).map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABEL[s]}
                </option>
              ))}
            </select>
          </div>
          <p className="mt-1 text-slate-600">
            담당자: {inq.contactName} / {inq.contactPhone}
          </p>
          {inq.message && <p className="mt-1 text-slate-500">메시지: {inq.message}</p>}
          <p className="mt-1 text-xs text-slate-400">
            {new Date(inq.createdAt).toLocaleString("ko-KR")}
          </p>
        </div>
      ))}
    </div>
  );
}
