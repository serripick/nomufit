"use client";

import { useState } from "react";
import { submitInquiry } from "@/lib/inquiries/store";
import { formatPhoneNumber } from "@/lib/contract-templates/inputFormatters";
import { FieldLabel, TextInput } from "./fields";

export function InquiryForm({
  businessRegistrationNumber = "",
  businessName = "",
}: {
  /** 특정 사업장의 출력 승인 문의일 때만 전달한다. 없으면(예: 홈 화면 일반 문의) 사업장
   * 정보 없이 접수되는 일반 상담 문의로 취급한다. */
  businessRegistrationNumber?: string;
  businessName?: string;
}) {
  const hasBusiness = Boolean(businessRegistrationNumber);
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [message, setMessage] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !contactPhone.trim()) {
      setErrorMessage("담당자명과 연락처를 입력해주세요.");
      return;
    }
    if (!agreed) {
      setErrorMessage("안내 사항에 동의해주셔야 신청이 접수됩니다.");
      return;
    }
    setStatus("sending");
    setErrorMessage("");
    try {
      await submitInquiry({ businessRegistrationNumber, businessName, contactName, contactPhone, message });
      setStatus("done");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "문의 접수에 실패했습니다.");
      setStatus("error");
    }
  };

  if (status === "done") {
    return (
      <div className="rounded-md border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 print:hidden">
        문의가 접수되었습니다. 확인 후 안내드리겠습니다.
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3 rounded-md border border-blue-200 bg-blue-50 p-4 print:hidden"
    >
      <div>
        <p className="text-sm font-semibold text-slate-900">
          {hasBusiness ? "정식 이용(저장 문서 출력)을 신청하시겠어요?" : "노무핏 도입/이용이 궁금하신가요?"}
        </p>
        <p className="mt-1 text-xs text-slate-600">
          {hasBusiness
            ? "담당자 연락처를 남겨주시면 확인 후 이용 방법을 안내해드립니다. 입력해주신 사업장 정보는 이미 저장되어 있어 다시 입력하실 필요는 없습니다."
            : "담당자 연락처를 남겨주시면 확인 후 이용 방법과 요금을 안내해드립니다."}
        </p>
        <p className="mt-2 rounded-md bg-white px-3 py-2 text-xs font-medium text-blue-700">
          이용요금: 월 29,000원 · 연간 결제 시 240,000원 (약 31% 할인)
        </p>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <FieldLabel>담당자명</FieldLabel>
          <TextInput value={contactName} onChange={(e) => setContactName(e.target.value)} />
        </div>
        <div>
          <FieldLabel>연락처</FieldLabel>
          <TextInput
            placeholder="010-1234-5678"
            value={contactPhone}
            onChange={(e) => setContactPhone(formatPhoneNumber(e.target.value))}
          />
        </div>
      </div>
      <div>
        <FieldLabel>남기실 말씀 (선택)</FieldLabel>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={2}
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
      <label className="flex items-start gap-2 text-xs text-slate-600">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mt-0.5"
        />
        본 서비스가 생성하는 문서는 참고용이며, 최종 검토 및 법적 책임은 이용자 본인에게 있음에
        동의합니다.
      </label>
      {errorMessage && <p className="text-xs text-red-600">{errorMessage}</p>}
      <button
        type="submit"
        disabled={status === "sending"}
        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {status === "sending" ? "접수 중..." : hasBusiness ? "이용 신청하기" : "문의하기"}
      </button>
    </form>
  );
}
