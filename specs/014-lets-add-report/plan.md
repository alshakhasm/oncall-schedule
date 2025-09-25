
# Implementation Plan: Year-To-Date On-Call Report Tab

**Branch**: `[014-lets-add-report]` | **Date**: 2025-09-25 | **Spec**: `specs/014-lets-add-report/spec.md`
**Input**: Feature specification from `/specs/014-lets-add-report/spec.md`

## Execution Flow (/plan command scope)
```
1. Load feature spec from Input path
   → If not found: ERROR "No feature spec at {path}"
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → Detect Project Type from context (web=frontend+backend, mobile=app+api)
   → Set Structure Decision based on project type
3. Fill the Constitution Check section based on the content of the constitution document.
4. Evaluate Constitution Check section below
   → If violations exist: Document in Complexity Tracking
   → If no justification possible: ERROR "Simplify approach first"
   → Update Progress Tracking: Initial Constitution Check
5. Execute Phase 0 → research.md
   → If NEEDS CLARIFICATION remain: ERROR "Resolve unknowns"
6. Execute Phase 1 → contracts, data-model.md, quickstart.md, agent-specific template file (e.g., `CLAUDE.md` for Claude Code, `.github/copilot-instructions.md` for GitHub Copilot, `GEMINI.md` for Gemini CLI, `QWEN.md` for Qwen Code or `AGENTS.md` for opencode).
7. Re-evaluate Constitution Check section
   → If new violations: Refactor design, return to Phase 1
   → Update Progress Tracking: Post-Design Constitution Check
8. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md)
9. STOP - Ready for /tasks command
```

