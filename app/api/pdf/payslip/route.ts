import { NextResponse } from "next/server";
import { createElement, type ReactElement } from "react";
import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer";
import { registerPdfFonts } from "@/lib/pdf/fonts";
import { PayslipPdfDocument } from "@/components/pdf/PayslipPdfDocument";
import { EmployeeRecord } from "@/lib/employees/types";
import { WageBreakdown } from "@/lib/contract-templates/wage-calc";
import { PayslipDeductions } from "@/lib/contract-templates/payslipCalc";

export const runtime = "nodejs";

interface PayslipPdfRequest {
  employee: EmployeeRecord;
  breakdown: WageBreakdown;
  deductions: PayslipDeductions;
  payYear: number;
  payMonth: number;
  payDay: number;
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as PayslipPdfRequest | null;
  if (!body?.employee || !body?.breakdown || !body?.deductions) {
    return NextResponse.json({ error: "문서 내용을 확인할 수 없습니다." }, { status: 400 });
  }

  registerPdfFonts();
  const element = createElement(PayslipPdfDocument, body) as ReactElement<DocumentProps>;
  const buffer = await renderToBuffer(element);

  const workerName = body.employee.workerName || "임금명세서";
  const filename = encodeURIComponent(`${workerName}_임금명세서.pdf`);
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename*=UTF-8''${filename}`,
    },
  });
}
