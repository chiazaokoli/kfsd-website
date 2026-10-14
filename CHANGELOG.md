# Design change log

Use this file to find a past design decision and its commit. Keep entries short:
date, what changed, affected files, and the commit. Add future entries at the top.
Git stores the actual code; this file is an index for finding it.

To undo a complete change, use `git revert <commit>` and verify the result before
deploying. To restore only part of a design, inspect `git show <commit>` and apply
the relevant pieces to the current code so later changes are preserved.

## 2026-10-14

- `2db97c1` — Updated the FREE sticker to a white-rimmed blue badge with a
  larger peeled corner, rotated 12° anticlockwise. Positioned it at the heading's
  bottom-right without a separate content row, keeping it clear of the form.
  Removed the progress bar and all related availability text and animation styles.
  Files: `app/page.tsx`, `app/globals.css`.
- `b180afa` — Replaced the pill with a circular, tilted FREE sticker and a
  folded corner. Restyled the availability bar with moving diagonal wave bands,
  a dark outlined track, and a glowing fill edge without a percentage marker.
  Moved “Spaces are limited” to the left and removed “Registration window”.
  Files: `app/page.tsx`, `app/globals.css`.
- `99b6924` — Turned “Completely free” into a pill badge with a sparkle icon.
  Added a thicker gradient availability track, soft glow, and shimmer with
  reduced-motion support. Removed the three duration/free reminders and their
  checkmarks. The decorative track no longer animates its fill percentage.
  Files: `app/page.tsx`, `app/globals.css`.
- `114a2bd` — Applied the background color transition pattern between grades
  and five skills on mobile. The cream background waits for the full skills
  heading at the 80% viewport line, with matching reverse-scroll timing and
  readable grades text. Removed the skills heading's opacity gate and entrance
  animation across viewport sizes.
  Files: `app/page.tsx`, `app/globals.css`.
- `428e015` — Delayed the mobile lime-to-dark handoff until the full registration
  heading reaches the 80% viewport line. The preceding two-day section switches
  to light text on dark; registration uses dark text before the handoff. Faded the
  registration gradient at the section edges to remove the visible seam.
  Verified in the development preview at five mobile widths, with lint and
  type-check. Production verification and deployment followed once the user
  clarified that implementation go-ahead includes building and deploying.
  Files: `app/page.tsx`, `app/globals.css`.

## 2026-10-13

- `70b6e04` — Delayed the mobile blue-to-lime background transition until the
  entire “2 hours. 2 days. A lifetime of difference.” heading reaches the 80%
  viewport line. Reverse scrolling uses the same heading boundary.
  File: `app/page.tsx`.
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
