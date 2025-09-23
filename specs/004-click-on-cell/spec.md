
# Feature Specification: Click-to-create and click-to-edit calendar entries

**Feature Branch**: `004-click-on-cell`  
**Created**: 2025-09-24  
**Status**: Draft  
**Input**: "click on cell allow new entry . click on pill allow modification of pill"

## Summary

This feature enables direct interaction with the calendar grid via single-click: clicking an empty cell opens a creation inspector (to create a new assignment for that day), and clicking an existing on-call pill opens an edit dialog to modify the assignment's start/end dates, staff member, or to remove the assignment. The behavior must be accessible, keyboard-friendly, and consistent with existing drag-and-drop assignment flows.

## Execution Flow (main)

1. User single-clicks an empty calendar cell.
2. The UI opens the `DayInspector` (or inline create form) pre-focused on the date and showing staff selection and quick actions.
3. User selects a staff and clicks `Assign`; the system persists a per-day assignment and updates the calendar rendering.
4. User single-clicks an existing pill (in-cell or spanning). The UI opens the `EditAssignmentDialog` showing the full assignment range (start/end), current staff, and actions `Save` / `Remove`.
5. User updates dates or staff and clicks `Save` — the system validates the range and persists per-day updates; UI re-renders accordingly.
6. User clicks `Remove` — the system removes per-day assignments for the selected range and updates UI.

## User Scenarios & Testing

### Primary User Story
As someone maintaining the schedule, I can click any day to add an assignment or click an existing pill to edit it quickly without using menus or drag-and-drop.

### Acceptance Scenarios
1. **Given** an empty calendar cell, **When** the user clicks it, **Then** the DayInspector opens and allows creating a new assignment for that date.
2. **Given** a single-day assignment, **When** the user clicks the pill, **Then** an edit dialog opens allowing the user to change the staff or remove the assignment.
3. **Given** a multi-day assignment, **When** the user clicks any day within the span, **Then** the edit dialog opens with the full assignment range pre-selected.

### Edge Cases
- If the user clicks rapidly on multiple cells, only the last click within a short debounce window should open a dialog to avoid multiple overlays.
- If clicking a pill that spans multiple weeks, the dialog MUST allow editing the full assignment (not just the week-row segment) [NEEDS CLARIFICATION: current implementation edits within-week only].

### Visual & Interaction
- Click targets MUST remain discoverable and large enough for touch input when possible.
- Dialogs MUST be keyboard-trappable and dismissible by ESC.
- The creation inspector should expose an `(unassign)` option and show staff initials/colors in the selection.

## Requirements

### Functional Requirements
- **FR-CREATE-001**: Single-click on an empty cell MUST open the creation inspector pre-filled with the clicked date.
- **FR-EDIT-001**: Single-click on an existing assignment pill MUST open an edit dialog showing the full assignment range and staff.
- **FR-EDIT-002**: Save action MUST persist per-day changes for the selected date range.
- **FR-EDIT-003**: Remove action MUST delete per-day assignments and update the UI.

### Accessibility Requirements
- **FR-A11Y-001**: Dialogs MUST trap focus and return focus to the originating cell when closed.
- **FR-A11Y-002**: All interactive elements MUST have accessible labels and keyboard equivalents.

## Files / Components to Update
- `src/components/CalendarGrid.tsx` — ensure click handlers differentiate empty vs assigned cells and forward appropriate callbacks.
- `src/components/DayInspector.tsx` — use as the creation inspector; ensure it accepts a date param and exposes `Assign` action.
- `src/components/EditAssignmentDialog.tsx` — use as the edit dialog for clicks on pills; extend to support multi-week ranges as needed.
- `src/lib/scheduler.ts` — ensure APIs exist to apply per-day range updates and removals atomically.

## Tests & Acceptance Criteria
- Unit tests for `CalendarGrid` to ensure correct callbacks fired on cell vs pill click.
- Integration tests: simulate click → open inspector/edit dialog → save/remove → verify DOM and persisted state.

## Execution Status
- [ ] Spec written and reviewed
- [ ] Implementation planned
- [ ] Tests defined

