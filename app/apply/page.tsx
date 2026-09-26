"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createDefaultFormData } from "@/lib/contract-templates/defaults";
import { contractFormSchema } from "@/lib/contract-templates/schemas";
import { ContractFormData } from "@/lib/contract-templates/types";
import { SectionCard } from "@/components/forms/fields";
import { BusinessInfoFields } from "@/components/forms/BusinessInfoFields";
import { ProbationFields } from "@/components/forms/ProbationFields";
import { DynamicWorkPatternForm } from "@/components/forms/DynamicWorkPatternForm";
import { BreakTimesFields } from "@/components/forms/BreakTimesFields";
import { WageFields } from "@/components/forms/WageFields";
import {
  AnnualLeaveFields,
  SocialInsuranceFields,
} from "@/components/forms/AnnualLeaveAndInsuranceFields";
import { AnnualLeaveCalculator } from "@/components/forms/AnnualLeaveCalculator";
import { EmployeeRoster } from "@/components/forms/EmployeeRoster";
import { EmployeeRecord } from "@/lib/employees/types";
import { setLastSelectedEmployeeId } from "@/lib/employees/lastSelected";
import { BusinessGate } from "@/components/forms/BusinessGate";
import { BusinessRecord } from "@/lib/businesses/types";
import {
  findBusinessByRegistrationNumber,
  updateBusiness,
} from "@/lib/businesses/store";
import {
  getStoredBusinessRegNumber,
  setStoredBusinessRegNumber,
} from "@/lib/businesses/currentBusiness";
import { AppShell, PageHeading } from "@/components/layout/AppShell";
import { ContractPreview } from "@/components/preview/ContractPreview";
import { PrintGate } from "@/components/preview/PrintGate";
import { InquiryForm } from "@/components/forms/InquiryForm";

interface Draft {
  formData: ContractFormData;
  loadedEmployeeId: string | null;
}

function draftStorageKey(businessId: string): string {
  return `employment-contract-draft-v1:${businessId}`;
}

function loadDraft(businessId: string): Draft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(draftStorageKey(businessId));
    if (!raw) return null;
    return JSON.parse(raw) as Draft;
  } catch {
    return null;
  }
}

function applyBusinessToFormData(
  formData: ContractFormData,
  business: BusinessRecord
): ContractFormData {
  return {
    ...formData,
    businessInfo: {
      ...formData.businessInfo,
      businessName: business.businessName,
      representativeName: business.representativeName,
      businessRegistrationNumber: business.businessRegistrationNumber,
      businessAddress: business.businessAddress,
      businessPhone: business.businessPhone,
      fiveOrMoreEmployees: business.fiveOrMoreEmployees,
    },
  };
}

