"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AppShell, PageHeading } from "@/components/layout/AppShell";
import { BusinessRecord } from "@/lib/businesses/types";
import { listMyBusinesses } from "@/lib/businesses/store";
import { ensureSession } from "@/lib/supabase/session";
import * as adminBusinessApi from "@/lib/admin/adminBusinessApi";
import {
  getStoredBusinessRegNumber,
  setStoredBusinessRegNumber,
} from "@/lib/businesses/currentBusiness";
import { listEmployees } from "@/lib/employees/store";
import { EmployeeRecord } from "@/lib/employees/types";
import { SectionCard } from "@/components/forms/fields";
import { PrintGate } from "@/components/preview/PrintGate";
import { PrintDownloadButton } from "@/components/preview/PrintDownloadButton";
import { InquiryNote } from "@/components/forms/InquiryNote";
import { DisclaimerNote } from "@/components/legal/DisclaimerNote";
import { fetchAndDownloadPdf } from "@/lib/pdf/downloadPdf";
import { useIsAdmin } from "@/lib/admin/useIsAdmin";
import {
  RepresentativeSelectionForm,
  RepresentativeSelectionPreview,
  RepresentativeSelectionData,
} from "@/components/documents/RepresentativeSelectionDoc";
import {
  LeaveSubstitutionForm,
  LeaveSubstitutionPreview,
  LeaveSubstitutionData,
} from "@/components/documents/LeaveSubstitutionDoc";
import {
  ResignationLetterForm,
  ResignationLetterPreview,
  ResignationLetterData,
} from "@/components/documents/ResignationLetterDoc";
import {
  LeaveRequestForm,
  LeaveRequestPreview,
  LeaveRequestData,
} from "@/components/documents/LeaveRequestDoc";
import {
  DismissalNoticeForm,
  DismissalNoticePreview,
  DismissalNoticeData,
} from "@/components/documents/DismissalNoticeDoc";
import {
  WorkerRegisterForm,
  WorkerRegisterPreview,
  WorkerRegisterData,
} from "@/components/documents/WorkerRegisterDoc";
import {
  EmploymentCertificateForm,
  EmploymentCertificatePreview,
  EmploymentCertificateData,
} from "@/components/documents/EmploymentCertificateDoc";
import {
  RetirementSettlementForm,
  RetirementSettlementPreview,
  RetirementSettlementData,
} from "@/components/documents/RetirementSettlementDoc";

const DOC_TYPES = [
  "근로자명부",
  "재직증명서",
  "퇴직 정산 확인서",
  "근로자대표 선임서",
  "연차유급휴가 대체 합의서",
  "사직서",
  "휴가(연차) 신청서",
  "해고예고통지서",
] as const;
type DocType = (typeof DOC_TYPES)[number];

export default function FormsPage() {
  return (
    <Suspense
      fallback={
        <AppShell>
          <PageHeading title="노무서식" description="불러오는 중입니다..." />
        </AppShell>
      }
    >
      <FormsPageContent />
    </Suspense>
  );
}

