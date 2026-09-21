import { ContractPatternModule, EmploymentPatternData, WorkPatternType } from "./types";
import { weeklyScheduleModule } from "./patterns/weeklySchedule";
import { monthlyOffModule } from "./patterns/monthlyOff";
import { alternatingDayModule } from "./patterns/alternatingDay";
import { alternatingWeekModule } from "./patterns/alternatingWeek";

type AnyPatternModule = ContractPatternModule<EmploymentPatternData>;

// Each module operates on its own narrow pattern type; the registry stores them
// under a common shape and callers narrow by `type` before invoking pattern-specific logic.
export const patternRegistry: Record<WorkPatternType, AnyPatternModule> = {
  WEEKLY_SCHEDULE: weeklyScheduleModule as unknown as AnyPatternModule,
  MONTHLY_OFF: monthlyOffModule as unknown as AnyPatternModule,
  ALTERNATING_DAY: alternatingDayModule as unknown as AnyPatternModule,
  ALTERNATING_WEEK: alternatingWeekModule as unknown as AnyPatternModule,
};

export function getPatternModule(type: WorkPatternType): AnyPatternModule {
  return patternRegistry[type];
}

export function createDefaultPatternData(type: WorkPatternType): EmploymentPatternData {
  return patternRegistry[type].createDefault();
}
