import { NextResponse } from "next/server";
import { createElement, type ReactElement } from "react";
import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer";
import { registerPdfFonts } from "@/lib/pdf/fonts";
import { ContractPdfDocument } from "@/components/pdf/ContractPdfDocument";
import type { ContractFormData } from "@/lib/contract-templates/types";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as ContractFormData | null;
  // 일부 항목이 비어있어도(서명 시 근로자가 직접 적는 용도 등) 항상 출력할 수 있어야 하므로,
  // 화면 미리보기와 동일하게 내용 완성도는 따지지 않는다 — 여기서는 형태만 확인한다.
  if (!body || typeof body !== "object" || !body.businessInfo) {
    return NextResponse.json({ error: "문서 내용을 확인할 수 없습니다." }, { status: 400 });
  }

  registerPdfFonts();
  const element = createElement(ContractPdfDocument, { data: body }) as ReactElement<DocumentProps>;
  const buffer = await renderToBuffer(element);

  const workerName = body.businessInfo.workerName || "근로계약서";
  const filename = encodeURIComponent(`${workerName}_근로계약서.pdf`);
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename*=UTF-8''${filename}`,
    },
  });
}
