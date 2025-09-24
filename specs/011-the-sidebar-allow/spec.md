# Feature Specification: Sidebar Staff Management

**Feature Branch**: `011-the-sidebar-allow`  
**Created**: 2025-09-24  
**Status**: Draft  
**Input**: User description: "the sidebar allow adding staff. editing information of staff or removal of staff."

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

---

## User Scenarios & Testing (mandatory)

### Primary User Story
As a scheduler, I can manage the team roster directly from the sidebar: add new staff members, edit existing staff details (name and color), and remove staff who no longer participate, so that the calendar views always reflect the current team.

### Acceptance Scenarios
1. Given the sidebar is visible, When I enter a name (and optionally choose a color) and click Add, Then a new staff member appears in the roster with that color and is available for assignments.
2. Given a staff member is listed, When I change their color from the color input, Then their color swatch updates in the roster and future calendar pills use the new color.
3. Given a staff member is listed, When I choose Remove, Then the staff member disappears from the roster and they cannot be assigned to future days.
4. Given the calendar currently has assignments for a staff I remove, When the removal completes, Then those dates are explicitly unassigned (not re-assigned silently) and are visible as unassigned in the calendar.
5. Given I reload the app, When I return to the sidebar, Then the staff roster changes (adds/edits/removals) persist.

### Edge Cases
- Adding a staff member without a name should be prevented with a clear message.  
- Duplicate names: [NEEDS CLARIFICATION: Should duplicate names be allowed or automatically de-duplicated (e.g., unique IDs only)?]
- Removing the last remaining staff member should be allowed, but the calendar will show unassigned days.  
- Editing a color should not change historical exports retroactively; it only affects visuals going forward.  
- Removing a staff member who still has visible assignments should explicitly unassign those dates rather than leaving stale references.

### Visual & Interaction (optional but recommended)
- Each staff row shows a color swatch (draggable handle for calendar DnD), staff name, optional ID, a color picker, and a Remove action.  
- The Add section includes fields for Name and Color with an Add button.  
- The roster should be keyboard accessible: focusable controls, labels for color inputs, and clear button labels (e.g., "Remove Alice").
- Dragging a staff chip from the sidebar to a day cell assigns that staff to the day; a keyboard alternative exists via the day inspector.

## Grid UI: Connected Multi-day Pills & In-Cell Pills (UI specification)

This section is not the primary focus of this feature, but roster changes affect visuals:

### Goals
- Staff color and name edits immediately reflect in calendar pills.
- Removing a staff unassigns their dates to avoid misleading visuals.

### Visual & Interaction Requirements
- **GRID-001**: Day pills and spanning bars should use the updated staff color after an edit.  
- **GRID-002**: When a staff is removed, any pills with that staff should disappear, and days become unassigned.  
- **GRID-003**: Accessible labels should reflect updated names.

### Acceptance Criteria
- After editing a staff color, any newly rendered pill uses the new color.  
- After removing a staff, days they covered show as unassigned without errors.

### Files / Components Affected
- `src/components/SidePanel.tsx` — sidebar roster UI and interactions.  
- `src/App.tsx` — state management, persistence, and propagation to calendar.  
- `src/components/CalendarGrid.tsx` — reflects updated colors/names; handles removal effects visually.

---

## Requirements (mandatory)

### Functional Requirements
- **FR-STAFF-001**: Users MUST be able to add a staff member with a name and optional color.  
- **FR-STAFF-002**: Users MUST be able to edit a staff member’s display color from the sidebar.  
- **FR-STAFF-003**: Users MUST be able to remove a staff member from the roster.  
- **FR-STAFF-004**: Removing a staff MUST explicitly unassign all dates currently assigned to them in the visible range without silently reassigning.  
- **FR-STAFF-005**: The staff roster MUST persist across reloads.

### Visual & Interaction Requirements
- **FR-UI-001**: Each staff in the roster MUST show a color swatch, name, ID (or initials), color input, and remove button with accessible labels.  
- **FR-UI-002**: The Add section MUST include a name input, color input, and add button; the Add button is disabled until a non-empty name is provided.  
- **FR-UI-003**: Drag-and-drop from the roster to the calendar MUST remain available; keyboard alternatives MUST remain available.

### Key Entities
- **Staff**: { id, name, color? } — unique identifier strategy [NEEDS CLARIFICATION: auto-generate vs. derive from name]; color optional with default palette.

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
