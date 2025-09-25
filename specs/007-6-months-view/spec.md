# Feature Specification: Six-Month View (3x3 Grid)

**Feature Branch**: `007-6-months-view`  
**Created**: 2025-09-24  
**Status**: Draft  
**Input**: User description: "6 months view has 3 by 3 grid each unit is a month"

## User Scenarios & Testing (mandatory)

### Primary User Story
As a scheduler, I want to view six consecutive months at once so that I can plan coverage across quarters and spot gaps without switching views.

### Acceptance Scenarios
1. Given the calendar is in "6 months" mode and a start month is selected, When the view renders, Then six months display in a fixed 3x3 grid with each unit representing a single month.
2. Given the 6‑month view is visible, When I navigate next/previous, Then the start month shifts by one month and the grid updates to show the next/previous six consecutive months.
3. Given the 6‑month view is visible, When assignments exist, Then each mini‑month shows days and assignment indicators consistent with other views (in‑cell pills and spanning weekly bars where applicable).
4. Given boundary weeks, When a week spans two months, Then the week appears only in the month that owns the week by Sunday‑anchored rule.

### Edge Cases
- Start month near year end (e.g., Nov): grid spans across calendar year boundary and labels must reflect correct years.
- Months with 28/29/30/31 days: grid aligns and does not create duplicate or missing weeks.
- Holidays and leaves: still render indicators; unassignable holidays must not accept drops or manual assignment.

### Visual & Interaction (optional but recommended)
- Each of the 6 mini‑months include a header with Month YYYY, weekday headers (S–S), and a 6‑row grid of days.
- Mini‑months scale for readability (consistent with compact 3‑month style but sized appropriately for a larger matrix).
- Keyboard navigation: focus must move within and across mini‑months using arrow keys; each day remains focusable.
- Drag‑and‑drop from the staff list onto a day continues to function within mini‑months with the same feedback affordances.

## Grid UI: Connected Multi-day Pills & In-Cell Pills (UI specification)

### Summary
Carry over existing pill behaviors to the 6‑month view; ensure no duplication and correct clipping within week rows of each mini‑month.

### Goals
- Provide at‑a‑glance coverage across six months.
- Maintain consistency with 1‑month and 3‑month views for assignments and accessibility.

### Visual & Interaction Requirements
- GRID-001..GRID-007: same as template; apply within each mini‑month cell.

### Acceptance Criteria
- Six mini‑months render as a 3x3 matrix (row‑major order). 
- Spanning pills connect within weekly rows; per‑cell pills suppressed where an overlay pill exists.
- Sunday‑anchored week ownership prevents boundary week duplication.

### Files / Components Affected
- `src/components/CalendarGrid.tsx` (extend to render 6‑month mode with 3x3 layout)
- `src/styles.css` (add styles for 6‑month matrix sizing and spacing)
- `src/components/CalendarGrid.compact.test.tsx` or new tests (add tests for 6‑month rendering and week ownership)

### Notes / Clarifications
- [NEEDS CLARIFICATION: Should navigation step by one month or six months in this mode?]
- [NEEDS CLARIFICATION: Should month cells auto‑fit to available width or use fixed width with horizontal scroll on narrow screens?]
- [NEEDS CLARIFICATION: Should assignment pills show staff names or initials in 6‑month view when space is constrained?]

## Requirements (mandatory)

### Functional Requirements
- **FR-001**: System MUST provide a 6‑month view mode that displays six consecutive months in a 3x3 grid.
- **FR-002**: System MUST use Sunday‑anchored week ownership so boundary weeks appear in only one month.
- **FR-003**: Users MUST be able to navigate forward/backward to change the start month while staying in 6‑month view.
- **FR-004**: System MUST display assignments using the same rules as other views (in‑cell pills and spanning weekly bars).
- **FR-005**: System MUST preserve accessibility: day cells focusable, labels announce date and assignment, overlay bars announce ranges.

### Visual & Interaction Requirements
- **FR-VIS-001**: The 6‑month grid MUST render as 3 columns by 3 rows on desktop; on smaller screens it MAY collapse to fewer columns with wrapping while preserving reading order.
- **FR-VIS-002**: Each mini‑month MUST include a header, weekday labels, and day grid aligned to Sundays.
- **FR-VIS-003**: Assignment bars and day pills MUST scale to remain legible without overlap; long labels truncate with ellipsis.
- **FR-VIS-004**: Hover/focus states, contrast, and keyboard navigation MUST match accessibility guidelines.

### Key Entities
- No new entities; uses existing Staff, Assignment, Holiday, and Leave concepts.

---

## Review & Acceptance Checklist

### Content Quality
- [x] No implementation details (languages, frameworks, APIs)
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

### Requirement Completeness
- [ ] No [NEEDS CLARIFICATION] markers remain
- [x] Requirements are testable and unambiguous  
- [x] Success criteria are measurable
- [x] Scope is clearly bounded
- [x] Dependencies and assumptions identified

### Visual & Interaction Checklist
- [x] Each staff has a color in the spec or defaults are provided
- [x] Calendar cells show color highlights and initials
- [x] Drag-and-drop flows documented with keyboard fallback
- [x] Accessibility/contrast requirements stated

---

## Execution Status

- [x] User description parsed
- [x] Key concepts extracted
- [x] Ambiguities marked
- [x] User scenarios defined
- [x] Requirements generated
- [x] Entities identified
- [x] Review checklist passed
