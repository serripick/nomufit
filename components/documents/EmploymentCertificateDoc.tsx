import { useState } from "react";
import { FieldLabel, TextInput } from "@/components/forms/fields";
import { EmployeeRecord } from "@/lib/employees/types";
import { BusinessRecord } from "@/lib/businesses/types";
import { DocField, DocParagraph, DocShell, DocTable, DocTitle } from "./DocGrid";

export interface EmploymentCertificateData {
  business: BusinessRecord;
  certNumber: string;
  workerName: string;
  birthDate: string;
  address: string;
  workLocation: string;
  phone: string;
  hireDate: string;
  asOfDate: string;
  purpose: string;
  copies: number;
  issueDate: string;
}

export function EmploymentCertificateForm({
  business,
  employees,
  onDataChange,
}: {
  business: BusinessRecord;
  employees: EmployeeRecord[];
  onDataChange: (data: EmploymentCertificateData) => void;
}) {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [certNumber, setCertNumber] = useState("");
  const [workerName, setWorkerName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [address, setAddress] = useState("");
  const [workLocation, setWorkLocation] = useState("");
  const [phone, setPhone] = useState("");
  const [hireDate, setHireDate] = useState("");
  const [asOfDate, setAsOfDate] = useState("");
  const [purpose, setPurpose] = useState("제출용");
  const [copies, setCopies] = useState(1);
  const [issueDate, setIssueDate] = useState("");

  const emit = (patch: Partial<EmploymentCertificateData>) => {
    onDataChange({
      business,
      certNumber,
      workerName,
      birthDate,
      address,
      workLocation,
      phone,
      hireDate,
      asOfDate,
      purpose,
      copies,
      issueDate,
      ...patch,
    });
  };

  const loadEmployee = (id: string) => {
    setSelectedEmployeeId(id);
    const emp = employees.find((e) => e.id === id);
    if (emp) {
      setWorkerName(emp.workerName);
      setBirthDate(emp.workerBirthDate);
      setAddress(emp.workerAddress);
      setWorkLocation(emp.workLocation);
      setPhone(emp.workerPhone);
      setHireDate(emp.contractStartDate);
      emit({
        workerName: emp.workerName,
        birthDate: emp.workerBirthDate,
        address: emp.workerAddress,
        workLocation: emp.workLocation,
        phone: emp.workerPhone,
        hireDate: emp.contractStartDate,
      });
    }
  };

  return (
    <div className="space-y-4">
      {employees.length > 0 && (
        <div>
          <FieldLabel>직원 현황표에서 불러오기 (선택)</FieldLabel>
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <FieldLabel>증명서번호</FieldLabel>
          <TextInput
            placeholder="예: 2026-01호"
            value={certNumber}
            onChange={(e) => {
              setCertNumber(e.target.value);
              emit({ certNumber: e.target.value });
            }}
          />
        </div>
        <div>
          <FieldLabel>성명</FieldLabel>
          <TextInput
            value={workerName}
            onChange={(e) => {
              setWorkerName(e.target.value);
              emit({ workerName: e.target.value });
            }}
          />
        </div>
        <div>
          <FieldLabel>생년월일</FieldLabel>
          <TextInput
            type="date"
            value={birthDate}
            onChange={(e) => {
              setBirthDate(e.target.value);
              emit({ birthDate: e.target.value });
            }}
          />
        </div>
        <div>
          <FieldLabel>연락처</FieldLabel>
          <TextInput
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              emit({ phone: e.target.value });
            }}
          />
        </div>
        <div className="sm:col-span-2">
          <FieldLabel>주소</FieldLabel>
          <TextInput
            value={address}
            onChange={(e) => {
              setAddress(e.target.value);
              emit({ address: e.target.value });
            }}
          />
        </div>
        <div>
          <FieldLabel>근로장소</FieldLabel>
          <TextInput
            value={workLocation}
            onChange={(e) => {
              setWorkLocation(e.target.value);
              emit({ workLocation: e.target.value });
            }}
          />
        </div>
        <div>
          <FieldLabel>입사일자</FieldLabel>
          <TextInput
            type="date"
            value={hireDate}
            onChange={(e) => {
              setHireDate(e.target.value);
              emit({ hireDate: e.target.value });
            }}
          />
        </div>
        <div>
          <FieldLabel>재직 기준일 ("~부터 현재까지")</FieldLabel>
          <TextInput
            type="date"
            value={asOfDate}
            onChange={(e) => {
              setAsOfDate(e.target.value);
              emit({ asOfDate: e.target.value });
            }}
          />
        </div>
        <div>
          <FieldLabel>용도</FieldLabel>
          <TextInput
            value={purpose}
            onChange={(e) => {
              setPurpose(e.target.value);
              emit({ purpose: e.target.value });
            }}
          />
        </div>
        <div>
          <FieldLabel>발급부수</FieldLabel>
          <TextInput
            type="number"
            value={String(copies)}
            onChange={(e) => {
              const v = Number(e.target.value);
              setCopies(v);
              emit({ copies: v });
            }}
          />
        </div>
        <div>
          <FieldLabel>발급일</FieldLabel>
          <TextInput
            type="date"
            value={issueDate}
            onChange={(e) => {
              setIssueDate(e.target.value);
              emit({ issueDate: e.target.value });
            }}
          />
        </div>
      </div>
    </div>
  );
}

export function EmploymentCertificatePreview({ data }: { data: EmploymentCertificateData }) {
  const b = data.business;
  return (
    <DocShell>
      <DocTitle>재 직 증 명 서</DocTitle>

      <DocTable>
        <tr>
          <DocField label="증명서번호" value={`${b.businessName || "미입력"} ${data.certNumber || ""}`} colSpan={3} />
        </tr>
        <tr>
          <DocField label="성명" value={data.workerName} />
          <DocField label="생년월일" value={data.birthDate} />
        </tr>
        <tr>
          <DocField label="주소" value={data.address} colSpan={3} />
        </tr>
        <tr>
          <DocField label="근로장소" value={data.workLocation} />
          <DocField label="연락처" value={data.phone} />
        </tr>
        <tr>
          <DocField
            label="입사일자"
            value={`${data.hireDate || "미입력"} 부터 ${data.asOfDate || "현재"}까지`}
            colSpan={3}
          />
        </tr>
        <tr>
          <DocField label="용도" value={data.purpose} />
          <DocField label="발급부수" value={`${data.copies}부`} />
        </tr>
      </DocTable>

      <DocParagraph>위 사실과 다름없이 재직하고 있음을 확인합니다.</DocParagraph>

      <p className="mt-10 text-center text-sm print:mt-6 print:text-xs">
        {data.issueDate || "20     년      월      일"}
      </p>

      <p className="mt-8 text-center text-base font-semibold print:mt-4 print:text-sm">
        {b.businessName || "(사업장명 미입력)"} &nbsp;&nbsp; 대표 &nbsp; {b.representativeName || "미입력"} &nbsp; (인)
      </p>

      <div className="mt-10 space-y-1 text-xs text-slate-500 print:mt-6">
        <p>주소 : {b.businessAddress || "미입력"}</p>
        <p>전화 : {b.businessPhone || "미입력"}</p>
        <p>사업자번호 : {b.businessRegistrationNumber || "미입력"}</p>
      </div>
    </DocShell>
  );
}
