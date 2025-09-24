# Feature Specification: [FEATURE NAME]

**Feature Branch**: `[###-feature-name]`  
**Created**: [DATE]  
**Status**: Draft  
**Input**: User description: "$ARGUMENTS"

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
2. **Don't guess**: If the prompt doesn't specify something (e.g., "login system" without auth method), mark it
3. **Think like a tester**: Every vague requirement should fail the "testable and unambiguous" checklist item
4. **Common underspecified areas**:
   - User types and permissions
   - Data retention/deletion policies  
   - Performance targets and scale
   - Error handling behaviors
   - Integration requirements
   - Security/compliance needs

---

## User Scenarios & Testing *(mandatory)*

### Primary User Story
[Describe the main user journey in plain language]

### Acceptance Scenarios
1. **Given** [initial state], **When** [action], **Then** [expected outcome]
2. **Given** [initial state], **When** [action], **Then** [expected outcome]

### Edge Cases
- What happens when [boundary condition]?
- How does system handle [error scenario]?

### Visual & Interaction (optional but recommended)
- Describe how the UI should communicate assignments and how users interact with them.
- Include keyboard-accessible alternatives for mouse/touch interactions.

Examples:
- Calendar cells MUST be visually highlighted with the assigned staff's color.
- A legend or staff list MUST show each staff member with their assigned color swatch.
- Users MUST be able to reassign a day by dragging a staff entry onto a calendar cell.
- Drag-and-drop MUST have a keyboard-accessible alternative (e.g., focus a day → open picker → choose staff).
- Touch devices MUST support tap-to-pick and drag (or press-and-hold) behaviors.

## Grid UI: Connected Multi-day Pills & In-Cell Pills (UI specification)

### Summary
This feature describes how on-call assignments are displayed inside the calendar grid. It covers single-day in-cell pills, connected multi-day spanning pills (visual connectors), compact 3-month rendering behavior, interaction affordances (drag/drop + keyboard), and acceptance criteria.

### Goals
- Present assignments clearly inside each calendar cell while avoiding duplicated visual elements for contiguous multi-day assignments.
- Provide a compact representation when multiple months are shown side-by-side.
- Maintain keyboard and accessibility support for assignment operations.

### Visual & Interaction Requirements
- **GRID-001**: Single-day assignments MUST render as an in-cell pill showing the staff short name or initials and using the staff's color (class: `.in-cell-pill`).
- **GRID-002**: Contiguous same-staff assignments that span adjacent days within the same week row MUST render as a single spanning pill (connected pill) that visually connects the cells. The spanning pill MUST be rendered in an overlay grid positioned above the week-row (class: `.overlay-grid` / `.oncall-bar`).
- **GRID-003**: For days covered by a spanning pill, the per-cell in-cell pill MUST be suppressed to avoid duplication.
- **GRID-004**: Spanning pills MUST align to calendar grid columns; they MUST use CSS grid column spans equivalent to the contiguous range.
- **GRID-005**: In compact (3-month side-by-side) mode, pill height and font-size MUST scale down (approx. 75% of default) while preserving legibility; long text MUST truncate with ellipsis.
- **GRID-006**: Spanning pills MUST be clipped to the week-row bounds and not overflow adjacent rows visually.
- **GRID-007**: Spanning pills and in-cell pills MUST provide sufficient color contrast for text and a focus outline when keyboard-focused.

### Interaction Requirements
- **GRID-INT-001**: Users MUST be able to drag a staff entry onto a calendar cell and drop to assign a day; the UI MUST render the assignment as an in-cell pill or update an existing spanning pill accordingly.
- **GRID-INT-002**: When dropping to create or extend a contiguous range, the spanning pill MUST update (merge ranges) rather than creating separate pills.
- **GRID-INT-003**: Keyboard fallback: Users MUST be able to focus a calendar cell, open a quick-picker, and choose a staff member. The result MUST match the visual behavior of a drag-and-drop assignment.
- **GRID-INT-004**: Spanning pills MUST be accessible by keyboard (tab focus) and expose the date range and staff name in an accessible label.

### Acceptance Criteria
- When creating two adjacent day assignments for the same staff, a single spanning pill is rendered across the two days and no in-cell pill is visible on those days.
- In compact 3-month view, pills render smaller, remain legible, and spanning pills continue to connect across adjacent columns within the same week.
- Keyboard navigation: focusing a day and assigning a staff results in the same DOM structure and visuals as a drag-and-drop assignment.
- Unit tests exist that verify suppression of per-day pill when a spanning pill covers the day and that the overlay grid uses correct `grid-column` spans.

