"use client";

import { useEffect, useState } from "react";
import { AppShell, PageHeading } from "@/components/layout/AppShell";
import { BusinessRecord } from "@/lib/businesses/types";
import { listMyBusinesses } from "@/lib/businesses/store";
import { ensureSession } from "@/lib/supabase/session";
import {
  getStoredBusinessRegNumber,
  setStoredBusinessRegNumber,
} from "@/lib/businesses/currentBusiness";
import { listEmployees } from "@/lib/employees/store";
import { EmployeeRecord } from "@/lib/employees/types";
import { FieldLabel, SectionCard, TextInput } from "@/components/forms/fields";
import { EmploymentSubsidyReview } from "@/components/forms/EmploymentSubsidyReview";

export default function SubsidiesPage() {
  const [business, setBusiness] = useState<BusinessRecord | null>(null);
  const [businessCheckDone, setBusinessCheckDone] = useState(false);
  const [employees, setEmployees] = useState<EmployeeRecord[]>([]);

  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [workerName, setWorkerName] = useState("");
  const [workerBirthDate, setWorkerBirthDate] = useState("");
  const [contractStartDate, setContractStartDate] = useState("");
  const [isFixedTerm, setIsFixedTerm] = useState(false);
  const [contractEndDate, setContractEndDate] = useState("");

  useEffect(() => {
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
  }, []);

  useEffect(() => {
    if (!business) return;
    listEmployees(business.id)
      .then((rows) => {
        setEmployees(rows);
        if (rows.length > 0) loadEmployee(rows[0].id, rows);
      })
      .catch(() => setEmployees([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [business]);

  const loadEmployee = (id: string, list: EmployeeRecord[] = employees) => {
    setSelectedEmployeeId(id);
    const emp = list.find((e) => e.id === id);
    if (emp) {
      setWorkerName(emp.workerName);
      setWorkerBirthDate(emp.workerBirthDate);
      setContractStartDate(emp.contractStartDate);
      setIsFixedTerm(!!emp.contractEndDate);
      setContractEndDate(emp.contractEndDate ?? "");
    }
  };

  if (!businessCheckDone) {
    return (
      <AppShell>
        <PageHeading title="고용지원금 검토" description="사업장 정보를 확인하는 중입니다..." />
      </AppShell>
    );
  }

  if (!business) {
    return (
      <AppShell>
        <PageHeading title="고용지원금 검토" description="사업장이 아직 등록되지 않았습니다." />
        <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
          <p className="rounded-md border border-dashed border-slate-300 p-4 text-sm text-slate-600">
            고용지원금 검토는 근로계약서 페이지에서 등록한 사업장·직원 정보를 그대로 불러와
            사용합니다. 먼저{" "}
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
        title="고용지원금 검토"
        description="직원 현황표에서 근로자를 선택하면 나이·계약형태를 기준으로 대표적인 고용지원금 4종의 해당 가능성을 결과지로 뽑아드립니다."
      />

      <div className="mx-auto max-w-3xl px-4 pt-4 text-sm text-slate-600 sm:px-6">
        <span>
          현재 사업장:{" "}
          <span className="font-semibold text-slate-900">
            {business.businessName || "(상호 미입력)"}
          </span>{" "}
          ({business.businessRegistrationNumber})
        </span>
      </div>

      <main className="mx-auto max-w-3xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
        <SectionCard title="대상 근로자">
          {employees.length > 0 && (
            <div>
              <FieldLabel>직원 현황표에서 불러오기</FieldLabel>
              <select
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={selectedEmployeeId}
                onChange={(e) => loadEmployee(e.target.value)}
              >
                <option value="">직접 입력</option>
                {employees.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.workerName}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <FieldLabel>성명</FieldLabel>
              <TextInput value={workerName} onChange={(e) => setWorkerName(e.target.value)} />
            </div>
            <div>
              <FieldLabel>생년월일</FieldLabel>
              <TextInput
                type="date"
                value={workerBirthDate}
                onChange={(e) => setWorkerBirthDate(e.target.value)}
              />
            </div>
            <div>
              <FieldLabel>채용일</FieldLabel>
              <TextInput
                type="date"
                value={contractStartDate}
                onChange={(e) => setContractStartDate(e.target.value)}
              />
            </div>
            <div>
              <FieldLabel>계약형태</FieldLabel>
              <div className="flex items-center gap-4 pt-2">
                <label className="flex items-center gap-1.5 text-sm text-slate-700">
                  <input
                    type="radio"
                    checked={!isFixedTerm}
                    onChange={() => setIsFixedTerm(false)}
                  />
                  정규직(기간의 정함 없음)
                </label>
                <label className="flex items-center gap-1.5 text-sm text-slate-700">
                  <input type="radio" checked={isFixedTerm} onChange={() => setIsFixedTerm(true)} />
                  기간제
                </label>
              </div>
              {isFixedTerm && (
                <TextInput
                  type="date"
                  className="mt-2"
                  value={contractEndDate}
                  onChange={(e) => setContractEndDate(e.target.value)}
                />
              )}
            </div>
          </div>
        </SectionCard>

        <SectionCard title="고용지원금 검토">
          <EmploymentSubsidyReview
            workerName={workerName}
            workerBirthDate={workerBirthDate}
            contractStartDate={contractStartDate}
            contractEndDate={isFixedTerm ? contractEndDate || null : null}
          />
        </SectionCard>
      </main>
    </AppShell>
  );
}
