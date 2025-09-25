# Feature Specification: OnCall Scheduler — Local-first Web App

**Feature Branch**: `001-spec-oncall-scheduler`
**Created**: 2025-09-23
**Status**: Draft
**Input**: User description: "Build a lightweight, local-first web app to create, visualize, and fairly rotate on-call assignments. Count only working days (Mon–Fri). Exclude holidays and approved leaves from assignment and counting. Support manual per-day overrides that persist locally. Views: 1 / 3 / 6 / 12 months. Export/Import JSON + CSV. Desktop-first, minimal dependencies: React + Vite + Tailwind + date-fns + Recharts."

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

---

## User Scenarios & Testing *(mandatory)*

### Primary User Story
On-call coordinators need a simple, desktop-first tool that lets them create a fair on-call schedule that counts only working days, excludes holidays and approved staff leaves, and supports manual per-day overrides which persist locally.

### Acceptance Scenarios
1. Given a department staff list and a date range, When the coordinator requests a schedule for 1/3/6/12 months, Then the system generates deterministic round-robin assignments only on working weekdays excluding listed holidays and leaves.
2. Given a weekday marked as holiday, When generating a schedule, Then that date is not assigned and does not increment any staff counts.
3. Given a staff member with a leave covering date D, When generating a schedule, Then that staff member is not assigned for D and does not receive a count for D.
4. Given a manual assignment made by the coordinator for date D, When the app reloads or the schedule regenerates, Then the manual assignment persists and overrides auto-assignment.
5. Given a working-day when every staff member is on leave, When generating the schedule, Then the system assigns the next person in rotation but flags the day `needs_review`.

### Edge Cases
- Holiday on weekend: treated as no-op (weekends are already excluded).
- Partial-day leaves are out of scope for V1; leaves are date-inclusive and full-day.
- If the staff list is empty: the system should show an error and no assignments.
- Timezone changes on client do not alter stored ISO date strings.

## Requirements *(mandatory)*

### Functional Requirements
- **FR-001**: System MUST display calendar grid and aggregate views for 1, 3, 6, and 12 months.
- **FR-002**: System MUST consider only working weekdays (Monday–Friday) eligible for assignment and counting.
- **FR-003**: System MUST accept a list of holidays (ISO `YYYY-MM-DD`) and exclude them from assignment and counting.
- **FR-004**: System MUST accept staff leave windows (staffId, start ISO, end ISO) and exclude affected staff from assignments and counts for covered dates.
- **FR-005**: System MUST auto-assign staff deterministically using round-robin across eligible staff, skipping those on leave.
 - **FR-005**: System MUST auto-assign staff deterministically using round-robin across eligible staff at a weekly granularity (each assignment covers one week), skipping those on leave.
- **FR-006**: Manual per-date assignments MUST override auto-assigned values and persist locally.
- **FR-007**: System MUST display per-staff counts for the selected date range, excluding holidays and leaves.
- **FR-008**: System MUST persist state in localStorage under key `oncall-scheduler-v1` and provide Export/Import of full state as JSON.
- **FR-009**: System MUST export assignments as CSV with rows containing: date, staffId, staffName, manualFlag, holidayFlag, leaveFlag.
- **FR-010**: System MUST provide a quick day inspector showing assigned staff and meta flags (`manual`, `holiday`, `leave`, `needs_review`) with controls to assign/unset.
- **FR-011**: If every staff is on leave for a working day, system MUST assign the next in rotation and mark the date with `needs_review`.
- **FR-012**: System MUST validate imported JSON schema and reject malformed inputs with helpful error messages.
- **FR-013**: System MUST store dates as date-only ISO `YYYY-MM-DD` strings (no time component).

*Notes on ambiguity*: The template asks to avoid implementation details. Although the original request lists preferred tech (React, Vite, Tailwind, date-fns, Recharts, TypeScript), those are implementation notes and will be summarized separately under non-functional constraints.

### Key Entities *(include if feature involves data)*
- **Staff**: { id: string, name: string, color?: string }
- **Holiday**: ISO date string `YYYY-MM-DD`
- **Leave**: { staffId: string, start: `YYYY-MM-DD`, end: `YYYY-MM-DD` }
- **ManualAssignment**: map of `YYYY-MM-DD` -> staffId
- **Settings**: { seed?: number, randomizeOrder?: boolean }
 - **AssignmentPeriod**: `weekly` (each assignment covers a week)
 - **WeekStart**: `Sunday` (weeks start on Sunday; the earliest Sunday in the selected month is the start of the 1st week)

---

## Review & Acceptance Checklist

### Content Quality
- [x] No implementation details required by stakeholders
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

### Requirement Completeness
- [x] No [NEEDS CLARIFICATION] markers remain
- [x] Requirements are testable and unambiguous
- [x] Success criteria are measurable
- [x] Scope is clearly bounded
- [x] Dependencies and assumptions identified

---

## Execution Status

- [x] User description parsed
- [x] Key concepts extracted
- [x] Ambiguities marked
- [x] User scenarios defined
- [x] Requirements generated
- [x] Entities identified
- [x] Review checklist passed

---

## Non-functional constraints & notes (for planning, not for stakeholders)
- Desktop-first responsive UI.
- Minimal dependencies preferred (React + Vite + Tailwind + date-fns + Recharts suggested).
- TypeScript preferred.
- Performance target: schedule computation for 12 months should run <200ms on typical laptop.
- Storage: localStorage key `oncall-scheduler-v1`.

## Acceptance Criteria (mapped from user request)
- **AC1 — Alternation fairness**: With 2 staff and 10 working days, assignments alternate and per-staff counts differ by at most 1.
- **AC2 — Holiday exclusion**: Weekday holidays are excluded from assignment and counts.
- **AC3 — Leave exclusion**: Staff on leave are not assigned and receive no count for covered dates.
- **AC4 — Manual persistence**: Manual assignments survive reload and export/import.
- **AC5 — Needs-review**: If all staff are on leave on a working day, assign next rotation and flag `needs_review`.
- **AC6 — CSV format**: CSV includes: date, staffId, staffName, manualFlag, holidayFlag, leaveFlag.

## Deliverables
- Source implementing core features (desktop-first SPA), unit-tested scheduler logic, README, example export JSON, example CSV fixture.

---

```