export default function ApplyPage() {
  const [business, setBusiness] = useState<BusinessRecord | null>(null);
  const [businessCheckDone, setBusinessCheckDone] = useState(false);

  const [formData, setFormData] = useState<ContractFormData>(() => createDefaultFormData());
  const [loadedEmployeeId, setLoadedEmployeeId] = useState<string | null>(null);
  const [draftLoaded, setDraftLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState<"contract" | "calculator">("contract");
  const businessSyncTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 다른 화면에서 /apply#calculator로 들어오면 연차수당 계산기 탭을 바로 연다.
  useEffect(() => {
    if (window.location.hash === "#calculator") {
      setActiveTab("calculator");
    }
  }, []);

  // 이 브라우저가 마지막으로 조회했던 사업장이 있으면 자동으로 다시 불러온다.
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

  // 사업장이 정해지면, 그 사업장 전용 임시 저장 초안을 불러오거나 없으면 기본값+사업장 정보로 시작한다.
  useEffect(() => {
    if (!business) return;
    const draft = loadDraft(business.id);
    if (draft) {
      setFormData(draft.formData);
      setLoadedEmployeeId(draft.loadedEmployeeId);
    } else {
      setFormData(applyBusinessToFormData(createDefaultFormData(), business));
      setLoadedEmployeeId(null);
    }
    setDraftLoaded(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [business?.id]);

  useEffect(() => {
    if (!business || !draftLoaded) return;
    try {
      window.localStorage.setItem(
        draftStorageKey(business.id),
        JSON.stringify({ formData, loadedEmployeeId })
      );
    } catch {
      // 저장 공간이 없거나 접근이 막힌 환경(시크릿 모드 등)에서는 임시 저장을 건너뛴다.
    }
  }, [business, formData, loadedEmployeeId, draftLoaded]);

  // 사업장 정보(사업장명 등)를 고치면, 다른 곳에서 같은 사업자등록번호로 조회했을 때도
  // 최신 정보가 보이도록 사업장 레코드 자체를 함께 갱신한다(살짝 디바운스).
  useEffect(() => {
    if (!business || !draftLoaded) return;
    if (businessSyncTimer.current) clearTimeout(businessSyncTimer.current);
    businessSyncTimer.current = setTimeout(() => {
      const { businessName, representativeName, businessAddress, businessPhone, fiveOrMoreEmployees } =
        formData.businessInfo;
      updateBusiness(business.id, {
        businessRegistrationNumber: business.businessRegistrationNumber,
        businessName,
        representativeName,
        businessAddress,
        businessPhone,
        fiveOrMoreEmployees,
      }).catch(() => {
        // 네트워크 문제 등으로 실패해도 로컬 작업 흐름은 막지 않는다.
      });
    }, 800);
    return () => {
      if (businessSyncTimer.current) clearTimeout(businessSyncTimer.current);
    };
  }, [
    business,
    draftLoaded,
    formData.businessInfo.businessName,
    formData.businessInfo.representativeName,
    formData.businessInfo.businessAddress,
    formData.businessInfo.businessPhone,
    formData.businessInfo.fiveOrMoreEmployees,
  ]);

  const validation = useMemo(() => contractFormSchema.safeParse(formData), [formData]);

  const handleLoadEmployee = (record: EmployeeRecord) => {
    setFormData({
      ...formData,
      businessInfo: {
        ...formData.businessInfo,
        workerName: record.workerName,
        workerGender: record.workerGender,
        workerBirthDate: record.workerBirthDate,
        workerAddress: record.workerAddress,
        workerPhone: record.workerPhone,
        jobDescription: record.jobDescription,
        workLocation: record.workLocation,
        contractStartDate: record.contractStartDate,
        contractEndDate: record.contractEndDate,
        fiveOrMoreEmployees: record.fiveOrMoreEmployees,
      },
      employmentPattern: record.employmentPattern,
      breakTimes: record.breakTimes,
      wage: record.wage,
    });
    setLoadedEmployeeId(record.id);
    if (business) setLastSelectedEmployeeId(business.id, record.id);
  };

  const handleStartNewEmployee = () => {
    const fresh = createDefaultFormData();
    setFormData({
      ...fresh,
      businessInfo: {
        ...fresh.businessInfo,
        businessName: formData.businessInfo.businessName,
        representativeName: formData.businessInfo.representativeName,
        businessRegistrationNumber: formData.businessInfo.businessRegistrationNumber,
        businessAddress: formData.businessInfo.businessAddress,
        businessPhone: formData.businessInfo.businessPhone,
        fiveOrMoreEmployees: formData.businessInfo.fiveOrMoreEmployees,
      },
    });
    setLoadedEmployeeId(null);
    if (business) setLastSelectedEmployeeId(business.id, null);
  };

  const handleSwitchBusiness = () => {
    setStoredBusinessRegNumber(null);
    setBusiness(null);
    setDraftLoaded(false);
    setFormData(createDefaultFormData());
    setLoadedEmployeeId(null);
  };

  if (!businessCheckDone) {
    return (
      <AppShell>
        <PageHeading title="근로계약서 작성 정보 입력" description="사업장 정보를 확인하는 중입니다..." />
      </AppShell>
    );
  }

  if (!business) {
    return (
      <AppShell>
        <PageHeading
          title="근로계약서 작성 정보 입력"
          description="사업장별로 정보와 직원 현황이 분리되어 관리됩니다. 먼저 사업자등록번호로 사업장을 조회하거나 새로 등록해주세요."
        />
        <BusinessGate onBusinessLoaded={setBusiness} />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageHeading
        title="근로계약서 작성 정보 입력"
        description="사업장 정보와 근로조건을 입력하면 계약서 초안이 우측에 자동으로 미리보기 됩니다. 이 화면은 검토 전 미리보기이며, 실제 계약서 발급은 상담사 검토 후 진행됩니다."
      />

      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 pt-4 text-sm text-slate-600 sm:px-6 print:hidden">
        <span>
          현재 사업장: <span className="font-semibold text-slate-900">
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

      <div className="mx-auto max-w-6xl px-4 pt-4 sm:px-6 print:hidden">
        <div className="inline-flex rounded-full bg-slate-100 p-1 text-sm font-medium">
          <button
            type="button"
            onClick={() => setActiveTab("contract")}
            className={
              "rounded-full px-4 py-1.5 transition-colors " +
              (activeTab === "contract"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-slate-500 hover:text-slate-800")
            }
          >
            계약서 작성
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("calculator")}
            className={
              "rounded-full px-4 py-1.5 transition-colors " +
              (activeTab === "calculator"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-slate-500 hover:text-slate-800")
            }
          >
            연차수당 계산기
          </button>
        </div>
      </div>

      <main
        className={
          "mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 py-6 sm:gap-8 sm:px-6 sm:py-8 print:block print:max-w-none print:gap-0 print:p-0 lg:grid-cols-2 " +
          (activeTab === "contract" ? "" : "hidden")
        }
      >
        <div className="space-y-6 print:hidden">
          <SectionCard title="직원 현황표">
            <EmployeeRoster
              businessId={business.id}
              formData={formData}
              loadedEmployeeId={loadedEmployeeId}
              onLoadEmployee={handleLoadEmployee}
              onSavedEmployee={(id) => {
                setLoadedEmployeeId(id);
                setLastSelectedEmployeeId(business.id, id);
              }}
              onStartNew={handleStartNewEmployee}
            />
          </SectionCard>

          <SectionCard title="사업자 및 근로자 기본정보">
            <BusinessInfoFields
              data={formData.businessInfo}
              onChange={(businessInfo) => setFormData({ ...formData, businessInfo })}
            />
          </SectionCard>

          <SectionCard title="수습기간">
            <ProbationFields
              data={formData.probation}
              onChange={(probation) => setFormData({ ...formData, probation })}
            />
          </SectionCard>

          <SectionCard title="근무 패턴">
            <DynamicWorkPatternForm
              data={formData.employmentPattern}
              onChange={(employmentPattern) =>
                setFormData({ ...formData, employmentPattern })
              }
            />
          </SectionCard>

          <SectionCard title="휴게시간 / 브레이크타임">
            <BreakTimesFields
              data={formData.breakTimes}
              onChange={(breakTimes) => setFormData({ ...formData, breakTimes })}
            />
          </SectionCard>

          <SectionCard title="임금 및 수당">
            <WageFields
              data={formData.wage}
              employmentPattern={formData.employmentPattern}
              breakTimes={formData.breakTimes}
              fiveOrMoreEmployees={formData.businessInfo.fiveOrMoreEmployees}
              onChange={(wage) => setFormData({ ...formData, wage })}
            />
          </SectionCard>

          <SectionCard title="연차유급휴가">
            <AnnualLeaveFields
              data={formData.annualLeave}
              prepaidEnabled={formData.wage.annualLeaveAllowance.enabled}
              onChange={(annualLeave) => setFormData({ ...formData, annualLeave })}
            />
          </SectionCard>

          <SectionCard title="사회보험 적용여부">
            <SocialInsuranceFields
              data={formData.socialInsurance}
              onChange={(socialInsurance) => setFormData({ ...formData, socialInsurance })}
            />
          </SectionCard>

          {!validation.success && (
            <div className="rounded-md border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">
              <p className="mb-1 font-semibold">입력을 확인해주세요</p>
              <ul className="list-disc space-y-0.5 pl-5">
                {validation.error.issues.slice(0, 5).map((issue, i) => (
                  <li key={i}>{issue.message}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="lg:sticky lg:top-6 lg:self-start print:static print:top-0">
          <p className="mb-3 text-sm font-semibold text-slate-500 print:hidden">계약서 미리보기</p>
          <PrintGate approved={business.approved}>
            <ContractPreview data={formData} />
          </PrintGate>
          {!business.approved && (
            <div className="mt-4 print:hidden">
              <InquiryForm
                businessRegistrationNumber={business.businessRegistrationNumber}
                businessName={business.businessName}
              />
            </div>
          )}
        </div>
      </main>

      {activeTab === "calculator" && (
        <div className="mx-auto max-w-6xl space-y-6 px-4 pb-8 sm:px-6 print:hidden">
          <SectionCard title="연차수당 정산 계산기 (별도 도구, 계약서 내용에는 반영되지 않음)">
            <AnnualLeaveCalculator
              defaultHireDate={formData.businessInfo.contractStartDate}
              wage={formData.wage}
              employmentPattern={formData.employmentPattern}
              breakTimes={formData.breakTimes}
              fiveOrMoreEmployees={formData.businessInfo.fiveOrMoreEmployees}
            />
          </SectionCard>
        </div>
      )}
    </AppShell>
  );
}
