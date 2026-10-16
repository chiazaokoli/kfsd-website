# Design change log

Use this file to find a past design decision and its commit. Keep entries short:
date, what changed, affected files, and the commit. Add future entries at the top.
Git stores the actual code; this file is an index for finding it.

To undo a complete change, use `git revert <commit>` and verify the result before
deploying. To restore only part of a design, inspect `git show <commit>` and apply
the relevant pieces to the current code so later changes are preserved.

## 2026-10-16

- `8c2025f` — Added a quick, staggered mobile hero entrance for the badge,
  whole headline, supporting text, CTA, and event card. Removed the mobile
  per-letter colour sweep while keeping the photo still and desktop motion
  intact. Files: `app/page.tsx`, `app/globals.css`.
- `7d74f23` — Replaced all five speaker portraits with the supplied 627×810
  exports and refreshed their asset URLs. Files: `app/page.tsx`,
  `public/images/speakers/`.
- `519f983`, `02247a6` — Replaced the speaker placeholders with the supplied
  names, topics, and five portraits, preserving the edge-to-edge grid. Files:
  `app/page.tsx`, `app/globals.css`, `src/components/SmoothCorners.tsx`,
  `public/images/speakers/`.

## 2026-10-15

- `96672ed` — Replaced Company with the provided organisation dropdown,
  updated referral choices to the provided list, kept long menus scrollable on
  mobile, and halved the mobile gap below the five-skills heading. Files:
  `app/page.tsx`, `app/globals.css`.
- `a667f63` — Replaced the registration form fields with email, first and last
  name, phone, profession, optional company, country, state, prior KFSD attendance,
  and referral source. Kept the existing form style and custom mobile dropdowns.
  Files: `app/page.tsx`, `app/globals.css`.
- `a921f3b` — Shifted the intro thumbnail crop so the speaker’s head is
  centered in the arch on mobile. File: `app/globals.css`.
- `d5cf9ae` — Removed the baked-in subtitle from the intro thumbnail only;
  fullscreen playback still uses the original video. Files: `app/page.tsx`,
  `public/images/kfsd-intro-thumbnail-clean.webp`.
- `d4bbe35` — Matched the intro thumbnail to the supplied reference pose and
  subtitle, and gave the replacement image a new URL to refresh cached copies.
  Files: `app/page.tsx`, `public/images/kfsd-intro-thumbnail.webp`.
- `fb9d50f` — Added the KFSD introduction video to the existing story arch,
  with a centered video-frame thumbnail, glass play button, and fullscreen
  playback. Files: `app/page.tsx`, `app/globals.css`, `public/images/kfsd-intro-poster.webp`,
  `public/videos/kfsd-intro.mp4`.
- `68e065c` — Increased the mobile space below the good-grades paragraph
  from 75px to 90px. File: `app/globals.css`.
- `89f132e` — Refreshed the hero, pain points, learning, schedule, and speaker
  copy; paired the future-focused caption with a launch icon; and adjusted
  good-grades line height and mobile section spacing. Files: `app/page.tsx`,
  `app/globals.css`.
- `9719a9b` — Restored “Two hours. Two days. A lifetime of difference.”,
  spelled out both “four hours” references in its paragraph, and used words
  for the numbers in the hero, skills, and organiser headings. File: `app/page.tsx`.
- `3050006` — Switched form focus rings to green, activated the 12th-edition
  glass blur, rounded the hero event card, lowered the mobile grade sketch
  beside its heading while balancing section spacing, and refreshed the
  organiser, schedule, and footer copy for KFSD. Files: `app/globals.css`,
  `app/page.tsx`, `src/config/site.ts`.

## 2026-10-14

- `34d3362` — Shifted the mobile hero image crop right to show the student
  speaker while preserving its aspect ratio with `object-fit: cover`.
  File: `app/globals.css`.
- `a2f9633` — Matched all registration text inputs and the level trigger to
  the submit CTA’s 19px smooth radius. File: `app/globals.css`.
- `0296817` — Halved the level-menu inset to 4px and matched the level trigger
  and text inputs at 53px high, 10px radius, and the same smooth corner shape.
  Files: `app/globals.css`, `src/components/SmoothCorners.tsx`.
- `8cc8146` — Matched the level picker’s field dimensions to the other inputs
  and styled its dropdown with inset pale-green option highlights and smooth
  iOS-style corners. File: `app/globals.css`.
- `f2bbabe` — Set the registration submit text to semibold and lifted the
  mobile hero copy, CTA, and event-details card by roughly one-third of the
  logo-to-edition gap. File: `app/globals.css`.
- `85101a8` — Increased speaker topic text to 14px regular and removed the
  leftover letter spacing from its old uppercase styling. File: `app/globals.css`.
- `a719f8f` — Set speaker topics to sentence case, removed the small “Why
  just two days?” and “Good to know” headings, tightened the mobile schedule
  and form spacing, changed the level picker to a chevron, and enlarged the
  navbar CTA to 14px medium. Files: `app/page.tsx`, `app/globals.css`.
