import { AlternatingWeekData } from "@/lib/contract-templates/types";
import { FieldLabel, TextInput } from "../fields";
import { WeekScheduleTable } from "./WeekScheduleTable";

export function AlternatingWeekFields({
  data,
  onChange,
}: {
  data: AlternatingWeekData;
  onChange: (data: AlternatingWeekData) => void;
}) {
  return (
    <>
      <div className="rounded-md bg-slate-50 p-4">
        <p className="mb-3 text-sm font-semibold text-slate-800">1주차 (A주)</p>
        <WeekScheduleTable
          schedule={data.weekASchedule}
          onChange={(weekASchedule) => onChange({ ...data, weekASchedule })}
        />
      </div>
      <div className="rounded-md bg-slate-50 p-4">
        <p className="mb-3 text-sm font-semibold text-slate-800">2주차 (B주)</p>
        <WeekScheduleTable
          schedule={data.weekBSchedule}
          onChange={(weekBSchedule) => onChange({ ...data, weekBSchedule })}
        />
      </div>
      <div>
        <FieldLabel>기준 주 시작일 (이 날짜가 속한 주를 1주차로 기준 삼음)</FieldLabel>
        <TextInput
          type="date"
          value={data.referenceWeekStartDate}
          onChange={(e) => onChange({ ...data, referenceWeekStartDate: e.target.value })}
        />
      </div>
    </>
  );
}
