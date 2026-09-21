import { AlternatingWeekData, ContractPatternModule, WEEKDAY_LABEL, WEEKDAYS } from "../types";

export const alternatingWeekModule: ContractPatternModule<AlternatingWeekData> = {
  label: "격주 근무 (1주차/2주차 교대)",
  createDefault: () => ({
    type: "ALTERNATING_WEEK",
    weekASchedule: {
      MON: { startTime: "09:00", endTime: "18:00" },
      TUE: { startTime: "09:00", endTime: "18:00" },
      WED: { startTime: "09:00", endTime: "18:00" },
      THU: { startTime: "09:00", endTime: "18:00" },
      FRI: { startTime: "09:00", endTime: "18:00" },
    },
    weekBSchedule: {
      MON: { startTime: "09:00", endTime: "18:00" },
      TUE: { startTime: "09:00", endTime: "18:00" },
      WED: { startTime: "09:00", endTime: "18:00" },
      THU: { startTime: "09:00", endTime: "18:00" },
      FRI: { startTime: "09:00", endTime: "18:00" },
      SAT: { startTime: "09:00", endTime: "14:00" },
    },
    referenceWeekStartDate: new Date().toISOString().slice(0, 10),
  }),
  renderClauseText: (data) => {
    return `근로일과 근무시간은 1주 단위로 교대하는 격주제로 하며, 1주차(A주)와 2주차(B주)의 근로일별 근로시간은 아래 표와 같다. ${data.referenceWeekStartDate}이(가) 속한 주를 1주차(A주)로 하여 이후 격주로 반복 적용한다.`;
  },
  renderScheduleTable: (data) => {
    const rows: string[][] = [];
    const rowLabel = (weekLabel: string) => weekLabel;
    for (const [label, schedule] of [
      ["1주차(A주)", data.weekASchedule],
      ["2주차(B주)", data.weekBSchedule],
    ] as const) {
      rows.push([
        rowLabel(label),
        ...WEEKDAYS.map((d) => {
          const s = schedule[d];
          return s ? `${s.startTime} ~ ${s.endTime}` : "휴무";
        }),
      ]);
    }
    return {
      headers: ["구분", ...WEEKDAYS.map((d) => `${WEEKDAY_LABEL[d]}요일`)],
      rows,
    };
  },
};
