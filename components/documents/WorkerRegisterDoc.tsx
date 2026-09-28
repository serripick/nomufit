import { useState } from "react";
import { FieldLabel, TextInput } from "@/components/forms/fields";
import { EmployeeRecord } from "@/lib/employees/types";
import { DocField, DocShell, DocTable, DocTitle } from "./DocGrid";

export interface WorkerRegisterData {
  businessName: string;
  representativeName: string;
  workerName: string;
  birthDate: string;
  address: string;
  phone: string;
  dependents: number;
  jobDescription: string;
  qualification: string;
  education: string;
  career: string;
  militaryService: string;
  hireDate: string;
  contractRenewalDate: string;
  dismissalDate: string;
  resignationDate: string;
  resignationReason: string;
  clearance: string;
  specialNotes: string;
}

export function WorkerRegisterForm({
  businessName,
  representativeName,
  employees,
  onDataChange,
}: {
  businessName: string;
  representativeName: string;
  employees: EmployeeRecord[];
  onDataChange: (data: WorkerRegisterData) => void;
}) {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [workerName, setWorkerName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [dependents, setDependents] = useState(0);
  const [jobDescription, setJobDescription] = useState("");
  const [qualification, setQualification] = useState("");
  const [education, setEducation] = useState("");
  const [career, setCareer] = useState("");
  const [militaryService, setMilitaryService] = useState("");
  const [hireDate, setHireDate] = useState("");
  const [contractRenewalDate, setContractRenewalDate] = useState("매년 1월 1일");
  const [dismissalDate, setDismissalDate] = useState("");
  const [resignationDate, setResignationDate] = useState("");
  const [resignationReason, setResignationReason] = useState("");
  const [clearance, setClearance] = useState("");
  const [specialNotes, setSpecialNotes] = useState("");

  const emit = (patch: Partial<WorkerRegisterData>) => {
    onDataChange({
      businessName,
      representativeName,
      workerName,
      birthDate,
      address,
      phone,
      dependents,
      jobDescription,
      qualification,
      education,
      career,
      militaryService,
      hireDate,
      contractRenewalDate,
      dismissalDate,
      resignationDate,
      resignationReason,
      clearance,
      specialNotes,
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
      setPhone(emp.workerPhone);
      setJobDescription(emp.jobDescription);
      setHireDate(emp.contractStartDate);
      emit({
        workerName: emp.workerName,
        birthDate: emp.workerBirthDate,
        address: emp.workerAddress,
        phone: emp.workerPhone,
        jobDescription: emp.jobDescription,
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
          <FieldLabel>① 성명</FieldLabel>
          <TextInput
            value={workerName}
            onChange={(e) => {
              setWorkerName(e.target.value);
              emit({ workerName: e.target.value });
            }}
          />
        </div>
        <div>
          <FieldLabel>② 생년월일</FieldLabel>
          <TextInput
            type="date"
            value={birthDate}
            onChange={(e) => {
              setBirthDate(e.target.value);
              emit({ birthDate: e.target.value });
            }}
          />
        </div>
        <div className="sm:col-span-2">
          <FieldLabel>③ 주소</FieldLabel>
          <TextInput
            value={address}
            onChange={(e) => {
              setAddress(e.target.value);
              emit({ address: e.target.value });
            }}
          />
        </div>
        <div>
          <FieldLabel>핸드폰 번호</FieldLabel>
          <TextInput
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              emit({ phone: e.target.value });
            }}
          />
        </div>
        <div>
          <FieldLabel>④ 부양가족(명)</FieldLabel>
          <TextInput
            type="number"
            value={String(dependents)}
            onChange={(e) => {
              const v = Number(e.target.value);
              setDependents(v);
              emit({ dependents: v });
            }}
          />
        </div>
        <div className="sm:col-span-2">
          <FieldLabel>⑤ 종사업무</FieldLabel>
          <TextInput
            value={jobDescription}
            onChange={(e) => {
              setJobDescription(e.target.value);
              emit({ jobDescription: e.target.value });
            }}
          />
        </div>
        <div>
          <FieldLabel>⑥ 기능 및 자격</FieldLabel>
          <TextInput
            value={qualification}
            onChange={(e) => {
              setQualification(e.target.value);
              emit({ qualification: e.target.value });
            }}
          />
        </div>
        <div>
          <FieldLabel>⑦ 최종학력</FieldLabel>
          <TextInput
            value={education}
            onChange={(e) => {
              setEducation(e.target.value);
              emit({ education: e.target.value });
            }}
          />
        </div>
        <div>
          <FieldLabel>⑧ 경력</FieldLabel>
          <TextInput
            value={career}
            onChange={(e) => {
              setCareer(e.target.value);
              emit({ career: e.target.value });
            }}
          />
        </div>
        <div>
          <FieldLabel>⑨ 병역</FieldLabel>
          <TextInput
            value={militaryService}
            onChange={(e) => {
              setMilitaryService(e.target.value);
              emit({ militaryService: e.target.value });
            }}
          />
        </div>
        <div>
          <FieldLabel>⑭ 고용일(계약기간 시작)</FieldLabel>
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
          <FieldLabel>⑮ 근로계약갱신일</FieldLabel>
          <TextInput
            value={contractRenewalDate}
            onChange={(e) => {
              setContractRenewalDate(e.target.value);
              emit({ contractRenewalDate: e.target.value });
            }}
          />
        </div>
        <div>
          <FieldLabel>⑩ 해고일 (해당 시)</FieldLabel>
          <TextInput
            type="date"
            value={dismissalDate}
            onChange={(e) => {
              setDismissalDate(e.target.value);
              emit({ dismissalDate: e.target.value });
            }}
          />
        </div>
        <div>
          <FieldLabel>⑪ 퇴직일 (해당 시)</FieldLabel>
          <TextInput
            type="date"
            value={resignationDate}
            onChange={(e) => {
              setResignationDate(e.target.value);
              emit({ resignationDate: e.target.value });
            }}
          />
        </div>
        <div>
          <FieldLabel>⑫ 사유</FieldLabel>
          <TextInput
            value={resignationReason}
            onChange={(e) => {
              setResignationReason(e.target.value);
              emit({ resignationReason: e.target.value });
            }}
          />
        </div>
        <div>
          <FieldLabel>⑬ 금품청산 등</FieldLabel>
          <TextInput
            value={clearance}
            onChange={(e) => {
              setClearance(e.target.value);
              emit({ clearance: e.target.value });
            }}
          />
        </div>
        <div className="sm:col-span-2">
          <FieldLabel>&lt;17&gt; 특기사항 (교육, 건강, 휴직 등)</FieldLabel>
          <TextInput
            value={specialNotes}
            onChange={(e) => {
              setSpecialNotes(e.target.value);
              emit({ specialNotes: e.target.value });
            }}
          />
        </div>
      </div>
    </div>
  );
}

export function WorkerRegisterPreview({ data }: { data: WorkerRegisterData }) {
  return (
    <DocShell>
      <DocTitle>근로자 명부</DocTitle>

      <DocTable>
        <tr>
          <DocField label="① 성명" value={data.workerName} />
          <DocField label="② 생년월일" value={data.birthDate} />
        </tr>
        <tr>
          <DocField label="③ 주소" value={data.address} colSpan={3} />
        </tr>
        <tr>
          <DocField label="핸드폰 번호" value={data.phone} colSpan={3} />
        </tr>
        <tr>
          <DocField label="④ 부양가족" value={`${data.dependents}명`} />
          <DocField label="⑤ 종사업무" value={data.jobDescription} />
        </tr>
        <tr>
          <DocField label="⑥ 기능 및 자격" value={data.qualification} colSpan={3} />
        </tr>
        <tr>
          <DocField label="⑦ 최종학력" value={data.education} colSpan={3} />
        </tr>
        <tr>
          <DocField label="⑧ 경력" value={data.career} colSpan={3} />
        </tr>
        <tr>
          <DocField label="⑨ 병역" value={data.militaryService} colSpan={3} />
        </tr>
        <tr>
          <DocField label="⑩ 해고일" value={data.dismissalDate} />
          <DocField label="⑪ 퇴직일" value={data.resignationDate} />
        </tr>
        <tr>
          <DocField label="⑫ 사유" value={data.resignationReason} />
          <DocField label="⑬ 금품청산 등" value={data.clearance} />
        </tr>
        <tr>
          <DocField label="⑭ 고용일(계약기간)" value={data.hireDate} />
          <DocField label="⑮ 근로계약갱신일" value={data.contractRenewalDate} />
        </tr>
        <tr>
          <DocField
            label="<17> 특기사항"
            value={data.specialNotes || "(교육, 건강, 휴직 등)"}
            colSpan={3}
          />
        </tr>
      </DocTable>

      <p className="mt-10 text-center text-sm font-semibold print:mt-6 print:text-xs">
        {data.businessName || ""} 대표귀중
      </p>
    </DocShell>
  );
}