function FormsPageContent() {
  const isAdmin = useIsAdmin();
  const searchParams = useSearchParams();
  const adminBusinessId = isAdmin ? searchParams.get("adminBusinessId") : null;
  const [business, setBusiness] = useState<BusinessRecord | null>(null);
  const [businessCheckDone, setBusinessCheckDone] = useState(false);
  const [employees, setEmployees] = useState<EmployeeRecord[]>([]);
  const [docType, setDocType] = useState<DocType>(DOC_TYPES[0]);
  const [docTypeChosen, setDocTypeChosen] = useState(false);

  const [repSelectionData, setRepSelectionData] = useState<RepresentativeSelectionData | null>(null);
  const [leaveSubData, setLeaveSubData] = useState<LeaveSubstitutionData | null>(null);
  const [resignationData, setResignationData] = useState<ResignationLetterData | null>(null);
  const [leaveRequestData, setLeaveRequestData] = useState<LeaveRequestData | null>(null);
  const [dismissalData, setDismissalData] = useState<DismissalNoticeData | null>(null);
  const [workerRegisterData, setWorkerRegisterData] = useState<WorkerRegisterData | null>(null);
  const [certData, setCertData] = useState<EmploymentCertificateData | null>(null);
  const [settlementData, setSettlementData] = useState<RetirementSettlementData | null>(null);

  useEffect(() => {
    if (adminBusinessId) {
      adminBusinessApi
        .getBusiness(adminBusinessId)
        .then(setBusiness)
        .finally(() => setBusinessCheckDone(true));
      return;
    }
    (async () => {
      try {
        await ensureSession();
        const mine = await listMyBusinesses();
        if (mine.length === 0) {
          setStoredBusinessRegNumber(null);
          return;
        }
        const savedRegNumber = getStoredBusinessRegNumber();
        const match =
          mine.find((b) => b.businessRegistrationNumber === savedRegNumber) ?? mine[0];
        setBusiness(match);
        setStoredBusinessRegNumber(match.businessRegistrationNumber);
      } catch {
        // 세션 생성 실패 시에는 사업장 조회/등록 화면으로 진행한다.
      } finally {
        setBusinessCheckDone(true);
      }
    })();
  }, [adminBusinessId]);

  useEffect(() => {
    if (!business) return;
    const load = adminBusinessId ? adminBusinessApi.listEmployees : listEmployees;
    load(business.id)
      .then(setEmployees)
      .catch(() => setEmployees([]));
  }, [business, adminBusinessId]);

  if (!businessCheckDone) {
    return (
      <AppShell>
        <PageHeading title="노무서식" description="사업장 정보를 확인하는 중입니다..." />
      </AppShell>
    );
  }

  if (!business && adminBusinessId) {
    return (
      <AppShell>
        <PageHeading title="노무서식" description="해당 사업장을 찾을 수 없습니다." />
      </AppShell>
    );
  }

  if (!business) {
    return (
      <AppShell>
        <PageHeading title="노무서식" description="사업장이 아직 등록되지 않았습니다." />
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
          <p className="rounded-md border border-dashed border-slate-300 p-4 text-sm text-slate-600">
            노무서식은 근로계약서 페이지에서 등록한 사업장·직원 정보를 그대로 불러와 사용합니다.
            먼저{" "}
            <a href="/apply" className="font-semibold text-blue-600 underline">
              지금 시작하기(근로계약서 작성)
            </a>
            에서 사업장 정보를 입력해주세요.
          </p>
        </div>
      </AppShell>
    );
  }

  const buildPdfPayload = () => {
    switch (docType) {
      case "근로자명부":
        return {
          docType,
          data:
            workerRegisterData ?? {
              businessName: business.businessName,
              representativeName: business.representativeName,
              workerName: "",
              birthDate: "",
              address: "",
              phone: "",
              dependents: 0,
              jobDescription: "",
              qualification: "",
              education: "",
              career: "",
              militaryService: "",
              hireDate: "",
              contractRenewalDate: "매년 1월 1일",
              dismissalDate: "",
              resignationDate: "",
              resignationReason: "",
              clearance: "",
              specialNotes: "",
            },
        };
      case "재직증명서":
        return {
          docType,
          data:
            certData ?? {
              business,
              certNumber: "",
              workerName: "",
              birthDate: "",
              address: "",
              workLocation: "",
              phone: "",
              hireDate: "",
              asOfDate: "",
              purpose: "제출용",
              copies: 1,
              issueDate: "",
            },
        };
      case "퇴직 정산 확인서":
        return {
          docType,
          data:
            settlementData ?? {
              businessName: business.businessName,
              representativeName: business.representativeName,
              workerName: "",
              workerBirthDate: "",
              position: "",
              settlementAmount: 0,
              paymentDate: "",
              paymentMethod: "계좌이체",
              bankName: "",
              accountNumber: "",
              accountHolder: "",
              hireDate: "",
              resignationDate: "",
              agreementDate: "",
            },
        };
      case "근로자대표 선임서":
        return {
          docType,
          data:
            repSelectionData ?? {
              businessName: business.businessName,
              representativeName: business.representativeName,
              repName: "",
              repBirthDate: "",
              termStart: "",
              termEnd: "",
              voters: [],
            },
        };
      case "연차유급휴가 대체 합의서":
        return {
          docType,
          data:
            leaveSubData ?? {
              businessName: business.businessName,
              representativeName: business.representativeName,
              repName: "",
              effectiveStart: "",
              effectiveEnd: "",
              pairs: [],
            },
        };
      case "사직서":
        return {
          docType,
          data:
            resignationData ?? {
              businessName: business.businessName,
              representativeName: business.representativeName,
              workerName: "",
              workLocation: "",
              address: "",
              phone: "",
              hireDate: "",
              resignationDate: "",
              retirementType: "이직",
              reason: "",
              writtenDate: "",
            },
        };
      case "휴가(연차) 신청서":
        return {
          docType,
          data:
            leaveRequestData ?? {
              businessName: business.businessName,
              representativeName: business.representativeName,
              workerName: "",
              contact: "",
              applyDate: "",
              leaveType: "연차휴가",
              startDate: "",
              endDate: "",
              note: "",
            },
        };
      case "해고예고통지서":
        return {
          docType,
          data:
            dismissalData ?? {
              businessName: business.businessName,
              representativeName: business.representativeName,
              businessAddress: business.businessAddress,
              workerName: "",
              workerBirthDate: "",
              hireDate: "",
              position: "",
              reason: "",
              noticeDate: "",
              dismissalDate: "",
            },
        };
      default:
        return { docType, data: {} };
    }
  };

  return (
    <AppShell>
      <PageHeading
        title="노무서식"
        description="사업장에서 자주 쓰는 노무 서식을 사업자정보가 자동으로 채워진 상태로 바로 작성·출력할 수 있습니다."
      />

      {adminBusinessId ? (
        <div className="mx-auto max-w-6xl px-4 pt-4 text-sm sm:px-6 print:hidden">
          <div className="rounded-md bg-emerald-50 px-4 py-3 text-emerald-800">
            관리자 열람 모드:{" "}
            <span className="font-semibold">{business.businessName || "(상호 미입력)"}</span> (
            {business.businessRegistrationNumber}) — 승인 여부와 무관하게 자유롭게 수정·출력할 수
            있습니다.
          </div>
        </div>
      ) : (
        <div className="mx-auto max-w-6xl px-4 pt-4 text-sm text-slate-600 sm:px-6 print:hidden">
          <span>
            현재 사업장:{" "}
            <span className="font-semibold text-slate-900">
              {business.businessName || "(상호 미입력)"}
            </span>{" "}
            ({business.businessRegistrationNumber})
          </span>
        </div>
      )}

      <main className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 py-6 sm:gap-8 sm:px-6 sm:py-8 print:block print:max-w-none print:gap-0 print:p-0 lg:grid-cols-2">
        <div className="space-y-6 print:hidden">
          <SectionCard title="서식 종류 선택">
            <select
              className={
                "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" +
                (docTypeChosen ? "" : " doc-type-attention")
              }
              value={docType}
              onChange={(e) => {
                setDocType(e.target.value as DocType);
                setDocTypeChosen(true);
              }}
            >
              {DOC_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            {!docTypeChosen && (
              <p className="mt-2 text-xs text-blue-600">
                작성하실 서식을 선택해주세요. (기본값: 근로자명부)
              </p>
            )}
          </SectionCard>

          <SectionCard title={docType}>
            {docType === "근로자명부" && (
              <WorkerRegisterForm
                businessName={business.businessName}
                representativeName={business.representativeName}
                employees={employees}
                onDataChange={setWorkerRegisterData}
              />
            )}
            {docType === "재직증명서" && (
              <EmploymentCertificateForm
                business={business}
                employees={employees}
                onDataChange={setCertData}
              />
            )}
            {docType === "퇴직 정산 확인서" && (
              <RetirementSettlementForm
                businessName={business.businessName}
                representativeName={business.representativeName}
                employees={employees}
                onDataChange={setSettlementData}
              />
            )}
            {docType === "근로자대표 선임서" && (
              <RepresentativeSelectionForm
                businessName={business.businessName}
                representativeName={business.representativeName}
                onDataChange={setRepSelectionData}
              />
            )}
            {docType === "연차유급휴가 대체 합의서" && (
              <LeaveSubstitutionForm
                businessName={business.businessName}
                representativeName={business.representativeName}
                onDataChange={setLeaveSubData}
              />
            )}
            {docType === "사직서" && (
              <ResignationLetterForm
                businessName={business.businessName}
                representativeName={business.representativeName}
                onDataChange={setResignationData}
              />
            )}
            {docType === "휴가(연차) 신청서" && (
              <LeaveRequestForm
                businessName={business.businessName}
                representativeName={business.representativeName}
                onDataChange={setLeaveRequestData}
              />
            )}
            {docType === "해고예고통지서" && (
              <DismissalNoticeForm
                businessName={business.businessName}
                representativeName={business.representativeName}
                businessAddress={business.businessAddress}
                employees={employees}
                onDataChange={setDismissalData}
              />
            )}
          </SectionCard>
        </div>

        <div className="lg:sticky lg:top-6 lg:self-start print:static print:top-0">
          <p className="mb-3 text-sm font-semibold text-slate-500 print:hidden">서식 미리보기</p>
          <PrintGate approved={isAdmin || business.approved}>
          {docType === "근로자명부" && (
            <WorkerRegisterPreview
              data={
                workerRegisterData ?? {
                  businessName: business.businessName,
                  representativeName: business.representativeName,
                  workerName: "",
                  birthDate: "",
                  address: "",
                  phone: "",
                  dependents: 0,
                  jobDescription: "",
                  qualification: "",
                  education: "",
                  career: "",
                  militaryService: "",
                  hireDate: "",
                  contractRenewalDate: "매년 1월 1일",
                  dismissalDate: "",
                  resignationDate: "",
                  resignationReason: "",
                  clearance: "",
                  specialNotes: "",
                }
              }
            />
          )}
          {docType === "재직증명서" && (
            <EmploymentCertificatePreview
              data={
                certData ?? {
                  business,
                  certNumber: "",
                  workerName: "",
                  birthDate: "",
                  address: "",
                  workLocation: "",
                  phone: "",
                  hireDate: "",
                  asOfDate: "",
                  purpose: "제출용",
                  copies: 1,
                  issueDate: "",
                }
              }
            />
          )}
          {docType === "퇴직 정산 확인서" && (
            <RetirementSettlementPreview
              data={
                settlementData ?? {
                  businessName: business.businessName,
                  representativeName: business.representativeName,
                  workerName: "",
                  workerBirthDate: "",
                  position: "",
                  settlementAmount: 0,
                  paymentDate: "",
                  paymentMethod: "계좌이체",
                  bankName: "",
                  accountNumber: "",
                  accountHolder: "",
                  hireDate: "",
                  resignationDate: "",
                  agreementDate: "",
                }
              }
            />
          )}
          {docType === "근로자대표 선임서" && (
            <RepresentativeSelectionPreview
              data={
                repSelectionData ?? {
                  businessName: business.businessName,
                  representativeName: business.representativeName,
                  repName: "",
                  repBirthDate: "",
                  termStart: "",
                  termEnd: "",
                  voters: [],
                }
              }
            />
          )}
          {docType === "연차유급휴가 대체 합의서" && (
            <LeaveSubstitutionPreview
              data={
                leaveSubData ?? {
                  businessName: business.businessName,
                  representativeName: business.representativeName,
                  repName: "",
                  effectiveStart: "",
                  effectiveEnd: "",
                  pairs: [],
                }
              }
            />
          )}
          {docType === "사직서" && (
            <ResignationLetterPreview
              data={
                resignationData ?? {
                  businessName: business.businessName,
                  representativeName: business.representativeName,
                  workerName: "",
                  workLocation: "",
                  address: "",
                  phone: "",
                  hireDate: "",
                  resignationDate: "",
                  retirementType: "이직",
                  reason: "",
                  writtenDate: "",
                }
              }
            />
          )}
          {docType === "휴가(연차) 신청서" && (
            <LeaveRequestPreview
              data={
                leaveRequestData ?? {
                  businessName: business.businessName,
                  representativeName: business.representativeName,
                  workerName: "",
                  contact: "",
                  applyDate: "",
                  leaveType: "연차휴가",
                  startDate: "",
                  endDate: "",
                  note: "",
                }
              }
            />
          )}
          {docType === "해고예고통지서" && (
            <DismissalNoticePreview
              data={
                dismissalData ?? {
                  businessName: business.businessName,
                  representativeName: business.representativeName,
                  businessAddress: business.businessAddress,
                  workerName: "",
                  workerBirthDate: "",
                  hireDate: "",
                  position: "",
                  reason: "",
                  noticeDate: "",
                  dismissalDate: "",
                }
              }
            />
          )}
          </PrintGate>
          <DisclaimerNote className="mt-4 print:hidden" />
          <div className="mt-4 print:hidden">
            {isAdmin || business.approved ? (
              <PrintDownloadButton
                onDownloadPdf={() =>
                  fetchAndDownloadPdf("/api/pdf/forms", buildPdfPayload(), "노무서식.pdf")
                }
              />
            ) : (
              <InquiryNote
                businessRegistrationNumber={business.businessRegistrationNumber}
                businessName={business.businessName}
              />
            )}
          </div>
        </div>
      </main>
    </AppShell>
  );
}
