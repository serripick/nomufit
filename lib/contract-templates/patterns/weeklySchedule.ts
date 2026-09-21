import { ContractPatternModule, WEEKDAY_LABEL, WEEKDAYS, WeeklyScheduleData } from "../types";

export const weeklyScheduleModule: ContractPatternModule<WeeklyScheduleData> = {
  label: "요일별 근무시간표 (매주 동일 반복)",
  createDefault: () => ({
    type: "WEEKLY_SCHEDULE",
    schedule: {
      MON: { startTime: "09:00", endTime: "18:00" },
      TUE: { startTime: "09:00", endTime: "18:00" },
      WED: { startTime: "09:00", endTime: "18:00" },
      THU: { startTime: "09:00", endTime: "18:00" },
      FRI: { startTime: "09:00", endTime: "18:00" },
    },
  }),
  renderClauseText: (data) => {
    const workDays = WEEKDAYS.filter((d) => data.schedule[d]);
    const allSameTime =
      workDays.length > 0 &&
      workDays.every(
        (d) =>
          data.schedule[d]!.startTime === data.schedule[workDays[0]]!.startTime &&
          data.schedule[d]!.endTime === data.schedule[workDays[0]]!.endTime
      );
    if (allSameTime && workDays.length > 0) {
      const first = data.schedule[workDays[0]]!;
      const dayLabels = workDays.map((d) => WEEKDAY_LABEL[d]).join(", ");
      return `근로일은 매주 ${dayLabels}요일로 하며, 근무시간은 ${first.startTime} ~ ${first.endTime}로 한다. 주휴일은 근로일에 포함되지 않은 요일 중 유급으로 부여되는 날로 한다.`;
    }
    return "근로일 및 근로일별 근로시간은 아래 표와 같이 요일별로 다르게 정한다.";
  },
  renderScheduleTable: (data) => {
    const workDays = WEEKDAYS.filter((d) => data.schedule[d]);
    const allSameTime =
      workDays.length > 0 &&
      workDays.every(
        (d) =>
          data.schedule[d]!.startTime === data.schedule[workDays[0]]!.startTime &&
          data.schedule[d]!.endTime === data.schedule[workDays[0]]!.endTime
      );
    if (allSameTime) return null;
    return {
      headers: ["구분", ...workDays.map((d) => `${WEEKDAY_LABEL[d]}요일`)],
      rows: [
        [
          "근무시간",
          ...workDays.map((d) => {
            const s = data.schedule[d]!;
            return `${s.startTime} ~ ${s.endTime}`;
          }),
        ],
      ],
    };
  },
};
