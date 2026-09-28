"use client";

import { useState } from "react";

/** 승인된 사업장에서만 노출되는 다운로드 버튼. `onDownloadPdf`가 주어지면 실제 PDF 파일을
 * 생성해 다운로드하는 버튼을 함께 보여주고, 그렇지 않으면 브라우저 인쇄 기능만 제공한다.
 * `disabledReason`을 주면 (필수 항목 미입력 등) 두 버튼을 모두 막고 그 사유를 보여준다 —
 * 막지 않으면 서버가 400을 반환해 "PDF 생성에 실패했습니다"라는, 재시도해도 소용없는
 * 오해의 소지가 있는 에러만 보이게 된다. */
export function PrintDownloadButton({
  onDownloadPdf,
  disabledReason,
}: {
  onDownloadPdf?: () => Promise<void>;
  disabledReason?: string;
}) {
  const [status, setStatus] = useState<"idle" | "generating" | "error">("idle");
  const isDisabled = Boolean(disabledReason);

  const handleDownload = async () => {
    if (!onDownloadPdf || isDisabled) return;
    setStatus("generating");
    try {
      await onDownloadPdf();
      setStatus("idle");
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        {onDownloadPdf && (
          <button
            type="button"
            onClick={handleDownload}
            disabled={isDisabled || status === "generating"}
            className="primary-link flex-1 disabled:opacity-50"
          >
            {status === "generating" ? "PDF 생성 중..." : "PDF 다운로드"}
          </button>
        )}
        <button
          type="button"
          onClick={() => window.print()}
          disabled={isDisabled}
          className={
            (onDownloadPdf ? "secondary-link flex-1" : "primary-link w-full") +
            " disabled:opacity-50"
          }
        >
          인쇄하기
        </button>
      </div>
      {isDisabled ? (
        <p className="rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-700">
          {disabledReason}
        </p>
      ) : (
        status === "error" && (
          <p className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">
            PDF 생성에 실패했습니다. 잠시 후 다시 시도해주세요.
          </p>
        )
      )}
    </div>
  );
}
