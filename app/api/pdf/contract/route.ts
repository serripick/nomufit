import { NextResponse } from "next/server";
import { createElement, type ReactElement } from "react";
import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer";
import { registerPdfFonts } from "@/lib/pdf/fonts";
import { ContractPdfDocument } from "@/components/pdf/ContractPdfDocument";
import { contractFormSchema } from "@/lib/contract-templates/schemas";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = contractFormSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "문서 내용을 확인할 수 없습니다." }, { status: 400 });
  }

  registerPdfFonts();
  const element = createElement(ContractPdfDocument, { data: parsed.data }) as ReactElement<DocumentProps>;
  const buffer = await renderToBuffer(element);

  const workerName = parsed.data.businessInfo.workerName || "근로계약서";
  const filename = encodeURIComponent(`${workerName}_근로계약서.pdf`);
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename*=UTF-8''${filename}`,
    },
  });
}
