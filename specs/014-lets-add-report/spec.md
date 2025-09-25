# Feature Specification: Year-To-Date On-Call Report Tab

**Feature Branch**: `[014-lets-add-report]`  
**Created**: 2025-09-25  
**Status**: Draft  
**Input**: User description: "lets add report tab in top bar calculate each staff oncall since beginngin of year . oncall per work days . work day are all days including weekend . leaves and holiday are not included in working days"

## Execution Flow (main)
```
1. Parse user description from Input
2. Extract key concepts: report tab, top bar navigation, per-staff on-call totals, since beginning of year, working days exclude holidays & leaves, weekends treated as working days.
3. Identify ambiguities → mark with [NEEDS CLARIFICATION]
4. Define user scenarios & acceptance tests
5. Generate functional + visual requirements (testable)
6. Identify entities (Staff, Assignment, Holiday, Leave, Report Row)
7. Run review checklist
8. Return SUCCESS (ready for planning)
```

---

## ⚡ Quick Guidelines
Focused on WHAT the reporting tab provides (fairness & visibility of coverage) and WHY (balance workload, audit distribution). Avoids implementation details.

---

## User Scenarios & Testing (mandatory)

### Primary User Story
As a scheduler, I want a “Report” tab accessible from the top bar that shows each staff member’s year‑to‑date on‑call coverage expressed in days and percentage of total working days (excluding holidays and their own approved leave days) so I can assess workload balance.

### Acceptance Scenarios
1. Given today is partway through the year and the Report tab is opened, When the user views the table, Then each active staff member appears with: total on‑call days YTD, total working days considered YTD, and percentage (on‑call days ÷ working days × 100) rounded to one decimal place.
2. Given holidays exist, When calculating working days, Then holiday dates are excluded from the working-day denominator for all staff.
3. Given a staff member has approved leave spanning several days, When computing their working-day denominator, Then those leave dates are excluded only for that staff member.
4. Given a day has both an on‑call assignment and is a holiday, When computing stats, Then that day does NOT count as a working day nor an on‑call day (excluded entirely) [NEEDS CLARIFICATION: confirm exclusion of on‑call credit on holidays].
5. Given multiple staff have no assignments yet, When viewing Report, Then they show 0 on‑call days and 0% but still appear.
6. Given the year changes (cross-year navigation), When the user is in a different year context (e.g., viewing future months) and opens Report, Then the statistics reflect that target year’s YTD up to either today or the last day of past months viewed [NEEDS CLARIFICATION: reference date for partial years].

### Edge Cases
- Year start before first stored assignment: Report still shows 0 for early period.
- Leap year: February 29 included if not holiday and not leave.
- All days are holidays (extreme test): denominators become 0 → show 0 on‑call and 0% (avoid division by zero).
- Staff removed mid-year: [NEEDS CLARIFICATION: show historical or hide?].
- Leave entirely overlapping an assignment: assignment days on leave still count as on‑call? [NEEDS CLARIFICATION].

### Visual & Interaction (recommended)
- Table layout with columns: Staff, On‑Call Days, Working Days, % Share, Sparkline (optional) [NEEDS CLARIFICATION: include sparkline?].
- Sortable by % Share and On‑Call Days (ascending/descending).
- Highlight staff above or below configurable thresholds (e.g., > +10% or < −10% of equal share) [NEEDS CLARIFICATION: thresholds].
- Export button to download the report as CSV [NEEDS CLARIFICATION: scope of export].
- Accessible table semantics (caption, th scope, aria-sort attributes).

## Grid UI Section (Not Applicable to this feature)
Removed — grid pill rendering spec not directly relevant to report tab.

## Requirements (mandatory)

### Functional Requirements
- **FR-REP-001**: System MUST provide a Report tab accessible via the top bar navigation.
- **FR-REP-002**: Report MUST list every current staff member with year‑to‑date on‑call statistics.
- **FR-REP-003**: The on‑call day count MUST count each calendar day where the staff is assigned (manual or automatic), excluding holidays (for everyone) and that staff’s own leave days [NEEDS CLARIFICATION: exclude on-call if staff is on leave?].
- **FR-REP-004**: Working days denominator MUST be the count of all calendar days from Jan 1 (inclusive) up to the report “as-of” date, excluding global holidays and that staff’s leave dates.
- **FR-REP-005**: Weekends MUST be treated as working days unless they are holidays or the staff is on leave.
- **FR-REP-006**: Percentage MUST be computed as (On‑Call Days ÷ Working Days) × 100, rounded to one decimal (e.g., 12.34% → 12.3%).
- **FR-REP-007**: Where Working Days = 0, percentage MUST display 0% and avoid division errors.
- **FR-REP-008**: Report MUST update automatically when assignments, holidays, leaves, or staff lists change.
- **FR-REP-009**: Report MUST visually indicate recency (e.g., an as‑of date label) [NEEDS CLARIFICATION: exact phrasing].
- **FR-REP-010**: Report MUST include staff with zero on‑call days.
- **FR-REP-011**: Sorting by On‑Call Days and Percentage MUST be available; default sort Staff ascending [NEEDS CLARIFICATION: default sort preference].
- **FR-REP-012**: The system SHOULD provide an export (CSV) of the report table [NEEDS CLARIFICATION: included columns].
- **FR-REP-013**: The system SHOULD indicate fairness by displaying deviation from equal share ((Staff % − (100 / Staff Count))) [NEEDS CLARIFICATION: show absolute or signed].

### Visual & Interaction Requirements
- **FR-REP-VIS-001**: Report tab control MUST be visually consistent with existing view/navigation tabs.
- **FR-REP-VIS-002**: Table MUST be responsive; columns stack or scroll horizontally on narrow screens [NEEDS CLARIFICATION: stacking vs scroll].
- **FR-REP-VIS-003**: Percentage cells MAY include a simple bar/heat shading to communicate relative share [NEEDS CLARIFICATION: include?].
- **FR-REP-VIS-004**: Accessibility: table headers use semantic th; focus order preserves logical navigation; sort buttons have aria-sort state.
- **FR-REP-VIS-005**: Color usage MUST respect contrast ratios; non-color fallback (icon or symbol) for emphasis markers.

### Key Entities
- **Report Row**: Derived entity containing staffId, staffName, onCallDays, workingDays, percentShare, deviationFromEqualShare.
- **As-Of Context**: Date boundary used for counting (default today) [NEEDS CLARIFICATION: override by user or calendar view?].

---

## Review & Acceptance Checklist

### Content Quality
- [x] No implementation details (languages, frameworks, APIs)
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

### Requirement Completeness
- [ ] No [NEEDS CLARIFICATION] markers remain
- [x] Requirements are testable and unambiguous where specified
- [x] Success criteria measurable (counts, percentages, rounding rule)
- [x] Scope bounded (reporting only, no new assignment logic)
- [x] Dependencies: relies on staff list, assignments, holiday list, leaves

### Visual & Interaction Checklist
- [x] Each staff representation consistent with existing color/identity semantics
- [x] Table accessibility noted
- [x] Sorting behavior noted
- [x] Contrast and non-color cues specified

---

## Execution Status
- [x] User description parsed
- [x] Key concepts extracted
- [x] Ambiguities marked
- [x] User scenarios defined
- [x] Requirements generated
- [x] Entities identified
- [ ] Review checklist passed (pending clarifications)

