export const siteConfig = {
  name: "KFSD Soft Skills Training",
  organiser: "KFSD",
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
      title: "Think clearly, lead with integrity",
      date: "Wednesday, 25 November",
      items: [
        ["10:00", "Moderator introduces the soft skills training"],
        ["10:05", "Brief intro on the CEO"],
        ["10:15", "Critical Thinking"],
        ["10:45", "Leadership"],
        ["11:15", "Integrity"],
        ["11:45", "Collect questions for Day 2 and wrap up"],
      ],
    },
    {
      label: "Day 2",
      title: "Communicate, adapt, work together",
      date: "Thursday, 26 November",
      items: [
        ["10:00", "Young entrepreneurs’ panel answers questions"],
        ["10:20", "Communication"],
        ["10:50", "Resilience"],
        ["11:20", "Teamwork"],
        ["11:50", "Closing and next steps"],
      ],
    },
  ],
} as const;

export type Schedule = (typeof siteConfig.schedules)[number];
