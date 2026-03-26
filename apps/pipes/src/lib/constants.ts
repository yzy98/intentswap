import type {
  IntentEventTypeValue,
  IntentStatusValue,
} from "@packages/db/schema";

export const IntentStatus = {
  ACTIVE: "ACTIVE",
  EXECUTED: "EXECUTED",
  CANCELLED: "CANCELLED",
} as const satisfies Record<string, IntentStatusValue>;

export const IntentEventType = {
  CREATED: "CREATED",
  UPDATED: "UPDATED",
  EXECUTED: "EXECUTED",
  CANCELLED: "CANCELLED",
} as const satisfies Record<string, IntentEventTypeValue>;
