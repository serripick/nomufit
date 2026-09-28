import { useState } from "react";
import { FieldLabel, TextInput } from "@/components/forms/fields";
import { DocField, DocParagraph, DocShell, DocTable, DocTitle } from "./DocGrid";

const LEAVE_TYPES = ["연차휴가", "하기휴가", "경조휴가", "특별휴가", "공가", "병가", "포상휴가", "기타"] as const;

export interface LeaveRequestData {
  businessName: string;
  representativeName: string;
  workerName: string;
  contact: string;
  applyDate: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  note: string;
}

function dayCount(start: string, end: string): number | null {
  const s = new Date(start);
  const e = new Date(end || start);
  if (!start || Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return null;
  return Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;
}

export function LeaveRequestForm({
  businessName,
  representativeName,
  onDataChange,
}: {
  businessName: string;
  representativeName: string;
  onDataChange: (data: LeaveRequestData) => void;
}) {
  const [workerName, setWorkerName] = useState("");
  const [contact, setContact] = useState("");
  const [applyDate, setApplyDate] = useState("");
  const [leaveType, setLeaveType] = useState<string>("연차휴가");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [note, setNote] = useState("");

  const update = (patch: Partial<LeaveRequestData>) => {
    onDataChange({
      businessName,
      representativeName,
      workerName,
      contact,
      applyDate,
      leaveType,
      startDate,
      endDate,
      note,
      ...patch,
    });
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div>
        <FieldLabel>직원명</FieldLabel>
        <TextInput
          value={workerName}
          onChange={(e) => {
            setWorkerName(e.target.value);
            update({ workerName: e.target.value });
          }}
        />
      </div>
      <div>
        <FieldLabel>비상연락처</FieldLabel>
        <TextInput
          value={contact}
          onChange={(e) => {
            setContact(e.target.value);
            update({ contact: e.target.value });
          }}
        />
      </div>
      <div>
        <FieldLabel>신청일</FieldLabel>
        <TextInput
          type="date"
          value={applyDate}
          onChange={(e) => {
            setApplyDate(e.target.value);
            update({ applyDate: e.target.value });
          }}
        />
      </div>
      <div className="sm:col-span-2">
        <FieldLabel>휴가의 종류</FieldLabel>
        <div className="flex flex-wrap gap-3">
          {LEAVE_TYPES.map((t) => (
            <label key={t} className="flex items-center gap-1.5 text-sm text-slate-700">
              <input
                type="radio"
                checked={leaveType === t}
                onChange={() => {
                  setLeaveType(t);
                  update({ leaveType: t });
                }}
              />
              {t}
            </label>
          ))}
        </div>
      </div>
      <div>
        <FieldLabel>휴가 시작일</FieldLabel>
        <TextInput
          type="date"
          value={startDate}
          onChange={(e) => {
            setStartDate(e.target.value);
            update({ startDate: e.target.value });
          }}
        />
      </div>
      <div>
        <FieldLabel>휴가 종료일</FieldLabel>
        <TextInput
          type="date"
          value={endDate}
          onChange={(e) => {
            setEndDate(e.target.value);
            update({ endDate: e.target.value });
          }}
        />
      </div>
      <div className="sm:col-span-2">
        <FieldLabel>특이사항(선택)</FieldLabel>
        <TextInput
          value={note}
          onChange={(e) => {
            setNote(e.target.value);
            update({ note: e.target.value });
          }}
        />
      </div>
    </div>
  );
}

export function LeaveRequestPreview({ data }: { data: LeaveRequestData }) {
  const days = dayCount(data.startDate, data.endDate);

  return (
    <DocShell>
      <DocTitle>휴 가 신 청 서</DocTitle>

      <DocTable>
        <tr>
          <DocField label="사업장명" value={data.businessName || ""} />
          <DocField label="직원명" value={data.workerName} />
        </tr>
        <tr>
          <DocField label="비상연락처" value={data.contact} colSpan={3} />
        </tr>
        <tr>
          <DocField
            label="휴가 기간"
            value={
              <>
                {data.startDate || ""} 부터 {data.endDate || data.startDate || ""}{" "}
                까지 {days !== null && <span className="font-semibold">({days}일간)</span>}
              </>
            }
            colSpan={3}
          />
        </tr>
        <tr>
          <DocField
            label="휴가의 종류"
            value={LEAVE_TYPES.map((t) => (t === data.leaveType ? `[${t}]` : t)).join("  ")}
            colSpan={3}
          />
        </tr>
        <tr>
          <DocField label="특이사항" value={data.note} colSpan={3} />
        </tr>
      </DocTable>

      <DocParagraph>
        상기 본인은 위와 같이 휴가를 신청하오니 허락하여 주시기 바랍니다.
      </DocParagraph>

      <p className="mt-8 text-center text-sm print:mt-4 print:text-xs">
        {data.applyDate || "20     년      월      일"}
      </p>

      <div className="mt-8 flex flex-col items-end gap-1 text-sm print:mt-4 print:text-xs">
        <p>직원 : {data.workerName || ""} (서명/인)</p>
        <p>사업주 : {data.representativeName || ""} (서명/인)</p>
      </div>

      <p className="mt-6 text-center text-sm font-semibold print:mt-4 print:text-xs">
        {data.businessName || ""} 대표귀중
      </p>
    </DocShell>
  );
}
