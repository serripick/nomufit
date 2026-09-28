import { useState } from "react";
import { FieldLabel, TextInput } from "@/components/forms/fields";
import { EmployeeRecord } from "@/lib/employees/types";
import { DocField, DocShell, DocTable, DocTitle } from "./DocGrid";

export interface DismissalNoticeData {
  businessName: string;
  representativeName: string;
  businessAddress: string;
  workerName: string;
  workerBirthDate: string;
  hireDate: string;
  position: string;
  reason: string;
  noticeDate: string;
  dismissalDate: string;
}

export function DismissalNoticeForm({
  businessName,
  representativeName,
  businessAddress,
  employees,
  onDataChange,
}: {
  businessName: string;
  representativeName: string;
  businessAddress: string;
  employees: EmployeeRecord[];
  onDataChange: (data: DismissalNoticeData) => void;
}) {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [workerName, setWorkerName] = useState("");
  const [workerBirthDate, setWorkerBirthDate] = useState("");
  const [hireDate, setHireDate] = useState("");
  const [position, setPosition] = useState("");
  const [reason, setReason] = useState("");
  const [noticeDate, setNoticeDate] = useState("");
  const [dismissalDate, setDismissalDate] = useState("");

  const emit = (patch: Partial<DismissalNoticeData>) => {
    onDataChange({
      businessName,
      representativeName,
      businessAddress,
      workerName,
      workerBirthDate,
      hireDate,
      position,
      reason,
      noticeDate,
      dismissalDate,
      ...patch,
    });
  };

  const loadEmployee = (id: string) => {
    setSelectedEmployeeId(id);
    const emp = employees.find((e) => e.id === id);
    if (emp) {
      setWorkerName(emp.workerName);
      setWorkerBirthDate(emp.workerBirthDate);
      setHireDate(emp.contractStartDate);
      setPosition(emp.jobDescription);
      emit({
        workerName: emp.workerName,
        workerBirthDate: emp.workerBirthDate,
        hireDate: emp.contractStartDate,
        position: emp.jobDescription,
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
            value={workerBirthDate}
            onChange={(e) => {
              setWorkerBirthDate(e.target.value);
              emit({ workerBirthDate: e.target.value });
            }}
          />
        </div>
        <div>
          <FieldLabel>입사일</FieldLabel>
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
          <FieldLabel>종사업무</FieldLabel>
          <TextInput
            value={position}
            onChange={(e) => {
              setPosition(e.target.value);
              emit({ position: e.target.value });
            }}
          />
        </div>
        <div className="sm:col-span-2">
          <FieldLabel>해고 사유</FieldLabel>
          <TextInput
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              emit({ reason: e.target.value });
            }}
          />
        </div>
        <div>
          <FieldLabel>전달(통지)일</FieldLabel>
          <TextInput
            type="date"
            value={noticeDate}
            onChange={(e) => {
              setNoticeDate(e.target.value);
              emit({ noticeDate: e.target.value });
            }}
          />
        </div>
        <div>
          <FieldLabel>해고(예정)일</FieldLabel>
          <TextInput
            type="date"
            value={dismissalDate}
            onChange={(e) => {
              setDismissalDate(e.target.value);
              emit({ dismissalDate: e.target.value });
            }}
          />
        </div>
      </div>
    </div>
  );
}

export function DismissalNoticePreview({ data }: { data: DismissalNoticeData }) {
  return (
    <DocShell>
      <DocTitle>해고[예고] 서면 통보서</DocTitle>

      <DocTable>
        <tr>
          <DocField label="사업장명" value={data.businessName || ""} />
          <DocField label="직원명" value={data.workerName} />
        </tr>
        <tr>
          <DocField label="생년월일" value={data.workerBirthDate} />
          <DocField label="종사업무" value={data.position} />
        </tr>
      </DocTable>

      <p className="mt-6 text-sm leading-relaxed print:mt-4 print:text-xs">
        위 직원은 아래와 같이 해고[예고]되므로 근로기준법 제26조 및 제27조에 의거하여 30일 전에
        서면통보합니다.
      </p>

      <DocTable>
        <tr>
          <DocField label="해고사유" value={data.reason} colSpan={3} />
        </tr>
        <tr>
          <DocField label="해고일자" value={data.dismissalDate} />
          <DocField label="전달일자" value={data.noticeDate} />
        </tr>
        <tr>
          <DocField
            label="내용"
            value={
              <>
                위 사유로 인하여 위에 명시된 일자에 직원과 사업주와의 근로관계가 종료되기에 해고
                예고를 &lt;서면통지&gt; 하오니 남은 기간동안 업무에 만전을 기하여 주시고, 취업을
                위해 필요한 시간은 사업주의 승인을 얻은 후에 할애 받으시기 바랍니다.
              </>
            }
            colSpan={3}
          />
        </tr>
      </DocTable>

      <p className="mt-6 text-sm print:mt-4 print:text-xs">
        발신 : {data.businessAddress || ""}
      </p>
      <p className="mt-1 text-sm print:text-xs">
        발신 : {data.businessName || ""} 대표{" "}
        {data.representativeName || ""} (서명/인)
      </p>

      <p className="mt-6 text-center text-sm print:mt-4 print:text-xs">
        {data.noticeDate || "20     년      월      일"}
      </p>

      <div className="mt-10 border-t border-dashed border-slate-400 pt-6 print:mt-6 print:pt-4">
        <p className="text-center text-xs text-slate-400">- 절취선 -</p>
        <DocTitle>해고[예고] 통보서 수령확인증</DocTitle>
        <p className="mt-6 text-sm print:mt-4 print:text-xs">
          해고 예고 통보서를 수령하였음을 확인합니다.
        </p>
        <p className="mt-6 text-center text-sm print:mt-4 print:text-xs">
          {data.noticeDate || "20     년      월      일"}
        </p>
        <p className="mt-6 text-right text-sm print:mt-4 print:text-xs">
          위 수령인 : {data.workerName || ""} (서명/인)
        </p>
        <p className="mt-4 text-center text-sm font-semibold print:mt-2 print:text-xs">
          {data.businessName || ""} 대표 귀중
        </p>
      </div>
    </DocShell>
  );
}
