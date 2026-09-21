import { AnnualLeaveInfo, SocialInsuranceInfo } from "@/lib/contract-templates/types";
import { FieldLabel, TextInput } from "./fields";

export function AnnualLeaveFields({
  data,
  onChange,
  prepaidEnabled,
}: {
  data: AnnualLeaveInfo;
  onChange: (data: AnnualLeaveInfo) => void;
  prepaidEnabled: boolean;
}) {
  if (prepaidEnabled) {
    return (
      <p className="rounded-md bg-slate-50 p-3 text-sm text-slate-600">
        &quot;임금 및 수당&quot; 항목에서 연차수당 선지급이 적용되어 있어, 계약서에는 매월
        급여에 연차수당을 선지급하고 연차 사용 시 사후 정산한다는 조항이 자동으로 반영됩니다.
      </p>
    );
  }
  return (
    <div className="space-y-3">
      <div className="flex gap-4">
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="radio"
            checked={data.basis === "LEGAL"}
            onChange={() => onChange({ ...data, basis: "LEGAL" })}
          />
          근로기준법에 따름
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="radio"
            checked={data.basis === "CUSTOM"}
            onChange={() => onChange({ ...data, basis: "CUSTOM" })}
          />
          별도 약정
        </label>
      </div>
      {data.basis === "CUSTOM" && (
        <div>
          <FieldLabel>별도 약정 내용</FieldLabel>
          <TextInput
            value={data.customDetail ?? ""}
            onChange={(e) => onChange({ ...data, customDetail: e.target.value })}
          />
        </div>
      )}
    </div>
  );
}

const INSURANCE_LABEL: Record<keyof SocialInsuranceInfo, string> = {
  pension: "국민연금",
  health: "건강보험",
  employment: "고용보험",
  industrialAccident: "산재보험",
};

export function SocialInsuranceFields({
  data,
  onChange,
}: {
  data: SocialInsuranceInfo;
  onChange: (data: SocialInsuranceInfo) => void;
}) {
  return (
    <div className="flex flex-wrap gap-4">
      {(Object.keys(INSURANCE_LABEL) as (keyof SocialInsuranceInfo)[]).map((key) => (
        <label key={key} className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={data[key]}
            onChange={(e) => onChange({ ...data, [key]: e.target.checked })}
          />
          {INSURANCE_LABEL[key]}
        </label>
      ))}
    </div>
  );
}
