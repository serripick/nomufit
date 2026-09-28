"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { listEmployees } from "@/lib/employees/store";
import * as adminBusinessApi from "@/lib/admin/adminBusinessApi";
import { EmployeeRecord } from "@/lib/employees/types";
import { getLastSelectedEmployeeId, setLastSelectedEmployeeId } from "@/lib/employees/lastSelected";
import { computeWageBreakdown } from "@/lib/contract-templates/wage-calc";
import {
  computeDefaultInsuranceDeductions,
  isDormitoryDeductionOverReferenceCap,
  sumPayslipDeductions,
} from "@/lib/contract-templates/payslipCalc";
import { estimateMonthlyIncomeTax } from "@/lib/contract-templates/incomeTaxEstimate";
import { formatCurrency } from "@/lib/contract-templates/format";
import { FieldLabel, NumberInput, SectionCard } from "@/components/forms/fields";
import { AppShell, PageHeading } from "@/components/layout/AppShell";
import { BusinessRecord } from "@/lib/businesses/types";
import { listMyBusinesses } from "@/lib/businesses/store";
import { ensureSession } from "@/lib/supabase/session";
import {
  getStoredBusinessRegNumber,
  setStoredBusinessRegNumber,
} from "@/lib/businesses/currentBusiness";
import { PayslipPreview } from "@/components/preview/PayslipPreview";
import { PrintGate } from "@/components/preview/PrintGate";
import { PrintDownloadButton } from "@/components/preview/PrintDownloadButton";
import { InquiryNote } from "@/components/forms/InquiryNote";
import { DisclaimerNote } from "@/components/legal/DisclaimerNote";
import { fetchAndDownloadPdf } from "@/lib/pdf/downloadPdf";
import { useIsAdmin } from "@/lib/admin/useIsAdmin";

const now = new Date();

export default function PayslipPage() {
  return (
    <Suspense
      fallback={
        <AppShell>
          <PageHeading title="임금명세서 생성" description="불러오는 중입니다..." />
        </AppShell>
      }
    >
      <PayslipPageContent />
    </Suspense>
  );
}

