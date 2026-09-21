import {
  EmploymentPatternData,
  WORK_PATTERN_LABEL,
  WORK_PATTERN_TYPES,
  WorkPatternType,
} from "@/lib/contract-templates/types";
import { createDefaultPatternData } from "@/lib/contract-templates/registry";
import { FieldLabel } from "./fields";
import { WeeklyScheduleFields } from "./pattern-fields/WeeklyScheduleFields";
import { MonthlyOffFields } from "./pattern-fields/MonthlyOffFields";
import { AlternatingDayFields } from "./pattern-fields/AlternatingDayFields";
import { AlternatingWeekFields } from "./pattern-fields/AlternatingWeekFields";

export function DynamicWorkPatternForm({
  data,
  onChange,
}: {
  data: EmploymentPatternData;
  onChange: (data: EmploymentPatternData) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <FieldLabel>근무 형태</FieldLabel>
        <select
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          value={data.type}
          onChange={(e) => onChange(createDefaultPatternData(e.target.value as WorkPatternType))}
        >
          {WORK_PATTERN_TYPES.map((type) => (
            <option key={type} value={type}>
              {WORK_PATTERN_LABEL[type]}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-slate-500">
          근무하는 요일과 시간을 체크·입력하면 근로일·소정근로시간이 자동으로 계약서에 반영됩니다.
        </p>
      </div>

      {data.type === "WEEKLY_SCHEDULE" && (
        <WeeklyScheduleFields data={data} onChange={onChange} />
      )}
      {data.type === "MONTHLY_OFF" && <MonthlyOffFields data={data} onChange={onChange} />}
      {data.type === "ALTERNATING_DAY" && (
        <AlternatingDayFields data={data} onChange={onChange} />
      )}
      {data.type === "ALTERNATING_WEEK" && (
        <AlternatingWeekFields data={data} onChange={onChange} />
      )}
    </div>
  );
}
