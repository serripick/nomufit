import { useState } from "react";
import { FieldLabel, TextInput } from "@/components/forms/fields";
import { DocField, DocNumberedList, DocParagraph, DocShell, DocTable, DocTitle } from "./DocGrid";

const RETIREMENT_TYPES = ["이직", "건강", "가사", "결혼", "권고", "정년", "진학", "기타"] as const;

export interface ResignationLetterData {
  businessName: string;
  representativeName: string;
  workerName: string;
  workLocation: string;
  address: string;
  phone: string;
  hireDate: string;
  resignationDate: string;
  retirementType: string;
  reason: string;
  writtenDate: string;
}

export function ResignationLetterForm({
  businessName,
  representativeName,
  onDataChange,
}: {
  businessName: string;
  representativeName: string;
  onDataChange: (data: ResignationLetterData) => void;
}) {
  const [workerName, setWorkerName] = useState("");
  const [workLocation, setWorkLocation] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [hireDate, setHireDate] = useState("");
  const [resignationDate, setResignationDate] = useState("");
  const [retirementType, setRetirementType] = useState<string>("이직");
  const [reason, setReason] = useState("");
  const [writtenDate, setWrittenDate] = useState("");

  const update = (patch: Partial<ResignationLetterData>) => {
    onDataChange({
      businessName,
      representativeName,
      workerName,
      workLocation,
      address,
      phone,
      hireDate,
      resignationDate,
      retirementType,
      reason,
      writtenDate,
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
        <FieldLabel>근무장소</FieldLabel>
        <TextInput
          value={workLocation}
          onChange={(e) => {
            setWorkLocation(e.target.value);
            update({ workLocation: e.target.value });
          }}
        />
      </div>
      <div>
        <FieldLabel>연락처</FieldLabel>
        <TextInput
          value={phone}
          onChange={(e) => {
            setPhone(e.target.value);
            update({ phone: e.target.value });
          }}
        />
      </div>
      <div>
        <FieldLabel>연락주소</FieldLabel>
        <TextInput
          value={address}
          onChange={(e) => {
            setAddress(e.target.value);
            update({ address: e.target.value });
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
            update({ hireDate: e.target.value });
          }}
        />
      </div>
      <div>
        <FieldLabel>사직일자</FieldLabel>
        <TextInput
          type="date"
          value={resignationDate}
          onChange={(e) => {
            setResignationDate(e.target.value);
            update({ resignationDate: e.target.value });
          }}
        />
      </div>
      <div className="sm:col-span-2">
        <FieldLabel>퇴사구분</FieldLabel>
        <div className="flex flex-wrap gap-3">
          {RETIREMENT_TYPES.map((t) => (
            <label key={t} className="flex items-center gap-1.5 text-sm text-slate-700">
              <input
                type="radio"
                checked={retirementType === t}
                onChange={() => {
                  setRetirementType(t);
                  update({ retirementType: t });
                }}
              />
              {t}
            </label>
          ))}
        </div>
      </div>
      <div className="sm:col-span-2">
        <FieldLabel>퇴사사유 (구체적으로)</FieldLabel>
        <TextInput
          value={reason}
          onChange={(e) => {
            setReason(e.target.value);
            update({ reason: e.target.value });
          }}
        />
      </div>
      <div>
        <FieldLabel>작성일</FieldLabel>
        <TextInput
          type="date"
          value={writtenDate}
          onChange={(e) => {
            setWrittenDate(e.target.value);
            update({ writtenDate: e.target.value });
          }}
        />
      </div>
    </div>
  );
}

export function ResignationLetterPreview({ data }: { data: ResignationLetterData }) {
  return (
    <DocShell>
      <DocTitle>사 직 서</DocTitle>

      <DocTable>
        <tr>
          <DocField label="사업장명" value={data.businessName || ""} />
          <DocField label="직원명" value={data.workerName} />
        </tr>
        <tr>
          <DocField label="근무장소" value={data.workLocation} />
          <DocField label="연락처" value={data.phone} />
        </tr>
        <tr>
          <DocField label="연락주소" value={data.address} />
          <DocField label="입사일자" value={data.hireDate} />
        </tr>
        <tr>
          <DocField label="사직일자" value={data.resignationDate} />
          <DocField
            label="퇴사구분"
            value={RETIREMENT_TYPES.map((t) => (t === data.retirementType ? `[${t}]` : t)).join("  ")}
          />
        </tr>
        <tr>
          <DocField label="퇴사사유" value={data.reason} colSpan={3} />
        </tr>
      </DocTable>

      <DocParagraph>
        상기 본인은 위와 같은 사유로 인하여 사직하고자 하오니 속히 처리하여 주시기 바랍니다.
        아울러 회사 내 퇴직규정에 관련된 사항을 준수할 것을 서약합니다.
      </DocParagraph>

      <p className="mt-6 text-sm font-semibold print:mt-4 print:text-xs">▣ 준수사항</p>
      <DocNumberedList
        items={[
          "본인은 퇴직에 따른 업무 인수인계를 철저히 하여 퇴사 시까지 직무책임과 의무를 다하겠습니다.",
          "재직 시 업무상 취득한 회사의 제반 기밀 사항을 타인에게 일체 누설하지 않겠습니다.",
          "차용금, 근무복, 회사 비품 등 반환물건(금품)은 퇴직일 전일까지 반환하겠습니다.",
          "만일 본인이 상기 사항을 위반하였을 때에는 이유 여하를 막론하고 민/형사상의 책임과 손해배상 의무를 지겠습니다.",
          "기타 회사와 관련한 제반 사항은 회사규정에 의거 퇴직일 전일까지 처리하겠습니다.",
        ]}
      />

      <DocParagraph>
        본인은 이러한 사직이 본인의 자유의사에 따라 실행되는 것임을 다시 확인합니다.
      </DocParagraph>

      <p className="mt-6 text-center text-sm print:mt-4 print:text-xs">
        {data.writtenDate || "20     년      월      일"}
      </p>
      <p className="mt-6 text-right text-sm print:mt-3 print:text-xs">
        직원 : {data.workerName || ""} (서명/인)
      </p>
      <p className="mt-8 text-center text-sm font-semibold print:mt-6 print:text-xs">
        {data.businessName || ""} 대표귀중
      </p>
    </DocShell>
  );
}