function PayslipPageContent() {
  const isAdmin = useIsAdmin();
  const searchParams = useSearchParams();
  const adminBusinessId = isAdmin ? searchParams.get("adminBusinessId") : null;
  const [business, setBusiness] = useState<BusinessRecord | null>(null);
  const [businessCheckDone, setBusinessCheckDone] = useState(false);

  const [employees, setEmployees] = useState<EmployeeRecord[]>([]);
  const [status, setStatus] = useState<"loading" | "idle" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedId, setSelectedId] = useState<string>("");
  const [payYear, setPayYear] = useState(now.getFullYear());
  const [payMonth, setPayMonth] = useState(now.getMonth() + 1);
  const [payDay, setPayDay] = useState(25);
  const [dependents, setDependents] = useState(1);
  const [nationalPension, setNationalPension] = useState(0);
  const [healthInsurance, setHealthInsurance] = useState(0);
  const [longTermCare, setLongTermCare] = useState(0);
  const [employmentInsurance, setEmploymentInsurance] = useState(0);
  const [incomeTax, setIncomeTax] = useState(0);
  const [localIncomeTax, setLocalIncomeTax] = useState(0);
  const [dormitoryDeduction, setDormitoryDeduction] = useState(0);

  const handleIncomeTaxChange = (value: number) => {
    const safe = Math.max(0, value);
    setIncomeTax(safe);
    setLocalIncomeTax(Math.round(safe * 0.1));
  };

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
    setStatus("loading");
    const load = adminBusinessId ? adminBusinessApi.listEmployees : listEmployees;
    load(business.id)
      .then((rows) => {
        setEmployees(rows);
        setStatus("idle");
        if (rows.length > 0) {
          const lastId = getLastSelectedEmployeeId(business.id);
          const stillExists = lastId && rows.some((r) => r.id === lastId);
          setSelectedId(stillExists ? lastId : rows[0].id);
        }
      })
      .catch((e) => {
        setErrorMessage(e instanceof Error ? e.message : "직원 목록을 불러오지 못했습니다.");
        setStatus("error");
      });
  }, [business, adminBusinessId]);

  const employee = employees.find((e) => e.id === selectedId) ?? null;
  const breakdown = employee
    ? computeWageBreakdown(
        employee.employmentPattern,
        employee.breakTimes,
        employee.wage,
        employee.fiveOrMoreEmployees
      )
    : null;
  const taxableBase = breakdown ? breakdown.totalMonthlyPay - breakdown.nonTaxableTotal : 0;

  // 직원이 바뀌면 4대보험료·소득세 1차 추정치를 모두 새로 채워 넣는다.
  // 이후 상담사가 실제 급여명세서를 보고 각 항목을 직접 고치면 그 값이 그대로 유지된다
  // (재계산은 직원이나 부양가족수를 다시 바꿀 때만 일어난다).
  useEffect(() => {
    if (!employee) return;
    const stats = computeWageBreakdown(
      employee.employmentPattern,
      employee.breakTimes,
      employee.wage,
      employee.fiveOrMoreEmployees
    );
    const base = stats.totalMonthlyPay - stats.nonTaxableTotal;
    const insuranceDefaults = computeDefaultInsuranceDeductions(base);
    setNationalPension(insuranceDefaults.nationalPension);
    setHealthInsurance(insuranceDefaults.healthInsurance);
    setLongTermCare(insuranceDefaults.longTermCare);
    setEmploymentInsurance(insuranceDefaults.employmentInsurance);
    const estimatedTax = estimateMonthlyIncomeTax(base, dependents);
    setIncomeTax(estimatedTax);
    setLocalIncomeTax(Math.round(estimatedTax * 0.1));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, dependents]);

  // 숙박비 공제는 4대보험·세금과 무관한 별도 항목이라, 직원을 바꿀 때만 0으로 초기화한다
  // (부양가족수를 바꾼다고 숙박비 입력값이 날아가면 안 되기 때문).
  useEffect(() => {
    setDormitoryDeduction(0);
  }, [selectedId]);

  const deductions = sumPayslipDeductions(
    taxableBase,
    { nationalPension, healthInsurance, longTermCare, employmentInsurance },
    incomeTax,
    localIncomeTax,
    dormitoryDeduction
  );
  const dormitoryOverCap =
    breakdown != null && isDormitoryDeductionOverReferenceCap(dormitoryDeduction, breakdown.baseSalary);

  if (!businessCheckDone) {
    return (
      <AppShell>
        <PageHeading title="임금명세서 생성" description="사업장 정보를 확인하는 중입니다..." />
      </AppShell>
    );
  }

  if (!business && adminBusinessId) {
    return (
      <AppShell>
        <PageHeading title="임금명세서 생성" description="해당 사업장을 찾을 수 없습니다." />
      </AppShell>
    );
  }

  if (!business) {
    return (
      <AppShell>
        <PageHeading title="임금명세서 생성" description="사업장이 아직 등록되지 않았습니다." />
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
          <p className="rounded-md border border-dashed border-slate-300 p-4 text-sm text-slate-600">
            임금명세서는 근로계약서 페이지에서 등록한 사업장·직원 정보를 그대로 불러와 사용합니다.
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

  return (
    <AppShell>
      <PageHeading
        title="임금명세서 생성"
        description="직원 현황표에서 등록한 직원을 선택하면 근로계약서와 같은 기준으로 임금이 자동 계산되고, 4대보험료도 2026년 요율로 함께 계산됩니다."
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
          <SectionCard title="대상 직원 및 지급 정보">
            {status === "loading" && <p className="text-sm text-slate-500">불러오는 중...</p>}
            {status === "error" && (
              <p className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">
                {errorMessage}
              </p>
            )}
            {status === "idle" && employees.length === 0 && (
              <p className="text-sm text-slate-500">
                등록된 직원이 없습니다. 먼저{" "}
                <a href="/apply" className="text-blue-600 underline">
                  근로계약서 페이지
                </a>
                의 직원 현황표에서 직원을 등록해주세요.
              </p>
            )}
            {employees.length > 0 && (
              <div className="space-y-4">
                <div>
                  <FieldLabel>대상 직원</FieldLabel>
                  <select
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={selectedId}
                    onChange={(e) => {
                      setSelectedId(e.target.value);
                      setLastSelectedEmployeeId(business.id, e.target.value);
                    }}
                  >
                    {employees.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.workerName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <FieldLabel>지급년도</FieldLabel>
                    <NumberInput
                      value={payYear}
                      onChange={(e) => setPayYear(Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <FieldLabel>지급월</FieldLabel>
                    <NumberInput
                      value={payMonth}
                      min={1}
                      max={12}
                      onChange={(e) => setPayMonth(Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <FieldLabel>지급일</FieldLabel>
                    <NumberInput
                      value={payDay}
                      min={1}
                      max={31}
                      onChange={(e) => setPayDay(Number(e.target.value))}
                    />
                  </div>
                </div>

                <div>
                  <FieldLabel>부양가족수(본인 포함)</FieldLabel>
                  <NumberInput
                    value={dependents}
                    min={1}
                    onChange={(e) => setDependents(Math.max(1, Number(e.target.value)))}
                  />
                </div>

                {breakdown && (
                  <div className="rounded-md bg-slate-50 p-4">
                    <p className="mb-1 text-sm font-semibold text-slate-800">
                      공제 항목 (실제 급여명세서 기준으로 직접 수정 가능)
                    </p>
                    <p className="mb-3 text-xs text-slate-500">
                      과세대상 급여(4대보험 부과기준) {formatCurrency(taxableBase)}를 기준으로 1차
                      추정치가 채워집니다. 실제 급여명세서(상한액·전월 정산분 등으로 다를 수 있음)를
                      보고 아래 값을 직접 고치면 그 값이 그대로 반영됩니다.
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <FieldLabel>국민연금 (원)</FieldLabel>
                        <NumberInput
                          value={nationalPension}
                          min={0}
                          onChange={(e) => setNationalPension(Number(e.target.value))}
                        />
                      </div>
                      <div>
                        <FieldLabel>건강보험 (원)</FieldLabel>
                        <NumberInput
                          value={healthInsurance}
                          min={0}
                          onChange={(e) => setHealthInsurance(Number(e.target.value))}
                        />
                      </div>
                      <div>
                        <FieldLabel>장기요양보험 (원)</FieldLabel>
                        <NumberInput
                          value={longTermCare}
                          min={0}
                          onChange={(e) => setLongTermCare(Number(e.target.value))}
                        />
                      </div>
                      <div>
                        <FieldLabel>고용보험 (원)</FieldLabel>
                        <NumberInput
                          value={employmentInsurance}
                          min={0}
                          onChange={(e) => setEmploymentInsurance(Number(e.target.value))}
                        />
                      </div>
                      <div>
                        <FieldLabel>근로소득세 (원)</FieldLabel>
                        <NumberInput
                          value={incomeTax}
                          min={0}
                          onChange={(e) => handleIncomeTaxChange(Number(e.target.value))}
                        />
                      </div>
                      <div>
                        <FieldLabel>지방소득세 (원)</FieldLabel>
                        <NumberInput
                          value={localIncomeTax}
                          min={0}
                          onChange={(e) => setLocalIncomeTax(Number(e.target.value))}
                        />
                      </div>
                    </div>
                    <p className="mt-3 text-xs text-slate-500">
                      근로소득세는 국세청 간이세액표 계산방식으로 1차 추정한 값이라 실제 조회
                      결과와 차이가 있을 수 있습니다. 근로소득세를 고치면 지방소득세(그 10%)도
                      자동으로 같이 바뀌며, 지방소득세만 따로 고칠 수도 있습니다.
                    </p>
                  </div>
                )}

                <div className="rounded-md bg-slate-50 p-4">
                  <p className="mb-1 text-sm font-semibold text-slate-800">
                    숙박비 공제 (숙식 제공 사업장만 해당)
                  </p>
                  <p className="mb-3 text-xs text-slate-500">
                    자동으로 계산해드리지 않습니다 — 숙박비 공제 한도는 전국 공통이 아니라
                    지방고용노동청이 반기별·지역별·기숙사 형태별로 따로 고시합니다. 실제 약정한
                    금액을 직접 입력해주세요.
                  </p>
                  <FieldLabel>숙박비 공제액 (원)</FieldLabel>
                  <NumberInput
                    value={dormitoryDeduction}
                    min={0}
                    onChange={(e) => setDormitoryDeduction(Math.max(0, Number(e.target.value)))}
                  />
                  {dormitoryOverCap && (
                    <p className="mt-2 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800">
                      입력하신 금액이 통상임금(기본급)의 20%를 넘었습니다. 이는 참고용
                      상한선일 뿐이니, 관할 지방고용노동청의 최신 고시로 실제 한도를 반드시
                      확인해주세요.
                    </p>
                  )}
                </div>
              </div>
            )}
          </SectionCard>
        </div>

        <div className="lg:sticky lg:top-6 lg:self-start print:static print:top-0">
          <p className="mb-3 text-sm font-semibold text-slate-500 print:hidden">
            임금명세서 미리보기
          </p>
          {employee && breakdown ? (
            <>
              <PrintGate approved={isAdmin || business.approved}>
                <PayslipPreview
                  employee={employee}
                  breakdown={breakdown}
                  deductions={deductions}
                  payYear={payYear}
                  payMonth={payMonth}
                  payDay={payDay}
                />
              </PrintGate>
              <DisclaimerNote className="mt-4 print:hidden" />
              <div className="mt-4 print:hidden">
                {isAdmin || business.approved ? (
                  <PrintDownloadButton
                    onDownloadPdf={() =>
                      fetchAndDownloadPdf(
                        "/api/pdf/payslip",
                        { employee, breakdown, deductions, payYear, payMonth, payDay },
                        "임금명세서.pdf"
                      )
                    }
                  />
                ) : (
                  <InquiryNote
                    businessRegistrationNumber={business.businessRegistrationNumber}
                    businessName={business.businessName}
                  />
                )}
              </div>
            </>
          ) : (
            <p className="text-sm text-slate-400 print:hidden">
              직원을 선택하면 미리보기가 표시됩니다.
            </p>
          )}
        </div>
      </main>
    </AppShell>
  );
}
