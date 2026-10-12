export const siteConfig = {
  name: "KFSD Soft Skills Training",
  organiser: "CKL",
  edition: "12th Edition",
  contactEmail: "hello@example.com",
  event: {
    startUtc: "2026-11-25T09:00:00Z",
    endUtc: "2026-11-25T11:00:00Z",
    secondDayStartUtc: "2026-11-26T09:00:00Z",
    secondDayEndUtc: "2026-11-26T11:00:00Z",
    dateLabel: "25th–26th November 2026",
    timeLabel: "10:00AM–12:00PM WAT daily",
    venue: "Live on Zoom",
  },
  registration: {
    priceWas: "N25,000",
    priceNow: "Completely free",
    slotsTaken: null as number | null,
    slotsTotal: 500,
  },
  levels: [
    "High school",
    "University",
    "Technical or vocational college",
    "Other",
  ],
  schedules: [
    {
      label: "Day 1",
      title: "Know yourself, lead yourself",
      date: "Wednesday, 25 November",
      items: [
        ["10:00", "Welcome and icebreaker"],
        ["10:10", "Session 1: Leadership"],
        ["10:50", "Session 2: Critical Thinking"],
        ["11:30", "Group activity and reflection"],
        ["11:50", "Live Q&A and wrap-up"],
      ],
    },
    {
      label: "Day 2",
      title: "Connect, endure, be trusted",
      date: "Thursday, 26 November",
      items: [
        ["10:00", "Recap and warm-up"],
        ["10:10", "Session 3: Communication"],
        ["10:50", "Session 4: Resilience and Integrity"],
        ["11:30", "Practice and apply"],
        ["11:50", "Q&A, closing and next steps"],
      ],
    },
  ],
} as const;

export type Schedule = (typeof siteConfig.schedules)[number];
