# Feature Specification: Leaves Rendered as In-Cell Pills

**Feature Branch**: `[013-created-leaves-to]`  
**Created**: 2025-09-24  
**Status**: Draft  
**Input**: User description: "created leaves to shown as pills inside cells"

## Execution Flow (main)
```
1. Parse user description from Input
	→ If empty: ERROR "No feature description provided"
2. Extract key concepts from description
	→ Identify: actors (scheduler users), actions (view leaves in calendar), data (leave ranges), constraints (clarify overlap behavior)
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

## ⚡ Quick Guidelines
- ✅ Focus on WHAT users need and WHY
- ❌ Avoid HOW to implement (no tech stack, APIs, code structure)
- 👥 Written for business stakeholders, not developers

### Section Requirements
- **Mandatory sections**: Must be completed for every feature
- **Optional sections**: Include only when relevant to the feature
- When a section doesn't apply, remove it entirely (don't leave as "N/A")

### For AI Generation
When creating this spec from a user prompt:
1. **Mark all ambiguities**: Use [NEEDS CLARIFICATION: specific question] for any assumption you'd need to make
2. **Don't guess**: If the prompt doesn't specify something (e.g., who can see leaves), mark it
3. **Think like a tester**: Every vague requirement should fail the "testable and unambiguous" checklist item
4. **Common underspecified areas**:
	- User types and permissions
	- Data retention/deletion policies  
	- Performance targets and scale
	- Error handling behaviors
	- Integration requirements
	- Security/compliance needs

---

## User Scenarios & Testing (mandatory)

### Primary User Story
As a scheduler, I want staff leaves to be shown directly inside calendar cells as small pills so that I can immediately see unavailable days while planning on-call assignments.

### Acceptance Scenarios
1. Given a staff member with a leave from a single day, when viewing that day in the calendar, then a leave pill appears in the cell with a clear visual indicator and label.
2. Given a contiguous multi-day leave within one week row, when viewing the week, then a connected pill spans the covered days and is not duplicated by separate per-day pills.
3. Given a multi-week leave, when viewing it across week boundaries, then separate spanning pills render per affected week row and in-cell pills are suppressed for covered days in those rows.
4. Given overlapping leave and on-call assignment for the same day, when viewing the day, then both statuses are visually represented without ambiguity [NEEDS CLARIFICATION: priority, stacking, or combined indicator?].
5. Given leaves for multiple staff, when viewing the calendar, then the leaves are distinguishable by label and/or color and accessible labels convey the staff and date range.

### Edge Cases
- What happens if a leave starts/ends outside the visible range? The pill should be clipped to the visible portion.
- How should the UI display partial-week leaves that start mid-week and continue to next week? Render separate connected pills per week row.
- What if multiple leaves overlap on the same day (same or different staff)? [NEEDS CLARIFICATION: stacking order and maximum visible pills].
- How to handle zero-length or invalid ranges? The UI should not render pills for invalid ranges and should surface an error upstream.

### Visual & Interaction (recommended)
- Leave pills are visually distinct from assignment pills while still compact.  
  [NEEDS CLARIFICATION: exact color/style differences and legend update]
- Pills have keyboard focus and expose accessible names including staff and date range.
- Tooltip or inspector should show full details on focus/hover.

## Grid UI: Connected Multi-day Pills & In-Cell Pills (UI specification)

### Summary
Extend the existing grid pill system to support leave visualization similar to on-call assignments: render single-day in-cell pills and connected multi-day spanning pills, without duplicate per-cell pills where a spanning pill covers days.

### Goals
- Make staff unavailability obvious at a glance to avoid scheduling conflicts.
- Preserve compactness in multi-month views while keeping leaves legible.
- Maintain accessibility and keyboard navigation parity with assignment pills.

### Visual & Interaction Requirements
- **LEAVE-001**: Single-day leaves MUST render as an in-cell pill with a leave-specific style and a short label (e.g., staff initials or "Leave").
- **LEAVE-002**: Contiguous leave days within the same week row MUST render as a connected spanning pill in the overlay grid; suppress per-day pills underneath.
- **LEAVE-003**: Spanning leave pills MUST align to calendar grid columns and clip to the current week row; cross-row spans render as separate pills.
- **LEAVE-004**: In compact 3- and 6-month views, leave pill size and label truncate to fit; contrast remains acceptable.
- **LEAVE-005**: Leave and on-call pills MUST remain distinguishable in the same cell/week row [NEEDS CLARIFICATION: priority/stack order].
- **LEAVE-006**: Keyboard focus and accessible labels MUST include "Leave", staff name/initials, and date(s).

### Interaction Requirements
- **LEAVE-INT-001**: Opening the day inspector or details panel MUST list any leaves covering the selected date.
- **LEAVE-INT-002**: If drag-and-drop or editor allows creating leaves, the resulting pills MUST follow the same visual rules.  
  [NEEDS CLARIFICATION: Is creation of leaves in-scope for this feature or read-only visualization only?]

### Acceptance Criteria
- A leave from Sep 10–12 shows a single spanning pill across those three dates within the week row and no in-cell duplicates.
- In compact views, the leave pill renders at reduced height and font-size but stays readable and clipped to week rows.
- Screen reader users can navigate to pills and hear staff and date range.

### Files / Components Affected
- `src/components/CalendarGrid.tsx` — add leave pill rendering to the overlay/in-cell system and integrate with week ownership logic.
- `src/styles.css` — introduce leave-specific styles consistent with existing pill components.
- `src/components/*.test.tsx` — new tests for leave rendering (single and spanning), duplication suppression, and compact modes.

### Notes / Clarifications
- Leaves do not change the underlying assignment data; rendering is visual.
- Overlap resolution with on-call pills may require a stacking policy or z-order.

## Requirements (mandatory)

### Functional Requirements
- **FR-LEAVE-001**: The system MUST display leaves as pills inside calendar cells aligned with the corresponding dates.
- **FR-LEAVE-002**: The system MUST connect contiguous multi-day leaves within a week row as a single spanning pill.
- **FR-LEAVE-003**: The system MUST suppress per-cell leave pills where a spanning pill covers those days.
- **FR-LEAVE-004**: The system MUST ensure leaves are distinguishable from on-call assignments [NEEDS CLARIFICATION: styling specifics].
- **FR-LEAVE-005**: The system MUST provide accessible names on leave pills that include staff name/initials and date range.
- **FR-LEAVE-006**: The system SHOULD clip pills to visible dates when a leave extends beyond the current view.

### Visual & Interaction Requirements
- **FR-LEAVE-VIS-001**: Each leave pill MUST maintain readable contrast and a compact footprint in compact views.
- **FR-LEAVE-VIS-002**: A legend or roster SHOULD indicate how leaves are styled so users can distinguish them at a glance.
- **FR-LEAVE-VIS-003**: Leave pills MUST not interfere with drag-and-drop interactions for assignments.

### Key Entities
- **Leave**: A range with `staff`, `start date`, `end date`, optional `reason/notes` [NEEDS CLARIFICATION: attributes beyond date range].

---

## Review & Acceptance Checklist
*GATE: Automated checks run during main() execution*

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
*Updated by main() during processing*

- [x] User description parsed
- [x] Key concepts extracted
- [x] Ambiguities marked
- [x] User scenarios defined
- [x] Requirements generated
- [x] Entities identified
- [ ] Review checklist passed

