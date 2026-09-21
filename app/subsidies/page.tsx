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

  const handleSwitchBusiness = () => {
    setStoredBusinessRegNumber(null);
    setBusiness(null);
    setEmployees([]);
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
        <PageHeading
          title="고용지원금 검토"
          description="먼저 사업자등록번호로 사업장을 조회하거나 새로 등록해주세요. 근로계약서 페이지와 같은 사업장 데이터를 공유합니다."
        />
        <BusinessGate onBusinessLoaded={setBusiness} />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageHeading
        title="고용지원금 검토"
        description="직원 현황표에서 근로자를 선택하면 나이·계약형태를 기준으로 대표적인 고용지원금 4종의 해당 가능성을 결과지로 뽑아드립니다."
      />

      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 pt-4 text-sm text-slate-600 sm:px-6">
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
