import { useState } from "react";
import { FieldLabel, TextInput } from "@/components/forms/fields";
import { DocParagraph, DocShell, DocTitle } from "./DocGrid";

interface SubstitutionPair {
  id: string;
  holidayDate: string;
  holidayName: string;
  replacementDate: string;
}

let pairIdSeq = 0;
function newPairId() {
  pairIdSeq += 1;
  return `pair-${Date.now()}-${pairIdSeq}`;
}

export interface LeaveSubstitutionData {
  businessName: string;
  representativeName: string;
  repName: string;
  effectiveStart: string;
  effectiveEnd: string;
  pairs: SubstitutionPair[];
}

export function LeaveSubstitutionForm({
  businessName,
  representativeName,
  onDataChange,
}: {
  businessName: string;
  representativeName: string;
  onDataChange: (data: LeaveSubstitutionData) => void;
}) {
  const [repName, setRepName] = useState("");
  const [effectiveStart, setEffectiveStart] = useState("");
  const [effectiveEnd, setEffectiveEnd] = useState("");
  const [pairs, setPairs] = useState<SubstitutionPair[]>([
    { id: newPairId(), holidayDate: "", holidayName: "", replacementDate: "" },
  ]);

  const update = (patch: Partial<LeaveSubstitutionData>) => {
    onDataChange({
      businessName,
      representativeName,
      repName,
      effectiveStart,
      effectiveEnd,
      pairs,
      ...patch,
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <FieldLabel>근로자대표 성명</FieldLabel>
          <TextInput
            value={repName}
            onChange={(e) => {
              setRepName(e.target.value);
              update({ repName: e.target.value });
            }}
          />
        </div>
        <div>
          <FieldLabel>합의 유효기간 시작일</FieldLabel>
          <TextInput
            type="date"
            value={effectiveStart}
            onChange={(e) => {
              setEffectiveStart(e.target.value);
              update({ effectiveStart: e.target.value });
            }}
          />
        </div>
        <div>
          <FieldLabel>합의 유효기간 종료일</FieldLabel>
          <TextInput
            type="date"
            value={effectiveEnd}
            onChange={(e) => {
              setEffectiveEnd(e.target.value);
              update({ effectiveEnd: e.target.value });
            }}
          />
        </div>
      </div>

      <div>
        <FieldLabel>대체할 휴일 → 대체 근로일</FieldLabel>
        <div className="space-y-2">
          {pairs.map((p, i) => (
            <div key={p.id} className="grid grid-cols-[1fr_1fr_1fr_auto] items-end gap-2">
              <div>
                {i === 0 && <p className="mb-1 text-xs text-slate-500">대체할 휴일 날짜</p>}
                <TextInput
                  type="date"
                  value={p.holidayDate}
                  onChange={(e) => {
                    const next = pairs.map((x) =>
                      x.id === p.id ? { ...x, holidayDate: e.target.value } : x
                    );
                    setPairs(next);
                    update({ pairs: next });
                  }}
                />
              </div>
              <div>
                {i === 0 && <p className="mb-1 text-xs text-slate-500">휴일명</p>}
                <TextInput
                  placeholder="예: 추석 대체공휴일"
                  value={p.holidayName}
                  onChange={(e) => {
                    const next = pairs.map((x) =>
                      x.id === p.id ? { ...x, holidayName: e.target.value } : x
                    );
                    setPairs(next);
                    update({ pairs: next });
                  }}
                />
              </div>
              <div>
                {i === 0 && <p className="mb-1 text-xs text-slate-500">대체 근로일</p>}
                <TextInput
                  type="date"
                  value={p.replacementDate}
                  onChange={(e) => {
                    const next = pairs.map((x) =>
                      x.id === p.id ? { ...x, replacementDate: e.target.value } : x
                    );
                    setPairs(next);
                    update({ pairs: next });
                  }}
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  const next = pairs.filter((x) => x.id !== p.id);
                  setPairs(next);
                  update({ pairs: next });
                }}
                className="rounded-md px-2 py-2 text-xs text-red-600 hover:bg-red-50"
              >
                삭제
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => {
              const next = [
                ...pairs,
                { id: newPairId(), holidayDate: "", holidayName: "", replacementDate: "" },
              ];
              setPairs(next);
              update({ pairs: next });
            }}
            className="rounded-md border border-dashed border-slate-300 px-3 py-2 text-sm text-slate-600 hover:border-blue-400 hover:text-blue-600"
          >
            + 대체 항목 추가
          </button>
        </div>
      </div>
    </div>
  );
}

export function LeaveSubstitutionPreview({ data }: { data: LeaveSubstitutionData }) {
  return (
    <DocShell>
      <p className="text-right text-xs text-slate-400">(5인 이상 사업장용)</p>
      <DocTitle>연차유급휴가 대체사용 합의서</DocTitle>

      <p className="mt-6 text-sm font-semibold print:mt-4 print:text-xs">1. 당사자</p>
      <p className="mt-1 text-sm print:text-xs">
        사 업 주 : {data.representativeName || ""} &nbsp;&nbsp;&nbsp; 직원 대표 :{" "}
        {data.repName || ""}
      </p>

      <p className="mt-6 text-sm font-semibold print:mt-4 print:text-xs">2. 합의 내용</p>
      <p className="mt-2 text-sm font-semibold print:text-xs">제1조 [적용범위]</p>
      <p className="text-sm leading-relaxed print:text-xs">
        근로기준법이 정하는 유급휴가의 대체와 관련하여 회사와 직원 대표는 연차휴가 사용을 아래와
        같이 특정 근로일에 직원들이 휴무하는 경우에는 대체하는 것으로 합의합니다.
      </p>

      <p className="mt-3 text-sm font-semibold print:text-xs">제2조 [대체일]</p>
      <p className="text-sm leading-relaxed print:text-xs">
        근로기준법 제60조에 의해 발생한 직원의 연차휴가를 다음과 같이 대체한다.
      </p>

      <table className="mt-2 w-full border-collapse border border-slate-400 text-center text-sm print:text-xs">
        <thead>
          <tr className="bg-slate-100">
            <th className="border border-slate-400 px-2 py-1.5">대체할 휴일</th>
            <th className="border border-slate-400 px-2 py-1.5">휴일명</th>
            <th className="border border-slate-400 px-2 py-1.5">대체 근로일(연차 사용)</th>
          </tr>
        </thead>
        <tbody>
          {data.pairs.map((p) => (
            <tr key={p.id}>
              <td className="border border-slate-400 px-2 py-1.5">{p.holidayDate || ""}</td>
              <td className="border border-slate-400 px-2 py-1.5">{p.holidayName || ""}</td>
              <td className="border border-slate-400 px-2 py-1.5">
                {p.replacementDate || ""}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="mt-3 text-sm font-semibold print:text-xs">제3조 [초과 및 미달 일수의 처리]</p>
      <p className="text-sm leading-relaxed print:text-xs">
        ① 전조와 같이 연차 휴가를 대체하기로 하되 당해 연도의 휴가일수를 초과하여 휴가를
        실시하게 되는 직원은 임의 휴가를 부여한 것으로 간주한다.
        <br />② 전조의 휴가일수를 초과하여 연차휴가가 발생하는 직원은 취업규칙이 정한 바에 따라
        잔여 휴가를 사용한다.
      </p>

      <p className="mt-3 text-sm font-semibold print:text-xs">제4조 [유효기간]</p>
      <p className="text-sm leading-relaxed print:text-xs">
        본 합의서의 유효기간은 {data.effectiveStart || ""}부터{" "}
        {data.effectiveEnd || ""}까지로 한다.
      </p>

      <DocParagraph>
        위 대체된 근로일은 근로자의 연차유급휴가를 사용한 것으로 처리하며, 대체된 휴일에는
        정상적으로 근로를 제공한다.
      </DocParagraph>

      <p className="mt-6 text-center text-sm print:mt-4 print:text-xs">
        20&nbsp;&nbsp;&nbsp;년&nbsp;&nbsp;&nbsp;월&nbsp;&nbsp;&nbsp;일
      </p>

      <div className="mt-8 grid grid-cols-2 gap-8 text-sm print:mt-4 print:text-xs">
        <div>
          <p>사업주(대표자): {data.representativeName || ""} (인)</p>
        </div>
        <div>
          <p>근로자대표: {data.repName || ""} (서명)</p>
        </div>
      </div>
    </DocShell>
  );
}
