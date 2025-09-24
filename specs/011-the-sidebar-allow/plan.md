# Implementation Plan: Sidebar Staff Management

**Branch**: `011-the-sidebar-allow` | **Date**: 2025-09-24 | **Spec**: `specs/011-the-sidebar-allow/spec.md`
**Input**: Feature specification from `/specs/011-the-sidebar-allow/spec.md`

## Summary
Enable full staff roster management from the sidebar: add staff (name + color), edit color, and remove staff. Persist changes and reflect immediately in calendar visuals; removing a staff explicitly unassigns their current visible dates.

## Technical Context
- Language/Version: TypeScript + React 18
- Primary Dependencies: Vite, Tailwind, Testing Library, Vitest
- Storage: localStorage (`oncall-scheduler-v1`)
- Testing: Vitest + @testing-library/react (UI), existing unit tests for scheduler
- Project Type: Single-page web app (frontend only)
- Constraints: Desktop-first, accessible controls, keep changes minimal/surgical

## Plan
1. Update SidePanel UI
   - Add fields for Name and Color, Add button.
   - For each staff: display name, id, color input, Remove button, draggable color swatch.
   - Accessibility: label color inputs and Remove buttons; keyboard focus order.

2. Wire App state and persistence
   - Ensure `saveState` includes `staff` updates and auto persists.
   - Implement `handleAddStaff`, `handleUpdateStaff`, `handleRemoveStaff` (explicitly unassign visible dates for removed staff).

3. Calendar reflection
   - Verify `CalendarGrid` reads updated names/colors from `staff` prop (already present).
   - Ensure days for removed staff become unassigned visually (explicit empty manual entries set on removal in visible range).

4. Drag-and-drop continuity
   - Keep staff row swatch `draggable` with `dataTransfer` id; CalendarGrid already consumes drop.
   - Verify keyboard fallback via DayInspector remains available.

5. Tests
   - UI: render SidePanel, add staff, change color, remove staff; assert roster updates.
   - Integration: simulate removal while assignments exist and check days unassigned.
   - Persistence: mock localStorage to ensure roster survives reload.

6. Docs
   - Briefly update README or spec notes if needed on staff ID behavior and duplication policy.

## Acceptance Checks
- Add/edit/remove flows operate via sidebar controls with proper labels.
- Removing staff unassigns their visible dates without errors.
- Calendar pills reflect color/name edits.
- State persists across reload via localStorage.

## Risks & Mitigations
- Duplicate names/IDs: use `name.slice(0,3)` default id per current code; document ambiguity.
- Large unassign on removal: restrict to visible range (already applied); avoid performance issues.

## Out of Scope
- Server sync, multi-user conflicts, audit history.

## Next Actions
- Implement and run tests, then open PR to main.
