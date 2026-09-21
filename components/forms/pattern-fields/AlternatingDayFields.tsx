import { AlternatingDayData } from "@/lib/contract-templates/types";
import { FieldLabel, TextInput, TimeInput } from "../fields";

export function AlternatingDayFields({
  data,
  onChange,
}: {
  data: AlternatingDayData;
  onChange: (data: AlternatingDayData) => void;
}) {
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <FieldLabel>근무 시작 시각</FieldLabel>
          <TimeInput
            value={data.workStartTime}
            onChange={(e) => onChange({ ...data, workStartTime: e.target.value })}
          />
        </div>
        <div>
          <FieldLabel>근무 종료 시각</FieldLabel>
          <TimeInput
            value={data.workEndTime}
            onChange={(e) => onChange({ ...data, workEndTime: e.target.value })}
          />
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          checked={data.crossesMidnight}
          onChange={(e) => onChange({ ...data, crossesMidnight: e.target.checked })}
        />
        자정을 넘겨 다음날까지 근무 (예: 24시간 교대)
      </label>
      <div>
        <FieldLabel>기준 근무일 (이 날짜를 근무일로 기준 삼아 격일 반복)</FieldLabel>
        <TextInput
          type="date"
          value={data.cycleReferenceDate}
          onChange={(e) => onChange({ ...data, cycleReferenceDate: e.target.value })}
        />
      </div>
    </>
  );
}