### Files / Components Affected
- `src/components/CalendarGrid.tsx` — primary rendering and interaction logic for cells, in-cell pills, spanning pill detection, and DnD/keyboard handlers.
- `src/styles.css` — styles for `.in-cell-pill`, `.overlay-grid`, `.oncall-bar`, `.oncall-label`, `.day-number`, and compact-mode overrides.
- `src/components/CalendarGrid.compact.test.tsx` — tests covering compact mode rendering and connected-pills behavior.

### Notes / Clarifications
- The spanning pill rendering is limited to contiguous days within the same week-row; multi-week spanning (across rows) SHOULD be handled by rendering separate spanning pills per affected row rather than a single cross-row element.
- If server-side export formats require explicit per-day records, the UI rendering decisions MUST NOT change the persisted model — the overlay is visual-only and the underlying assignment remains per-day.


## Requirements *(mandatory)*

### Functional Requirements
- **FR-001**: System MUST [specific capability, e.g., "allow users to create accounts"]
- **FR-002**: System MUST [specific capability, e.g., "validate email addresses"]  
- **FR-003**: Users MUST be able to [key interaction, e.g., "reset their password"]
- **FR-004**: System MUST [data requirement, e.g., "persist user preferences"]
- **FR-005**: System MUST [behavior, e.g., "log all security events"]

### Visual & Interaction Requirements
- **FR-COLOR-001**: Each staff member MUST have an associated color that is used to highlight calendar cells where they are assigned.
- **FR-COLOR-002**: The system MUST ensure colors are distinct enough between staff to be visually distinguishable; provide a default palette and allow custom selection.
- **FR-COLOR-003**: Calendar cells MUST display a visible color indicator (background, strip, or dot) and the staff's short name or initials for quick recognition.
- **FR-COLOR-004**: A legend or staff roster view MUST display each staff with their color swatch and full name.
- **FR-COLOR-005**: Color choices MUST meet minimum contrast/accessibility guidelines for labels and indicators.

- **FR-DND-001**: Users MUST be able to assign or reassign staff for a calendar day using drag-and-drop from the staff roster onto a calendar cell.
- **FR-DND-002**: Drag-and-drop interactions MUST provide visual affordances during dragging (ghost, drop target highlight) and clear success feedback after drop.
- **FR-DND-003**: There MUST be a keyboard-accessible fallback that allows selecting a calendar day and choosing a staff member from a list (for users who cannot use drag-and-drop).
- **FR-DND-004**: Drag-and-drop actions MUST be persisted in the same storage as manual assignments so they survive reload.
- **FR-DND-005**: The system MUST prevent invalid drops (e.g., dropping onto a holiday that cannot be assigned) and surface an explanatory message.

*Note:* These are UI/interaction level requirements — the spec should avoid dictating specific libraries, but must include the expected behaviors and accessibility constraints.

*Example of marking unclear requirements:*
- **FR-006**: System MUST authenticate users via [NEEDS CLARIFICATION: auth method not specified - email/password, SSO, OAuth?]
- **FR-007**: System MUST retain user data for [NEEDS CLARIFICATION: retention period not specified]

### Key Entities *(include if feature involves data)*
- **[Entity 1]**: [What it represents, key attributes without implementation]
- **[Entity 2]**: [What it represents, relationships to other entities]

---

## Review & Acceptance Checklist
*GATE: Automated checks run during main() execution*

### Content Quality
- [ ] No implementation details (languages, frameworks, APIs)
- [ ] Focused on user value and business needs
- [ ] Written for non-technical stakeholders
- [ ] All mandatory sections completed

### Requirement Completeness
- [ ] No [NEEDS CLARIFICATION] markers remain
- [ ] Requirements are testable and unambiguous  
- [ ] Success criteria are measurable
- [ ] Scope is clearly bounded
- [ ] Dependencies and assumptions identified

### Visual & Interaction Checklist
- [ ] Each staff has a color in the spec or defaults are provided
- [ ] Calendar cells show color highlights and initials
- [ ] Drag-and-drop flows documented with keyboard fallback
- [ ] Accessibility/contrast requirements stated

---

## Execution Status
*Updated by main() during processing*

- [ ] User description parsed
- [ ] Key concepts extracted
- [ ] Ambiguities marked
- [ ] User scenarios defined
- [ ] Requirements generated
- [ ] Entities identified
- [ ] Review checklist passed

---
