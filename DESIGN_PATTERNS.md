# Reusable design instructions

These patterns are opt-in. Apply a pattern only to the section pair the user
names; naming a pattern does not authorize changes elsewhere on the page.

## Background color transition

**Shortcut:** “Apply the background color transition between [section A] and
[section B].”

### Requested behavior

- Delay the background fade until the next section's entire heading is visible.
- Keep the previous section's text readable before, during, and after the fade,
  including when both sections are visible together.
- Keep the next section's heading visible without a fade-in or entrance reveal.
- Fade the shared background smoothly; avoid abrupt seams from section backgrounds
  or gradients.
- Use the same heading boundary when scrolling backward.
- Design and verify mobile first. Preserve reduced-motion support.

### Implementation guidance

- Use the next heading's bottom edge as the trigger, rather than the next
  section's top edge. The existing mobile convention is the 80% viewport line.
- Remove any animation or CSS opacity gate that hides the named heading.
- Coordinate text colours with the actual backgrounds so neither section's text
  disappears during the handoff.
- Keep the shared background transition. Do not replace it with separate fixed
  colour blocks unless the user explicitly requests that.
- Check the seam, text visibility, and trigger timing in both scroll directions
  at multiple mobile widths.

Once implementation is approved, follow `agent.md`: verify, build, deploy, and
record the change in `CHANGELOG.md`.
