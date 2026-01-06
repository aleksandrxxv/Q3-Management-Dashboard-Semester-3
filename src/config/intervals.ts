import { IntervalType } from "@/types/interval";

export const INTERVALS = {
  [IntervalType.Minute]: {
    label: "Shots per minute",
    unit: "minute",
    bucket: 1,
    cacheTTL: 30_000,
    round: (d: Date) => {
      d.setSeconds(0, 0);
      return d;
    },
  },

  [IntervalType.FiveMinute]: {
    label: "Shots per 5 minutes",
    unit: "minute",
    bucket: 5,
    cacheTTL: 60_000,
    round: (d: Date) => {
      d.setMinutes(Math.floor(d.getMinutes() / 5) * 5, 0, 0);
      return d;
    },
  },

  [IntervalType.Hour]: {
    label: "Shots per hour",
    unit: "hour",
    bucket: 1,
    cacheTTL: 5 * 60_000,
    round: (d: Date) => {
      d.setMinutes(0, 0, 0);
      return d;
    },
  },

  [IntervalType.Day]: {
    label: "Shots per day",
    unit: "day",
    bucket: 1,
    cacheTTL: 15 * 60_000,
    round: (d: Date) => {
      d.setHours(0, 0, 0, 0);
      return d;
    },
  },

  [IntervalType.Week]: {
    label: "Shots per week",
    unit: "week",
    bucket: 1,
    cacheTTL: 30 * 60_000,
    round: (d: Date) => {
      d.setHours(0, 0, 0, 0);
      return d;
    },
  },
} as const;
