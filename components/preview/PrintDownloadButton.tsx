"use client";

import { useState } from "react";

/** 승인된 사업장에서만 노출되는 다운로드 버튼. `onDownloadPdf`가 주어지면 실제 PDF 파일을
 * 생성해 다운로드하는 버튼을 함께 보여주고, 그렇지 않으면 브라우저 인쇄 기능만 제공한다.
 * 일부 항목이 비어있어도(서명 시 근로자가 직접 적는 용도 등) 항상 출력할 수 있어야 하므로
 * 입력 완성도로 버튼을 막지 않는다. */
export function PrintDownloadButton({
  onDownloadPdf,
}: {
  onDownloadPdf?: () => Promise<void>;
}) {
  const [status, setStatus] = useState<"idle" | "generating" | "error">("idle");

  const handleDownload = async () => {
    if (!onDownloadPdf) return;
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
            disabled={status === "generating"}
            className="primary-link flex-1 disabled:opacity-50"
          >
            {status === "generating" ? "PDF 생성 중..." : "PDF 다운로드"}
          </button>
        )}
        <button
          type="button"
          onClick={() => window.print()}
          className={onDownloadPdf ? "secondary-link flex-1" : "primary-link w-full"}
        >
          인쇄하기
        </button>
      </div>
      {status === "error" && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">
          PDF 생성에 실패했습니다. 잠시 후 다시 시도해주세요.
        </p>
      )}
    </div>
  );
}