**IMPORTANT**: The /plan command STOPS at step 7. Phases 2-4 are executed by other commands:
- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary
Introduce a new "Report" tab in the top bar providing a year-to-date per-staff on-call coverage table. It calculates for each staff member: (a) on-call assignment days (excluding holidays and optionally leaves) and (b) working days denominator (all calendar days from Jan 1 to as-of date excluding holidays and that staff's leave days). Displays counts, percentage share, and deviation from equal share. React + current in-memory/localStorage state; no backend.

## Technical Context
**Language/Version**: TypeScript (React 18)  
**Primary Dependencies**: React, date-fns (already present), localStorage persistence  
**Storage**: Browser localStorage (existing key `oncall-scheduler-v1`)  
**Testing**: Vitest + @testing-library/react  
**Target Platform**: Web (Vite dev server)  
**Project Type**: Single-page web app (Option 1 structure)  
**Performance Goals**: Report recompute under 50ms with < 1 year of daily assignments (small N)  
**Constraints**: No backend; must recompute on state change; avoid O(N^2) loops  
**Scale/Scope**: Dozens of staff, one year range (≤ 366 days)  

Open Clarifications (from spec):
- Exclude on-call credit on holidays? (Spec suggests yes)  
- Exclude on-call if staff is on leave that day?  
- As-of date: always "today" vs. last visible date in calendar?  
- Sorting default: staff ascending or by % share?  
- Export: which columns? Include deviation?  
- Sparkline / visual bars? Keep MVP textual only?  
- Fairness deviation sign vs absolute value?  

Assumptions (provisional until clarified):
1. On-call credit excluded on holidays and personal leave days.  
2. As-of date = current browser date (today).  
3. Default sort = Staff name ascending.  
4. Export columns = Staff, OnCallDays, WorkingDays, Percent, Deviation.  
5. MVP: no sparkline, simple percentage bar optional later.  
6. Deviation displayed signed (e.g., +3.2%).

## Constitution Check
The constitution file is skeletal (placeholders); no explicit enforced principles. No violations detected. Complexity minimal (single new component + pure function). Proceed.

## Project Structure

### Documentation (this feature)
```
specs/[###-feature]/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)
```
# Option 1: Single project (DEFAULT)
src/
├── models/
├── services/
├── cli/
└── lib/

tests/
├── contract/
├── integration/
└── unit/

# Option 2: Web application (when "frontend" + "backend" detected)
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/

# Option 3: Mobile + API (when "iOS/Android" detected)
api/
└── [same as backend above]

ios/ or android/
└── [platform-specific structure]
```

**Structure Decision**: Option 1 (existing single SPA). Add `ReportTab` component under `src/components/` and a pure helper in `src/lib/report.ts`.

## Phase 0: Outline & Research
Focus: Clarify counting rules & derive calculation formula.

Unknowns → Provisional Decisions:
| Topic | Provisional Decision | Rationale |
|-------|----------------------|-----------|
| Holiday on-call credit | Exclude day entirely | Align with spec desire to omit holidays from working days & fairness |
| Leave day on-call credit | Exclude | Avoid incentivizing assigning during leave |
| As-of date | Today | Simplicity & consistent fairness snapshot |
| Deviation formula | percentShare - (100 / staffCount) | Signed indicates over/under |
| Sorting default | Staff name asc | Deterministic & neutral |
| Sparkline | Omit MVP | Reduce scope, can iterate |
| Export columns | Staff, OnCallDays, WorkingDays, Percent, Deviation | Core metrics |

Formulae:
- workingDays(staff) = count(d in [Jan1..today] where d not in holidays AND d not in staffLeaves(staff)).
- onCallDays(staff) = count(d assigned to staff AND d not in holidays AND d not in staffLeaves(staff)).
- percentShare = (onCallDays / max(1, workingDays)) * 100.
- equalShare = 100 / staffCount.
- deviation = percentShare - equalShare.

Research Output committed as inline (lightweight); separate `research.md` to be generated enumerating these.

## Phase 1: Design & Contracts
No external API; internal pure calculation function. Outputs: `data-model.md`, `quickstart.md`, `contracts/` omitted (no API). Provide contract in TypeScript type definition.

Entities:
- ReportRow { staffId, staffName, onCallDays, workingDays, percentShare, deviation }

Pure Function Contract (report.ts):
```
computeOnCallReport({ staff, assignments, holidays, leaves, today }): ReportRow[]
```
Deterministic; stable sort by staff name asc.

Test Scenarios (will become integration/unit tests):
1. Single staff, no holidays/leaves → onCallDays == assignments length; workingDays == days elapsed.
2. Holiday exclusion → holiday day with assignment not counted.
3. Leave exclusion → leave day with assignment not counted for that staff.
4. Deviation zero when single staff.
5. Multi staff equal distribution -> deviations sum ≈ 0.
6. Division by zero guard (all days holidays & leaves) → workingDays = 0 -> percent 0.

Quickstart will describe adding tab button, computing rows, rendering table with sort.

## Phase 2: Task Planning Approach
*This section describes what the /tasks command will do - DO NOT execute during /plan*

**Task Generation Strategy**:
- Load `.specify/templates/tasks-template.md` as base
- Generate tasks from Phase 1 design docs (contracts, data model, quickstart)
- Each contract → contract test task [P]
- Each entity → model creation task [P] 
- Each user story → integration test task
- Implementation tasks to make tests pass

**Ordering Strategy**:
- TDD order: Tests before implementation 
- Dependency order: Models before services before UI
- Mark [P] for parallel execution (independent files)

**Estimated Output**: 25-30 numbered, ordered tasks in tasks.md

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation
*These phases are beyond the scope of the /plan command*

**Phase 3**: Task execution (/tasks command creates tasks.md)  
**Phase 4**: Implementation (execute tasks.md following constitutional principles)  
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

## Complexity Tracking
*Fill ONLY if Constitution Check has violations that must be justified*

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |


## Progress Tracking
*This checklist is updated during execution flow*

**Phase Status**:
- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [x] Phase 2: Task planning described (NOT executed)
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [ ] Initial Constitution Check: PASS
- [ ] Post-Design Constitution Check: PASS
- [ ] All NEEDS CLARIFICATION resolved
- [ ] Complexity deviations documented

---
*Based on Constitution v2.1.1 - See `/memory/constitution.md`*
