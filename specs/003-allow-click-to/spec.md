
# Feature Specification: Allow click on calendar cell and entry

**Feature Branch**: `003-allow-click-to`  
**Created**: 2025-09-23  
**Status**: Draft  
**Input**: "allow click to calender cell and entry"

## Summary

Enable single-click behavior for calendar cells and on-call entry pills so users can quickly open a focused editor (inspector) or edit dialog. Clicking empty cells should open the DayInspector to assign staff; clicking an existing assignment pill should open the EditAssignmentDialog (range editor) to modify dates, change staff, or remove the assignment.

## Execution Flow (main)

1. Click on a calendar cell with no assignment: open `DayInspector` (or inline picker) to assign a staff for that date.
2. Click on a calendar cell that contains an assignment pill: open `EditAssignmentDialog` pre-filled with the contiguous assignment range and staff.
3. User modifies or removes the assignment; upon Save/Remove the system persists per-day changes and updates the calendar UI (in-cell pills and spanning pills).

## User Scenarios & Testing

### Primary User Story
As a schedule editor, I want to click any calendar cell or pill to quickly assign, edit, or remove on-call entries without relying on context menus or keyboard-only flows.

### Acceptance Scenarios
1. **Given** an empty day, **When** I click the cell, **Then** the `DayInspector` opens and allows assigning a staff.
2. **Given** a day with an assignment pill, **When** I click the pill, **Then** the `EditAssignmentDialog` opens showing the correct start and end dates and assigned staff.
3. **Given** a multi-day assignment spanning a week-row, **When** I click any pill cell in that span, **Then** the dialog opens with the full contiguous range for editing.

### Edge Cases
- Clicking on a cell while a modal is open MUST not open multiple dialogs — clicks should be ignored or should move focus to the existing dialog.
- For multi-week ranges, clicking a pill should open the editor for the full assignment range (not only the week-row slice) [NEEDS CLARIFICATION: current implementation edits within-week only].

### Visual & Interaction
- Click targets for pills and cells MUST be at least 44x44 CSS pixels for touch accessibility when possible.
- Provide visible focus outlines for keyboard users; clicking via keyboard (Enter/Space) MUST behave identically to mouse click.

## Requirements

### Functional Requirements
- **FR-CLICK-001**: Single-click on an empty calendar cell MUST open `DayInspector` to allow assignment.
- **FR-CLICK-002**: Single-click on an assignment pill MUST open `EditAssignmentDialog` populated with the full assignment range and staff.
- **FR-CLICK-003**: Save and Remove actions from the dialogs MUST persist per-day changes and update UI immediately.

### Accessibility Requirements
- **FR-CLICK-A11Y-001**: Clickable elements MUST have accessible labels and expose their state via ARIA attributes.
- **FR-CLICK-A11Y-002**: Dialogs MUST trap focus and be dismissible via ESC.

## Files / Components to Update
- `src/components/CalendarGrid.tsx` — ensure `onClick` differentiates empty cells vs assigned pills and invokes appropriate callback props (`onDayClick` / `onEditEntry`).
- `src/components/DayInspector.tsx` — already present; ensure it opens on single-click of empty cells.
- `src/components/EditAssignmentDialog.tsx` — already added; ensure it opens on single-click of assigned pills and supports multi-week ranges.
- `src/lib/scheduler.ts` — ensure per-day updates are supported by the `handleEditAssignment` API.

## Tests & Acceptance Criteria
- Unit tests for `CalendarGrid` verifying that clicking on assigned vs empty cells calls correct callbacks.
- Integration tests that simulate click → open dialog → save/remove → verify DOM and persisted state.

## Execution Status
- [ ] Spec written and reviewed
- [ ] Implementation planned
- [ ] Tests defined

