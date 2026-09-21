"use client";

import { useEffect, useState } from "react";
import { AppShell, PageHeading } from "@/components/layout/AppShell";
import { BusinessGate } from "@/components/forms/BusinessGate";
import { BusinessRecord } from "@/lib/businesses/types";
import { findBusinessByRegistrationNumber } from "@/lib/businesses/store";
import {
  getStoredBusinessRegNumber,
  setStoredBusinessRegNumber,
} from "@/lib/businesses/currentBusiness";
import { listEmployees } from "@/lib/employees/store";
import { EmployeeRecord } from "@/lib/employees/types";
import { SectionCard } from "@/components/forms/fields";
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
  const [business, setBusiness] = useState<BusinessRecord | null>(null);
  const [businessCheckDone, setBusinessCheckDone] = useState(false);
  const [employees, setEmployees] = useState<EmployeeRecord[]>([]);
  const [docType, setDocType] = useState<DocType>(DOC_TYPES[0]);

  const [repSelectionData, setRepSelectionData] = useState<RepresentativeSelectionData | null>(null);
  const [leaveSubData, setLeaveSubData] = useState<LeaveSubstitutionData | null>(null);
  const [resignationData, setResignationData] = useState<ResignationLetterData | null>(null);
  const [leaveRequestData, setLeaveRequestData] = useState<LeaveRequestData | null>(null);
  const [dismissalData, setDismissalData] = useState<DismissalNoticeData | null>(null);
  const [dismissalNoticePeriod, setDismissalNoticePeriod] = useState<number | null>(null);
  const [dismissalAllowance, setDismissalAllowance] = useState(0);
  const [workerRegisterData, setWorkerRegisterData] = useState<WorkerRegisterData | null>(null);
  const [certData, setCertData] = useState<EmploymentCertificateData | null>(null);
  const [settlementData, setSettlementData] = useState<RetirementSettlementData | null>(null);

  useEffect(() => {
    const savedRegNumber = getStoredBusinessRegNumber();
    if (!savedRegNumber) {
      setBusinessCheckDone(true);
      return;
    }
    findBusinessByRegistrationNumber(savedRegNumber)
      .then((found) => {
        if (found) setBusiness(found);
        else setStoredBusinessRegNumber(null);
      })
      .finally(() => setBusinessCheckDone(true));
  }, []);

  useEffect(() => {
    if (!business) return;
    listEmployees(business.id)
      .then(setEmployees)
      .catch(() => setEmployees([]));
  }, [business]);

  const handleSwitchBusiness = () => {
    setStoredBusinessRegNumber(null);
    setBusiness(null);
    setEmployees([]);
  };

  if (!businessCheckDone) {
    return (
      <AppShell>
        <PageHeading title="노무서식" description="사업장 정보를 확인하는 중입니다..." />
      </AppShell>
    );
  }

  if (!business) {
    return (
      <AppShell>
        <PageHeading
          title="노무서식"
          description="먼저 사업자등록번호로 사업장을 조회하거나 새로 등록해주세요. 근로계약서·임금명세서 페이지와 같은 사업장 데이터를 공유합니다."
        />
        <BusinessGate onBusinessLoaded={setBusiness} />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageHeading
        title="노무서식"
        description="사업장에서 자주 쓰는 노무 서식을 사업자정보가 자동으로 채워진 상태로 바로 작성·출력할 수 있습니다."
      />

      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 pt-4 text-sm text-slate-600 sm:px-6 print:hidden">
        <span>
          현재 사업장:{" "}
          <span className="font-semibold text-slate-900">
            {business.businessName || "(상호 미입력)"}
          </span>{" "}
          ({business.businessRegistrationNumber})
        </span>
        <button
          type="button"
          onClick={handleSwitchBusiness}
          className="text-blue-600 hover:underline"
        >
          다른 사업장으로 전환
        </button>
      </div>

      <main className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 py-6 sm:gap-8 sm:px-6 sm:py-8 print:block print:max-w-none print:gap-0 print:p-0 lg:grid-cols-2">
        <div className="space-y-6 print:hidden">
          <SectionCard title="서식 종류 선택">
            <select
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={docType}
              onChange={(e) => setDocType(e.target.value as DocType)}
            >
              {DOC_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
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
                onDataChange={(data, noticePeriodDays, estimatedAllowance) => {
                  setDismissalData(data);
                  setDismissalNoticePeriod(noticePeriodDays);
                  setDismissalAllowance(estimatedAllowance);
                }}
              />
            )}
          </SectionCard>
        </div>

        <div className="lg:sticky lg:top-6 lg:self-start print:static print:top-0">
          <p className="mb-3 text-sm font-semibold text-slate-500 print:hidden">서식 미리보기</p>
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
              noticePeriodDays={dismissalNoticePeriod}
              estimatedAllowance={dismissalAllowance}
            />
          )}
        </div>
      </main>
    </AppShell>
  );
}
