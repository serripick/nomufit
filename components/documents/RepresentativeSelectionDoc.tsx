import { useState } from "react";
import { FieldLabel, TextInput } from "@/components/forms/fields";
import { DocParagraph, DocShell, DocTitle } from "./DocGrid";

interface Voter {
  id: string;
  name: string;
  birthDate: string;
}

let voterIdSeq = 0;
function newVoterId() {
  voterIdSeq += 1;
  return `voter-${Date.now()}-${voterIdSeq}`;
}

export interface RepresentativeSelectionData {
  businessName: string;
  representativeName: string;
  repName: string;
  repBirthDate: string;
  termStart: string;
  termEnd: string;
  voters: Voter[];
}

export function RepresentativeSelectionForm({
  businessName,
  representativeName,
  onDataChange,
}: {
  businessName: string;
  representativeName: string;
  onDataChange: (data: RepresentativeSelectionData) => void;
}) {
  const [repName, setRepName] = useState("");
  const [repBirthDate, setRepBirthDate] = useState("");
  const [termStart, setTermStart] = useState("");
  const [termEnd, setTermEnd] = useState("");
  const [voters, setVoters] = useState<Voter[]>([{ id: newVoterId(), name: "", birthDate: "" }]);

  const update = (patch: Partial<RepresentativeSelectionData>) => {
    onDataChange({
      businessName,
      representativeName,
      repName,
      repBirthDate,
      termStart,
      termEnd,
      voters,
      ...patch,
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
          <FieldLabel>근로자대표 생년월일</FieldLabel>
          <TextInput
            type="date"
            value={repBirthDate}
            onChange={(e) => {
              setRepBirthDate(e.target.value);
              update({ repBirthDate: e.target.value });
            }}
          />
        </div>
        <div>
          <FieldLabel>위임기간 시작일</FieldLabel>
          <TextInput
            type="date"
            value={termStart}
            onChange={(e) => {
              setTermStart(e.target.value);
              update({ termStart: e.target.value });
            }}
          />
        </div>
        <div>
          <FieldLabel>위임기간 종료일</FieldLabel>
          <TextInput
            type="date"
            value={termEnd}
            onChange={(e) => {
              setTermEnd(e.target.value);
              update({ termEnd: e.target.value });
            }}
          />
        </div>
      </div>

      <div>
        <FieldLabel>선출에 참여한 직원 명단</FieldLabel>
        <div className="space-y-2">
          {voters.map((v, i) => (
            <div key={v.id} className="flex items-center gap-2">
              <TextInput
                placeholder={`직원 ${i + 1} 성명`}
                value={v.name}
                onChange={(e) => {
                  const next = voters.map((x) => (x.id === v.id ? { ...x, name: e.target.value } : x));
                  setVoters(next);
                  update({ voters: next });
                }}
              />
              <TextInput
                type="date"
                value={v.birthDate}
                onChange={(e) => {
                  const next = voters.map((x) =>
                    x.id === v.id ? { ...x, birthDate: e.target.value } : x
                  );
                  setVoters(next);
                  update({ voters: next });
                }}
              />
              <button
                type="button"
                onClick={() => {
                  const next = voters.filter((x) => x.id !== v.id);
                  setVoters(next);
                  update({ voters: next });
                }}
                className="shrink-0 rounded-md px-2 py-1 text-xs text-red-600 hover:bg-red-50"
              >
                삭제
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => {
              const next = [...voters, { id: newVoterId(), name: "", birthDate: "" }];
              setVoters(next);
              update({ voters: next });
            }}
            className="rounded-md border border-dashed border-slate-300 px-3 py-2 text-sm text-slate-600 hover:border-blue-400 hover:text-blue-600"
          >
            + 직원 추가
          </button>
        </div>
      </div>
    </div>
  );
}

export function RepresentativeSelectionPreview({ data }: { data: RepresentativeSelectionData }) {
  return (
    <DocShell>
      <p className="text-right text-xs text-slate-400">(5인 이상 사업장용)</p>
      <DocTitle>직원 대표 선임서</DocTitle>

      <DocParagraph>
        직원 일동은 노사합의, 근로기준법 제62조 연차유급휴가의 대체와 관련하여 아래 직원을
        근로자 대표로 선출하여 포괄 위임합니다. 위임 기간은 {data.termStart || "미입력"}부터{" "}
        {data.termEnd || "미입력"}까지로 하되, 새로운 대표선정이 없으면 연임하는 것으로 한다.
      </DocParagraph>

      <p className="mt-8 text-center text-sm font-semibold print:mt-4 print:text-xs">- 아 래 -</p>

      <p className="mt-6 text-sm print:mt-3 print:text-xs">
        직원대표 : <span className="font-semibold">{data.repName || "미입력"}</span> ( 생년월일 :{" "}
        {data.repBirthDate || "미입력"} )
      </p>

      <table className="mt-4 w-full border-collapse border border-slate-400 text-center text-sm print:mt-2 print:text-xs">
        <thead>
          <tr className="bg-slate-100">
            <th className="border border-slate-400 px-2 py-1.5">순서</th>
            <th className="border border-slate-400 px-2 py-1.5">성명</th>
            <th className="border border-slate-400 px-2 py-1.5">생년월일</th>
            <th className="border border-slate-400 px-2 py-1.5">서명 날인</th>
          </tr>
        </thead>
        <tbody>
          {data.voters.map((v, i) => (
            <tr key={v.id}>
              <td className="border border-slate-400 px-2 py-2">{i + 1}</td>
              <td className="border border-slate-400 px-2 py-2">{v.name || "미입력"}</td>
              <td className="border border-slate-400 px-2 py-2">{v.birthDate || "미입력"}</td>
              <td className="border border-slate-400 px-2 py-2">(인)</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="mt-10 text-center text-sm font-semibold print:mt-6 print:text-xs">
        {data.businessName || "(사업장명 미입력)"} 대표귀중
      </p>
    </DocShell>
  );
}
