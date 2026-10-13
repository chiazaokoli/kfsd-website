# Design change log

Use this file to find a past design decision and its commit. Keep entries short:
date, what changed, affected files, and the commit. Add future entries at the top.
Git stores the actual code; this file is an index for finding it.

To undo a complete change, use `git revert <commit>` and verify the result before
deploying. To restore only part of a design, inspect `git show <commit>` and apply
the relevant pieces to the current code so later changes are preserved.

## 2026-10-13

- `48d4274` — Reverted `29227aa` at the user's request. Restored the shared
  background transitions for the organiser copy and “Why just two days?” on mobile.
  File: `app/globals.css`.
- `29227aa` — Fixed mobile contrast when scrolling between the organiser copy
  and “Why just two days?”. The copy keeps its blue background and the following
  section keeps its lime background, so the shared page background cannot place
  white organiser text on lime in either scroll direction.
  File: `app/globals.css`.
- `7c032bd` — The organiser image starts with 32px rounded corners and animates
  to 0px as its existing scroll expansion reaches full size. Reduced-motion users
  see the final square-cornered image without the animation.
  Files: `app/page.tsx`, `app/globals.css`.
- `4194e8d` — Removed the video stories and participant story placeholder carousel
  below the speaker grid, including its unused styles and icons. The reflection
  image remains available in `public/images/reflection.webp` for future use.
  Files: `app/page.tsx`, `app/globals.css`, `src/components/SmoothCorners.tsx`.
- `afa6cf2` — Joined speaker cards with zero gaps, borders, or rounded corners;
  stretched the grid to both page edges. Details show only dark names and softer
  grey topics. Files: `app/page.tsx`, `app/globals.css`.
- `bccbca4` — Added five fictional placeholder speaker names and portraits, one
  each for communication, leadership, critical thinking, resilience, and
  integrity. Three columns on desktop, two on most phones, one at 360px and below.
  Files: `app/page.tsx`, `app/globals.css`, `public/images/speaker-placeholders.webp`.
- `27a974c` — Added a sliding highlight between the Day 1 and Day 2 tabs with
  reduced-motion support; removed “Schedule may be adjusted slightly.”
  Files: `app/page.tsx`, `app/globals.css`.
- `4a461aa` — Joined the blue local-time and dark schedule cards edge to edge on
  mobile, with no vertical gap or rounded corners; retained content padding.
  Disabled the dark card's mobile entrance animation to keep the join intact.
  Files: `app/page.tsx`, `app/globals.css`.
- `b4af322` — Starting version for this round of design work. Removed the
  learning-flow pulse and restored immediate mobile learning-card focus.
