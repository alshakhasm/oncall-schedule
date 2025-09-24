(The file `/Users/Mohammad/spec-kit/my_project/specs/005-make-holidays-render/spec.md` exists, but is empty)
# Feature Specification: Holidays Render as Highlighted Cells

**Feature Branch**: `005-make-holidays-render`
**Created**: 2025-09-23
**Status**: Draft
**Input**: User description: "Make holidays render as grey highlighted cells without inline text inside the cell; no visible "Holiday" text — only a visual background highlight and an accessible label for screen readers."

## Execution Flow (main)
```
1. Parse user description from Input
	→ If empty: ERROR "No feature description provided"
2. Extract key concepts from description
	→ Identify: actors, actions, data, constraints
3. For each unclear aspect:
	→ Mark with [NEEDS CLARIFICATION: specific question]
4. Fill User Scenarios & Testing section
	→ If no clear user flow: ERROR "Cannot determine user scenarios"
5. Generate Functional Requirements
	→ Each requirement must be testable
	→ Mark ambiguous requirements
6. Identify Key Entities (if data involved)
7. Run Review Checklist
	→ If any [NEEDS CLARIFICATION]: WARN "Spec has uncertainties"
	→ If implementation details found: ERROR "Remove tech details"
8. Return: SUCCESS (spec ready for planning)
```

## ⚡ Quick Guidelines
- ✅ Focus on WHAT users need and WHY
- ❌ Avoid HOW to implement (no tech stack, APIs, code structure)
- 👥 Written for business stakeholders, not developers

## User Scenarios & Testing

### Primary User Story
As a schedule owner, I want public holidays to be visually indicated on the calendar so that I (and viewers) clearly understand those days are non-working/blocked without cluttering the calendar with extra text.

### Acceptance Scenarios
1. Given a calendar with holidays configured, When the calendar is displayed, Then holiday days show a light grey background highlight and no inline "Holiday" text inside the cell.
2. Given a holiday cell, When a user tabs to the cell or a screen reader explores it, Then the cell exposes an accessible label indicating "Holiday" and the holiday name (if provided).
3. Given a day which is both a holiday and assigned to staff (manual or auto), When the calendar is displayed, Then the holiday highlight takes precedence visually (e.g., subdued background) and assignment pills are either suppressed or shown with a clear visual treatment [NEEDS CLARIFICATION: Should assignments be hidden on holidays or shown with reduced prominence?].

### Edge Cases
- Multiple holidays on same day (different names): display combined label (e.g., "Holiday: Name A; Name B") in the accessible label; visually use single highlight.
- Holidays spanning multiple days: each day in the span should be highlighted independently.
- Internationalization/local timezone differences: the holiday dates are based on the app's canonical date representation (ISO date strings); if the organization needs per-region holidays, mark [NEEDS CLARIFICATION].

### Visual & Interaction
- Holiday days MUST use a dedicated CSS class (e.g., `.holiday`) applied to the day cell element.
- The visual treatment MUST be a soft grey background (not pure black/white) with sufficient contrast for adjacent text or overlays. Provide exact color tokens in design handoff.
- No visible inline textual label "Holiday" should appear inside the day cell; instead provide an `aria-label` on the day cell containing the holiday name (or generic "Holiday" if name absent).
- Keyboard users MUST be able to focus a holiday cell and receive the same accessible label via the browser's accessibility tree.
- Hover tooltip (optional): show holiday name(s) on hover for mouse users; ensure tooltip content is accessible to keyboard and screen reader users if implemented.

## Requirements

### Functional Requirements
- **HOL-001**: The calendar rendering logic MUST mark days that are configured as holidays with a boolean or metadata flag (e.g., `isHoliday` or `holidays[isoDate]`).
- **HOL-002**: The UI MUST add class `.holiday` to day cells whose date is a holiday.
- **HOL-003**: Holiday highlighting MUST be independent of staff assignments in the data model; it is a visual overlay but the persisted assignment model remains unchanged.
- **HOL-004**: The system MUST expose an accessible label on holiday day cells containing the holiday name(s) or the word "Holiday".

### Visual & Interaction Requirements
- **HOL-UI-001**: The `.holiday` class MUST apply a light grey background to the day cell and preserve the day number legibility.
- **HOL-UI-002**: Assignment pills MAY be suppressed on holiday days or shown with reduced opacity [NEEDS CLARIFICATION: choose suppression or reduced prominence].
- **HOL-UI-003**: Holiday highlighting MUST not break existing overlay/spanning pill rendering; spanning pills that include a holiday day should render per-week-row with visual precedence rules.

## Files / Components Affected
- `src/lib/scheduler.ts` — ensure holiday metadata is surfaced to the Calendar component (if not already present).
- `src/components/CalendarGrid.tsx` — add `holiday` class to day cell rendering and add `aria-label` with holiday name.
- `src/styles.css` — add styles for `.holiday` (background color, hover state) and rules for how assignment pills appear on holiday cells.
- `src/components/CalendarGrid.compact.test.tsx` or unit tests — add tests verifying holiday presence leads to `.holiday` on the day cell and accessible label content.

## Notes / Clarifications
- [NEEDS CLARIFICATION]: When a day is both a holiday and has an assignment, should assignments be hidden completely, shown with reduced prominence, or indicated with a clear visual conflict state? This affects both the visual treatment and the export behavior.
- [NEEDS CLARIFICATION]: If holiday names are optional, should the `aria-label` default to "Holiday" or include an explicit empty name? Recommend default to "Holiday".
- Internationalization: holiday names should be translatable if they are user-provided.

## Review & Acceptance Checklist
- [ ] `.holiday` class applied to holiday days
- [ ] Holiday background color approved by design and accessible
- [ ] `aria-label` present on holiday cells with holiday name(s)
- [ ] Unit tests added for holiday rendering
- [ ] Behavior decided for assignment+holiday conflict and implemented

## Execution Status
- [ ] User description parsed
- [ ] Key concepts extracted
- [ ] Ambiguities marked
- [ ] User scenarios defined
- [ ] Requirements generated
- [ ] Entities identified
- [ ] Review checklist passed

