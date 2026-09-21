import { WEEKDAY_LABEL, WEEKDAYS, WeekSchedule } from "@/lib/contract-templates/types";
import { TimeInput } from "../fields";

export function WeekScheduleTable({
  schedule,
  onChange,
}: {
  schedule: WeekSchedule;
  onChange: (schedule: WeekSchedule) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <p className="mb-2 text-xs text-slate-500">
        월요일 시간을 입력하면 근무로 체크된 다른 요일에도 동일하게 적용됩니다. 요일별로 시간이
        다르면 해당 요일만 수기로 다시 수정하세요.
      </p>
      <table className="w-full min-w-[480px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left text-slate-500">
            <th className="py-2 pr-2 font-medium">요일</th>
            <th className="py-2 pr-2 font-medium">근무 여부</th>
            <th className="py-2 pr-2 font-medium">출근</th>
            <th className="py-2 font-medium">퇴근</th>
          </tr>
        </thead>
        <tbody>
          {WEEKDAYS.map((day) => {
            const entry = schedule[day];
            const enabled = !!entry;
            return (
              <tr key={day} className="border-b border-slate-100">
                <td className="py-2 pr-2 font-medium text-slate-800">{WEEKDAY_LABEL[day]}</td>
                <td className="py-2 pr-2">
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={(e) => {
                      const next = { ...schedule };
                      if (e.target.checked) {
                        const monday = schedule.MON;
                        next[day] = monday
                          ? { ...monday }
                          : { startTime: "09:00", endTime: "18:00" };
                      } else {
                        delete next[day];
                      }
                      onChange(next);
                    }}
                  />
                </td>
                <td className="py-2 pr-2">
                  <TimeInput
                    disabled={!enabled}
                    value={entry?.startTime ?? ""}
                    onChange={(e) => {
                      const next = { ...schedule };
                      next[day] = { startTime: e.target.value, endTime: entry?.endTime ?? "18:00" };
                      if (day === "MON") {
                        for (const d of WEEKDAYS) {
                          if (d !== "MON" && next[d]) {
                            next[d] = { ...next[d]!, startTime: e.target.value };
                          }
                        }
                      }
                      onChange(next);
                    }}
                  />
                </td>
                <td className="py-2">
                  <TimeInput
                    disabled={!enabled}
                    value={entry?.endTime ?? ""}
                    onChange={(e) => {
                      const next = { ...schedule };
                      next[day] = { startTime: entry?.startTime ?? "09:00", endTime: e.target.value };
                      if (day === "MON") {
                        for (const d of WEEKDAYS) {
                          if (d !== "MON" && next[d]) {
                            next[d] = { ...next[d]!, endTime: e.target.value };
                          }
                        }
                      }
                      onChange(next);
                    }}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