- `c9da719` — Reduced Q&A questions to 16px medium in shorter rows, set
  learning-card descriptions to 13px regular, and shortened the hero and
  navbar CTAs to “Reserve my spot”. Files: `app/page.tsx`, `app/globals.css`.
- `6cc6a7b` — Matched the day-tab highlight to the tabs' smooth corners and
  refined hero, section, form, Q&A, and footer typography and CTA icons.
  Files: `app/page.tsx`, `app/globals.css`, `src/components/SmoothCorners.tsx`.
- `4751199` — Lowercased “we start in”; rounded the navbar CTA and day tabs;
  set speaker topics to 12px regular uppercase and registration labels/field
  text to 12px medium/14px regular. Files: `app/page.tsx`, `app/globals.css`.
- `0c77974` — Brightened site fills and dark-background accents to `#22DB79`,
  kept the logo's original green on a light backing, and made the organiser
  text switch between light and dark as the shared background moves between
  blue and green. Files: `app/globals.css`, `app/page.tsx`,
  `src/components/SmoothCorners.tsx`.
- `9b91503` — Prepared transparent logo assets from the supplied Kaiser Foundation
  reference and added them to the splash screen, navigation, footer and favicon.
  Files: `app/page.tsx`, `app/components/SplashScreen.tsx`, `app/layout.tsx`,
  `app/globals.css`, `public/images/kfsd-logo-*.webp`, `public/images/kfsd-icon.png`.
- `a703e12` — Changed the site's lime accents and scroll backgrounds to KFSD
  green (`#09A758`), with coordinated green CTA gradients and contrast tweaks.
  The pre-change restore tag is `restore-before-kfsd-brand-update-2026-10-14`.
  Files: `app/globals.css`, `app/page.tsx`, `src/components/SmoothCorners.tsx`.
- `c828cda` — Removed the hero CTA's inset shadows and replaced its blurry
  bubbles with tiny, crisp dots that rise and fade. File: `app/globals.css`.
- `2fc10d8` — Reworked the hero CTA into a predominantly green gradient with
  animated teal/violet color shifts, floating bubbles, a paper-plane icon and
  more rounded 19px iOS-style corners. Files: `app/page.tsx`, `app/globals.css`.
- `38834e4` — Restyled the hero CTA with an animated cream, cyan and blue
  gradient, a bright lower glow and 10px iOS-style corners. Kept the sticky
  CTA's lime styling. File: `app/globals.css`.
- `4ea085a` — Set hero event date, time and Zoom details to 13px regular text,
  removed the bottom rule below Zoom, and changed the hero CTA to 15px medium
  sentence-case text. Matched the sticky CTA wording. Files: `app/page.tsx`,
  `app/globals.css`.
- `d412d78` — Removed the organiser affiliations note and shield icon. Hid the
  oversized decorative “2” on mobile because its clipped stroke appeared as
  a stray rectangle above “Why just two days?”. Files: `app/page.tsx`,
  `app/globals.css`.
- `a0f73a4` — Animated Q&A answers as they expand and collapse, with rotating
  plus icons, keyboard-operable question buttons, and reduced-motion support.
  Files: `app/page.tsx`, `app/globals.css`.
- `3174e49` — Gave the footer its solid dark background and stopped the shared
  background from transitioning into it. Q&A now meets the footer with a hard
  white-to-dark cut. Files: `app/page.tsx`, `app/globals.css`.
- `e1a869a` — Removed the final “Ready to set yourself apart?” CTA card and
  its styles. The page now ends with Q&A and a compact brand/details footer.
  Files: `app/page.tsx`, `app/globals.css`.
- `b1c100f` — Set the final “Ready to set yourself apart?” CTA in a rounded
  green, teal and warm-toned gradient card, with a light registration button
  and a stacked mobile layout. Files: `app/page.tsx`, `app/globals.css`,
  `src/components/SmoothCorners.tsx`.
- `9a89573` — Removed the mobile gap below the registration form so its white
  surface joins Q&A directly. Kept Q&A white and switched the shared background
  instantly at that seam in both scroll directions. Files: `app/page.tsx`,
  `app/globals.css`.
- `35ff522` — Raised the edge-to-edge, square-cornered mobile registration form
  so the FREE seal overlaps its top edge by half. Softened the submit button's
  lime and replaced the native level picker with an inline, keyboard-accessible
  dropdown with balanced chevron padding. Files: `app/page.tsx`, `app/globals.css`.
- `4b2f9c0` — Tilted the static FREE lettering 8° anticlockwise while the red
  scalloped seal continues rotating behind it. File: `app/globals.css`.
- `76cb627` — Rotated only the red scalloped seal, keeping the white FREE text
  upright. Reduced-motion visitors see the still seal. File: `app/globals.css`.
- `90f9e29` — Replaced the folded FREE sticker with a flat red scalloped seal
  based on the supplied reference. It rotates continuously beside the
  registration heading and stays still for reduced-motion visitors.
  Files: `app/page.tsx`, `app/globals.css`.
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
