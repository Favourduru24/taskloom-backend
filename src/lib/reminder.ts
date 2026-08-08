// import { ReminderCadence } from "@prisma/client";
// import { addDays } from "./date";


// const REMINDER_INTERVALS: Record<
//   Exclude<ReminderCadence, "CUSTOM">,
//   number
// > = {
//   DAILY: 1,
//   WEEKLY: 7,
//   BIWEEKLY: 14,
//   MONTHLY: 30,
//   QUARTERLY: 90,
// };

// export function scheduleReminder(
//   cadence: ReminderCadence,
//   customDays?: number,
//   from: Date = new Date(),
// ): Date {
//   if (cadence === "CUSTOM") {
//     if (!customDays) {
//       throw new Error("customDays is required.");
//     }

//     return addDays(from, customDays);
//   }

//   return addDays(from, REMINDER_INTERVALS[cadence]);
// }

import { ReminderCadence } from "@prisma/client";
import { addDays, addMinutes } from "./date";

const REMINDER_INTERVALS: Record<
  Exclude<ReminderCadence, "CUSTOM">,
  number
> = {
  DAILY: 1,
  WEEKLY: 7,
  BIWEEKLY: 14,
  MONTHLY: 30,
  QUARTERLY: 90,
};

// cadence,
//   customDays,
//   from,
//   testMinutes,

export function scheduleReminder(
  cadence: ReminderCadence,
  customDays?: number,
  from: Date = new Date(),
  testMinutes?: number,
): Date {
  // Development testing
  if (testMinutes) {
    return addMinutes(from, testMinutes);
  }

  if (cadence === "CUSTOM") {
    if (!customDays) {
      throw new Error("customDays is required.");
    }

    return addDays(from, customDays);
  }

  return addDays(from, REMINDER_INTERVALS[cadence]);
}