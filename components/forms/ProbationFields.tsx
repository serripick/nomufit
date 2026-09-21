import { ProbationInfo } from "@/lib/contract-templates/types";
import { FieldLabel, NumberInput } from "./fields";

export function ProbationFields({
  data,
  onChange,
}: {
  data: ProbationInfo;
  onChange: (data: ProbationInfo) => void;
}) {
  return (
    <div className="space-y-3">
      <label className="flex items-center gap-2 text-sm font-medium text-slate-800">
        <input
          type="checkbox"
          checked={data.applicable}
          onChange={(e) => onChange({ ...data, applicable: e.target.checked })}
        />
        수습기간 적용
      </label>
      {data.applicable && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <FieldLabel>수습기간 (개월)</FieldLabel>
            <NumberInput
              min={0}
              value={data.months}
              onChange={(e) => onChange({ ...data, months: Number(e.target.value) })}
            />
          </div>
          <div>
            <FieldLabel>수습기간 중 지급비율 (%)</FieldLabel>
            <NumberInput
              min={0}
              max={100}
              value={data.wagePercent}
              onChange={(e) => onChange({ ...data, wagePercent: Number(e.target.value) })}
            />
          </div>
        </div>
      )}
    </div>
  );
}
