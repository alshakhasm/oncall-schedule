# Feature Specification: Edit on-call entry by double-click

**Feature Branch**: `002-double-click-on`  
**Created**: 2025-09-23  
**Status**: Draft  
**Input**: "double click on calendar entry allow modification of start and end date . allow change of staff and removeal of entry"

## Summary

Allow users to quickly edit an existing on-call assignment by double-clicking a calendar entry (pill). The edit modal (or inline editor) allows changing the start and end dates of the assignment, changing the assigned staff member, and removing the assignment. The UI must support drag-and-drop and keyboard-accessible alternatives; the edit workflow should update the underlying per-day assignment data (the visual spanning pill is a rendering convenience only).

## Execution Flow (main)

1. User double-clicks a calendar pill or focused calendar day with an assignment.
2. UI opens an Edit dialog (modal or inline) pre-filled with:
	 - `Start Date` (date picker)
	 - `End Date` (date picker)
	 - `Assigned Staff` (select list or autocomplete)
	 - `Remove` action (button)
3. User modifies fields and confirms `Save` or cancels.
4. On Save, the system validates date range (start <= end) and staff selection.
5. If valid, the system updates per-day assignments for every date in the range and persists changes.
6. UI re-renders: in-cell pills and spanning pills update to reflect the new ranges.
7. If `Remove` selected, the system deletes the per-day assignment(s) for the selected range and updates UI.

## User Scenarios & Testing

### Primary User Story
As a schedule manager, when I double-click an on-call pill I want to quickly change its date range or assigned staff so I can correct or update assignments without re-creating them.

### Acceptance Scenarios
1. **Given** an existing multi-day assignment, **When** I double-click a pill and change the `End Date` to an earlier date and click `Save`, **Then** the assignment should be shortened and the UI should show the updated spanning pill and suppressed in-cell pills where appropriate.
2. **Given** an existing single-day assignment, **When** I double-click and change `Assigned Staff` and click `Save`, **Then** the day should now show the new staff's pill and color.
3. **Given** an existing assignment, **When** I double-click and click `Remove`, **Then** all per-day assignments for that range are removed and UI updates accordingly.

### Edge Cases
- If user sets `Start Date` after `End Date`: the Save action MUST be disabled and a clear validation message shown.
- If user edits an assignment to overlap with another assignment for the same staff or restricted day (holiday), the system MUST show a warning and require confirmation or prevent the change depending on policy [NEEDS CLARIFICATION: overlap policy].
- For multi-week ranges that span multiple week-rows, the UI MUST update spanning pills per-row as defined in the Grid UI spec.

### Visual & Interaction
- Double-click opens a modal centered in the viewport or an inline editor anchored to the pill if space permits.
- The dialog MUST be keyboard-accessible: focus management, ESC to cancel, Enter to Save.
- Date pickers MUST allow typing and calendar selection; keyboard navigation inside date picker MUST be supported.
- The `Assigned Staff` field MUST show the staff color and initials in the selection list.

## Requirements

### Functional Requirements
- **FR-EDIT-001**: Double-clicking a calendar entry MUST open an edit dialog pre-filled with start date, end date, and assigned staff.
- **FR-EDIT-002**: The dialog MUST allow changing the start and end dates within the same calendar (date range picking) and selecting a different staff member.
- **FR-EDIT-003**: The system MUST validate the date range and prevent invalid saves.
- **FR-EDIT-004**: The system MUST persist per-day changes so they survive reload.
- **FR-EDIT-005**: The system MUST support removing an assignment via the dialog.

### Visual & Interaction Requirements
- **FR-EDIT-UI-001**: The edit dialog MUST use the same color and initials for staff as the calendar cells.
- **FR-EDIT-UI-002**: Save/cancel buttons MUST be keyboard reachable, with clear focus outlines.
- **FR-EDIT-UI-003**: Success and error messages MUST be screen-reader accessible.

### Accessibility Requirements
- **FR-EDIT-A11Y-001**: Dialog MUST trap focus while open and return focus to a sensible element when closed.
- **FR-EDIT-A11Y-002**: Dialog controls MUST have accessible labels (aria-label/aria-labelledby).
- **FR-EDIT-A11Y-003**: Provide keyboard shortcut (e.g., Enter while focused on pill) to open Edit as alternative to double-click.

## Key Entities
- **Assignment**: per-day record with date, staffId, optional notes.
- **EditRequest**: object with startDate, endDate, staffId, and action (save/remove).

## Tests & Acceptance Criteria (automated)
- Unit tests that verify:
	- Editing range shortens or extends per-day assignments correctly.
	- Changing staff updates color and initials in rendered pills.
	- Remove action deletes per-day assignments.
	- Validation prevents start > end.
- Integration test: simulate double-click → open dialog → save changes → confirm DOM updates and persisted state.

## Files / Components to Update
- `src/components/CalendarGrid.tsx` — add double-click handler, focus/keyboard hook, and logic to open the Edit dialog with the selected assignment context.
- `src/components/DayInspector.tsx` or new `EditAssignmentDialog.tsx` — implement the edit dialog UI and validation logic.
- `src/styles.css` — dialog styles and focus outlines.
- `src/lib/scheduler.ts` — update APIs for batch per-day updates (apply range edits and removals atomically).
- `src/components/*/*.test.tsx` — add unit/integration tests described above.

## Review & Acceptance Checklist
- [ ] Double-click opens dialog and dialog is pre-filled correctly.
- [ ] Save applies changes and UI updates correctly across in-cell and spanning pills.
- [ ] Remove deletes assignments and UI updates.
- [ ] Keyboard and screen-reader accessibility checks pass.
- [ ] Tests for validation, save, and remove pass.

## Execution Status
- [ ] Spec written and reviewed
- [ ] Implementation planned
- [ ] Tests defined

*** End of spec

