(Feature specification for keeping assignment pills visible on holiday days)

# Feature Specification: Keep Assignments Visible During Holidays

**Feature Branch**: `006-dont-hide-assigment`
**Created**: 2025-09-24
**Status**: Draft
**Input**: User description: "dont hide assigment during holiday"

## Execution Flow (main)
```
1. Parse user description from Input
2. Extract key concepts: holiday visual treatment, assignment visibility, accessibility
3. Identify ambiguities and mark [NEEDS CLARIFICATION] where necessary
4. Produce acceptance scenarios and implementation-agnostic requirements
5. Verify with unit/UI tests that assignments remain visible and accessible on holiday days
```

## User Scenarios & Testing

### Primary User Story
As a schedule viewer, I want holidays to be visually indicated, but I still want to see who is assigned on those days so I can understand fallback coverage and historic assignments.

### Acceptance Scenarios
1. Given a calendar with a holiday on a date that also has an assignment, When the calendar is displayed, Then the holiday highlight is visible and the assignment pill is also visible (possibly with reduced prominence), and both are discoverable by screen readers.
2. Given a compact 3-month view, When a holiday and an assignment coincide on the same day, Then the cell shows the holiday background highlight and an in-cell pill (or portion of a spanning pill) representing the assignment.
3. Given keyboard navigation, When a user focuses a day that is both a holiday and assigned, Then the `aria-label` must contain both the holiday indication and the assigned staff name.

### Edge Cases
- If multiple holidays overlap with an assignment, the cell should display a single holiday highlight and a single assignment pill.
- If an assignment spans multiple days including holidays, spanning pills should render across all relevant cells; holiday cells should not suppress the spanning pill.

## Visual & Interaction
- Holiday visual treatment: soft grey background on the day cell (class: `.holiday`) — no inline "Holiday" text.
- Assignments on holiday days: assignment pills MUST remain visible. They MAY be visually de-emphasized (e.g., reduced opacity) but MUST not be hidden.
- Accessibility: day cell `aria-label` must include both holiday name and assigned staff (e.g., "2025-09-08. Holiday. Assigned to Alice.").

## Requirements

### Functional Requirements
- **HIDE-001**: The system MUST NOT remove or hide assignment pills on days marked as holidays.
- **HIDE-002**: The calendar rendering pipeline MUST support simultaneous holiday metadata and assignment metadata for the same date.
- **HIDE-003**: `aria-label` for a day cell MUST include holiday and assignment information when both are present.

### Visual & Interaction Requirements
- **HIDE-UI-001**: When both holiday and assignment exist, the `.holiday` class applies to the cell background and the `.in-cell-pill` remains present; the pill may use reduced opacity to indicate secondary prominence.
- **HIDE-UI-002**: Spanning oncall bars MUST continue to render across holiday cells without interruption.

## Files / Components Affected
- `src/components/CalendarGrid.tsx` — ensure holiday and assignment rendering coexist; update aria-label composition.
- `src/styles.css` — ensure `.holiday` does not hide `.in-cell-pill`; provide optional CSS token for reduced pill prominence.
- `src/lib/scheduler.ts` — no change required (holidays are already emitted as metadata) but confirm metadata is present in computed assignments.
- `src/components/CalendarGrid.compact.test.tsx` — add tests verifying holiday+assignment rendering in compact and full views.

## Notes / Clarifications
- [NEEDS CLARIFICATION]: Visual prominence strategy — prefer reduced opacity for the assignment pill or add an accent border to emphasize assignment over holiday? Default: reduced opacity.

## Review & Acceptance Checklist
- [ ] Holiday background visible on holiday days
- [ ] Assignment pills visible on holiday days (not hidden)
- [ ] `aria-label` includes both holiday and assignment info
- [ ] Unit/visual tests added to cover the above

