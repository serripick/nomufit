"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createDefaultFormData } from "@/lib/contract-templates/defaults";
import {
  EXAMPLE_BUSINESS_REGISTRATION_NUMBER,
  createExampleFormData,
} from "@/lib/contract-templates/exampleData";
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
import { BusinessRecord } from "@/lib/businesses/types";
import {
  createBusiness,
  findBusinessByRegistrationNumber,
  listMyBusinesses,
  updateBusiness,
} from "@/lib/businesses/store";
import { ensureSession } from "@/lib/supabase/session";
import { supabase } from "@/lib/supabase/client";
import * as adminBusinessApi from "@/lib/admin/adminBusinessApi";
import { AccountSetupBanner } from "@/components/forms/AccountSetupBanner";
import {
  getStoredBusinessRegNumber,
  setStoredBusinessRegNumber,
} from "@/lib/businesses/currentBusiness";
import { AppShell, PageHeading } from "@/components/layout/AppShell";
import { ContractPreview } from "@/components/preview/ContractPreview";
import { PrintGate } from "@/components/preview/PrintGate";
import { PrintDownloadButton } from "@/components/preview/PrintDownloadButton";
import { InquiryNote } from "@/components/forms/InquiryNote";
import { DisclaimerNote } from "@/components/legal/DisclaimerNote";
import { fetchAndDownloadPdf } from "@/lib/pdf/downloadPdf";
import { useIsAdmin } from "@/lib/admin/useIsAdmin";

const REGISTRATION_NUMBER_PATTERN = /^\d{3}-\d{2}-\d{5}$/;

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
  return (
    <Suspense
      fallback={
        <AppShell>
          <PageHeading title="근로계약서 작성 정보 입력" description="불러오는 중입니다..." />
        </AppShell>
      }
    >
      <ApplyPageContent />
    </Suspense>
  );
}

