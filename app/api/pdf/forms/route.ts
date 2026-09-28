import { NextResponse } from "next/server";
import { createElement, type ReactElement } from "react";
import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer";
import { registerPdfFonts } from "@/lib/pdf/fonts";
import { WorkerRegisterPdf } from "@/components/pdf/forms/WorkerRegisterPdf";
import { EmploymentCertificatePdf } from "@/components/pdf/forms/EmploymentCertificatePdf";
import { RetirementSettlementPdf } from "@/components/pdf/forms/RetirementSettlementPdf";
import { RepresentativeSelectionPdf } from "@/components/pdf/forms/RepresentativeSelectionPdf";
import { LeaveSubstitutionPdf } from "@/components/pdf/forms/LeaveSubstitutionPdf";
import { ResignationLetterPdf } from "@/components/pdf/forms/ResignationLetterPdf";
import { LeaveRequestPdf } from "@/components/pdf/forms/LeaveRequestPdf";
import { DismissalNoticePdf } from "@/components/pdf/forms/DismissalNoticePdf";

export const runtime = "nodejs";

const DOC_TYPE_LABEL: Record<string, string> = {
  근로자명부: "근로자명부",
  재직증명서: "재직증명서",
  "퇴직 정산 확인서": "퇴직정산확인서",
  "근로자대표 선임서": "근로자대표선임서",
  "연차유급휴가 대체 합의서": "연차대체합의서",
  사직서: "사직서",
  "휴가(연차) 신청서": "휴가신청서",
  해고예고통지서: "해고예고통지서",
};

interface FormsPdfRequest {
  docType: string;
  data: Record<string, unknown>;
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as FormsPdfRequest | null;
  if (!body?.docType || !body?.data) {
    return NextResponse.json({ error: "문서 내용을 확인할 수 없습니다." }, { status: 400 });
  }

  let element: ReactElement<DocumentProps> | null = null;
  switch (body.docType) {
    case "근로자명부":
      element = createElement(WorkerRegisterPdf, { data: body.data as never }) as ReactElement<DocumentProps>;
      break;
    case "재직증명서":
      element = createElement(EmploymentCertificatePdf, { data: body.data as never }) as ReactElement<DocumentProps>;
      break;
    case "퇴직 정산 확인서":
      element = createElement(RetirementSettlementPdf, { data: body.data as never }) as ReactElement<DocumentProps>;
      break;
    case "근로자대표 선임서":
      element = createElement(RepresentativeSelectionPdf, { data: body.data as never }) as ReactElement<DocumentProps>;
      break;
    case "연차유급휴가 대체 합의서":
      element = createElement(LeaveSubstitutionPdf, { data: body.data as never }) as ReactElement<DocumentProps>;
      break;
    case "사직서":
      element = createElement(ResignationLetterPdf, { data: body.data as never }) as ReactElement<DocumentProps>;
      break;
    case "휴가(연차) 신청서":
      element = createElement(LeaveRequestPdf, { data: body.data as never }) as ReactElement<DocumentProps>;
      break;
    case "해고예고통지서":
      element = createElement(DismissalNoticePdf, { data: body.data as never }) as ReactElement<DocumentProps>;
      break;
    default:
      return NextResponse.json({ error: "지원하지 않는 서식입니다." }, { status: 400 });
  }

  registerPdfFonts();
  const buffer = await renderToBuffer(element);

  const workerName = (body.data as { workerName?: string }).workerName || "문서";
  const label = DOC_TYPE_LABEL[body.docType] ?? "노무서식";
  const filename = encodeURIComponent(`${workerName}_${label}.pdf`);
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename*=UTF-8''${filename}`,
    },
  });
}