function ApplyPageContent() {
  const isAdmin = useIsAdmin();
  const searchParams = useSearchParams();
  // isAdmin이 아니면 URL에 남아있어도 그냥 무시한다 — 관리자가 아닌 방문자가 링크를 공유받아도
  // 이 값으로는 아무 사업장에도 접근할 수 없는, 안전한 기본값이다.
  const adminBusinessId = isAdmin ? searchParams.get("adminBusinessId") : null;

  const [business, setBusiness] = useState<BusinessRecord | null>(null);
  const [businessCheckDone, setBusinessCheckDone] = useState(false);

  const [formData, setFormData] = useState<ContractFormData>(() => createExampleFormData());
  const [loadedEmployeeId, setLoadedEmployeeId] = useState<string | null>(null);
  const [draftLoaded, setDraftLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState<"contract" | "calculator">("contract");
  const businessSyncTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const justCreatedRef = useRef(false);
  const [regNumberIssue, setRegNumberIssue] = useState<string | null>(null);
  const [isAnonymousUser, setIsAnonymousUser] = useState(false);

  // 다른 화면에서 /apply#calculator로 들어오면 연차수당 계산기 탭을 바로 연다.
  useEffect(() => {
    if (window.location.hash === "#calculator") {
      setActiveTab("calculator");
    }
  }, []);

  // 관리자가 /admin에서 "사업자등록번호"를 클릭해 들어온 경우 — service role 경로로 그
  // 사업장을 그대로 불러온다. RLS와 무관하게 승인 여부에 상관없이 항상 조회·수정할 수 있다.
  useEffect(() => {
    if (!adminBusinessId) return;
    let cancelled = false;
    (async () => {
      try {
        const found = await adminBusinessApi.getBusiness(adminBusinessId);
        if (cancelled) return;
        setBusiness(found);
      } finally {
        if (!cancelled) setBusinessCheckDone(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [adminBusinessId]);

  // 익명 세션을 보장한 뒤, 이 세션이 소유한 사업장이 있으면 자동으로 불러온다. RLS가 켜지면
  // listMyBusinesses()는 항상 내 소유만 돌려주므로, 사업자등록번호가 아니라 "내 계정"이 진짜
  // 신원 확인 기준이 된다. localStorage 값은 여러 사업장 중 어느 걸 먼저 보여줄지 힌트로만 쓴다.
  useEffect(() => {
    if (adminBusinessId) return; // 관리자 열람 모드에서는 위 효과가 대신 처리한다.
    (async () => {
      try {
        await ensureSession();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        setIsAnonymousUser(Boolean(user?.is_anonymous));
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
        // 세션 생성 실패(네트워크 등) 시에는 예시 화면으로 계속 진행한다.
      } finally {
        setBusinessCheckDone(true);
      }
    })();
  }, [adminBusinessId]);

  // 사업자등록번호 칸에 예시가 아닌 "완성된" 실제 번호가 입력되면, 별도의 조회 버튼 없이
  // 자동으로 기존 사업장을 불러오거나(있으면) 새로 등록한다(없으면). 관리자 열람 모드에서는
  // 다른 사업장을 실수로 새로 만들지 않도록 이 흐름 전체를 건너뛴다.
  useEffect(() => {
    if (adminBusinessId) return;
    const regNumber = formData.businessInfo.businessRegistrationNumber;
    if (!REGISTRATION_NUMBER_PATTERN.test(regNumber)) return;
    if (regNumber === EXAMPLE_BUSINESS_REGISTRATION_NUMBER) return;
    if (business?.businessRegistrationNumber === regNumber) return;

    let cancelled = false;
    (async () => {
      try {
        await ensureSession();
        const found = await findBusinessByRegistrationNumber(regNumber);
        if (cancelled) return;
        if (found) {
          setBusiness(found);
          setStoredBusinessRegNumber(found.businessRegistrationNumber);
          setRegNumberIssue(null);
        } else {
          const { businessName, representativeName, businessAddress, businessPhone, fiveOrMoreEmployees } =
            formData.businessInfo;
          try {
            const created = await createBusiness({
              businessRegistrationNumber: regNumber,
              businessName,
              representativeName,
              businessAddress,
              businessPhone,
              fiveOrMoreEmployees,
            });
            if (cancelled) return;
            justCreatedRef.current = true;
            setBusiness(created);
            setStoredBusinessRegNumber(created.businessRegistrationNumber);
            setRegNumberIssue(null);
          } catch (createError) {
            if (cancelled) return;
            const code = (createError as { code?: string } | null)?.code;
            if (code === "23505") {
              setRegNumberIssue(
                "이미 등록된 사업자등록번호입니다. 최초 등록하신 브라우저로 다시 접속하시거나, 이용문의를 남겨주세요."
              );
            }
          }
        }
      } catch {
        // 세션 생성 실패 등은 조용히 무시 — 다음 변경 때 다시 시도된다.
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.businessInfo.businessRegistrationNumber, adminBusinessId]);

  // 사업장이 정해지면, 그 사업장 전용 임시 저장 초안을 불러오거나 없으면 기본값+사업장 정보로 시작한다.
  // 다만 방금 예시 화면에서 실제 번호를 입력해 막 등록된 경우라면, 입력 중이던 내용을 그대로 둔다.
  useEffect(() => {
    if (!business) return;
    if (justCreatedRef.current) {
      justCreatedRef.current = false;
      setDraftLoaded(true);
      return;
    }
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
  // 최신 정보가 보이도록 사업장 레코드 자체를 함께 갱신한다(살짝 디바운스). 관리자 열람
  // 모드에서는 RLS를 우회하는 service role 경로(adminBusinessApi)로 대신 저장한다.
  useEffect(() => {
    if (!business || !draftLoaded) return;
    if (businessSyncTimer.current) clearTimeout(businessSyncTimer.current);
    businessSyncTimer.current = setTimeout(() => {
      const { businessName, representativeName, businessAddress, businessPhone, fiveOrMoreEmployees } =
        formData.businessInfo;
      const input = {
        businessRegistrationNumber: business.businessRegistrationNumber,
        businessName,
        representativeName,
        businessAddress,
        businessPhone,
        fiveOrMoreEmployees,
      };
      const save = adminBusinessId
        ? adminBusinessApi.updateBusinessInfo(business.id, input)
        : updateBusiness(business.id, input);
      save.catch(() => {
        // 네트워크 문제 등으로 실패해도 로컬 작업 흐름은 막지 않는다.
      });
    }, 800);
    return () => {
      if (businessSyncTimer.current) clearTimeout(businessSyncTimer.current);
    };
  }, [
    business,
    draftLoaded,
    adminBusinessId,
    formData.businessInfo.businessName,
    formData.businessInfo.representativeName,
    formData.businessInfo.businessAddress,
    formData.businessInfo.businessPhone,
    formData.businessInfo.fiveOrMoreEmployees,
  ]);

  const validation = useMemo(() => contractFormSchema.safeParse(formData), [formData]);
  const isExample = !business;

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

  const handleResetToExample = () => {
    setStoredBusinessRegNumber(null);
    setBusiness(null);
    setDraftLoaded(false);
    setFormData(createExampleFormData());
    setLoadedEmployeeId(null);
    setRegNumberIssue(null);
  };

  if (!businessCheckDone) {
    return (
      <AppShell>
        <PageHeading title="근로계약서 작성 정보 입력" description="사업장 정보를 확인하는 중입니다..." />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageHeading
        title="근로계약서 작성 정보 입력"
        description="사업장 정보와 근로조건을 입력하면 계약서 초안이 우측에 자동으로 미리보기 됩니다. 이 화면은 검토 전 미리보기이며, 실제 계약서 발급은 상담사 검토 후 진행됩니다."
      />

      <div className="mx-auto max-w-6xl px-4 pt-4 text-sm sm:px-6 print:hidden">
        {adminBusinessId ? (
          <div className="flex items-center justify-between rounded-md bg-emerald-50 px-4 py-3 text-emerald-800">
            <span>
              관리자 열람 모드:{" "}
              <span className="font-semibold">
                {business ? business.businessName || "(상호 미입력)" : "불러오는 중..."}
              </span>
              {business && ` (${business.businessRegistrationNumber})`} — 승인 여부와 무관하게
              자유롭게 수정·출력할 수 있습니다.
            </span>
          </div>
        ) : isExample ? (
          <div className="flex items-center justify-between rounded-md bg-blue-50 px-4 py-3 text-blue-800">
            <span>
              지금 보이는 내용은 <strong>예시 데이터</strong>입니다. 우리 사업장의 근로계약서가
              궁금하다면, 아래 사업자등록번호를 실제 정보로 바꿔 입력해보세요.
            </span>
          </div>
        ) : (
          <div className="flex items-center justify-between text-slate-600">
            <span>
              현재 사업장:{" "}
              <span className="font-semibold text-slate-900">
                {business.businessName || "(상호 미입력)"}
              </span>{" "}
              ({business.businessRegistrationNumber})
            </span>
            <button
              type="button"
              onClick={handleResetToExample}
              className="text-blue-600 hover:underline"
            >
              예시로 초기화
            </button>
          </div>
        )}
      </div>

      {!adminBusinessId && business?.approved && isAnonymousUser && (
        <div className="mx-auto max-w-6xl px-4 pt-4 sm:px-6 print:hidden">
          <AccountSetupBanner business={business} />
        </div>
      )}

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
        <div
          className="space-y-6 print:hidden"
          onFocus={(e) => {
            // 예시 데이터를 보고 있을 때만: 필드를 클릭하면 기존 값이 전체 선택되어,
            // 타이핑 한 번으로 바로 실제 정보로 덮어쓸 수 있게 한다(드래그로 지울 필요 없음).
            // 실제 사업장 데이터가 있을 때는 평소처럼 커서만 놓이게 두어 값이 실수로
            // 사라지지 않게 한다.
            if (!isExample) return;
            const target = e.target;
            if (target instanceof HTMLInputElement && target.type !== "checkbox" && target.type !== "radio") {
              target.select();
            }
          }}
        >
          {business ? (
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
                api={adminBusinessId ? adminBusinessApi : undefined}
              />
            </SectionCard>
          ) : (
            <p className="rounded-md border border-dashed border-slate-300 p-4 text-xs text-slate-500">
              사업자등록번호를 실제 정보로 입력하면, 여기서 직원 현황표를 저장·관리할 수 있습니다.
            </p>
          )}

          <SectionCard title="사업자 및 근로자 기본정보">
            {regNumberIssue && (
              <p className="mb-3 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800">
                {regNumberIssue}
              </p>
            )}
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
          <PrintGate approved={isAdmin || (business?.approved ?? false)}>
            <ContractPreview data={formData} />
          </PrintGate>
          <DisclaimerNote className="mt-4 print:hidden" />
          {business && (
            <div className="mt-4 print:hidden">
              {isAdmin || business.approved ? (
                <PrintDownloadButton
                  onDownloadPdf={() =>
                    fetchAndDownloadPdf("/api/pdf/contract", formData, "근로계약서.pdf")
                  }
                />
              ) : (
                <InquiryNote
                  businessRegistrationNumber={business.businessRegistrationNumber}
                  businessName={business.businessName}
                />
              )}
            </div>
          )}
        </div>
      </main>

      {activeTab === "calculator" && (
        <div className="mx-auto max-w-6xl space-y-6 px-4 pb-8 sm:px-6 print:hidden">
          <SectionCard title="연차수당 정산 계산기 (별도 도구, 계약서 내용에는 반영되지 않음)">
            <AnnualLeaveCalculator
              businessId={business?.id ?? null}
              defaultHireDate={formData.businessInfo.contractStartDate}
              wage={formData.wage}
              employmentPattern={formData.employmentPattern}
              breakTimes={formData.breakTimes}
              fiveOrMoreEmployees={formData.businessInfo.fiveOrMoreEmployees}
              listEmployeesApi={adminBusinessId ? adminBusinessApi.listEmployees : undefined}
            />
          </SectionCard>
        </div>
      )}
    </AppShell>
  );
}
