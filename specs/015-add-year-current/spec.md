# Feature Specification: Year–Current (YTD) Calendar View

**Feature Branch**: `015-add-year-current`  
**Created**: 2025-09-25  
**Status**: Draft  
**Input**: User description: "Add 'Year - Current' tab that when clicked shows the calendar from Jan 1 of the current year up to today (partial current month), alongside existing 1/3/6 month views and Report. It should: (1) Add a new tab labeled 'Year–Current' (or 'YTD') in the range selector; (2) Switch calendar to a scrolling or paginated multi-month layout covering Jan 1..today; (3) Preserve existing assignment/holiday/leave logic; (4) Highlight today visually; (5) Ensure performance is acceptable (avoid rendering full future months); (6) Persist selection in localStorage; (7) Keyboard shortcut (e.g. Shift+Y) to toggle YTD; (8) Tests verifying: tab presence, correct start date at Jan 1, end month truncates at current date, today highlight present, persistence after reload." 

## User Scenarios & Testing *(mandatory)*

### Primary User Story
As a scheduler, I want to view the entire year-to-date (from January 1 to today) in one contiguous calendar context so I can audit on-call distribution and historical coverage without navigating month-by-month.

### Acceptance Scenarios
1. Given today is within the current year, When I click the "Year–Current" (or "YTD") tab, Then the visible calendar starts at January 1 of the current year and ends at the current date (not rendering future days in the current month).
2. Given I am in YTD view, When I reload the application, Then the YTD view is still active (selection persisted) and the end truncation updates if a new day has passed.
3. Given I switch from YTD to "1 month" view, When I return to YTD, Then the full Jan 1..today range re-renders correctly without duplication or gaps.
4. Given today is highlighted, When I scroll the YTD view, Then the today marker remains visible when in viewport and only one day is marked as today.
5. Given I press Shift+Y anywhere with the calendar focused (or global hotkey scope rules), When YTD is not active, Then YTD activates; When already in YTD, Then focus remains and no duplicate activation occurs.
6. Given existing assignments, holidays, and leaves, When I enter YTD view, Then all previously recorded data for past months is visible and consistent with month-by-month navigation results.
7. Given performance constraints, When the year has many months (up to 9 so far in current date), Then initial render completes within acceptable time and scrolling remains smooth (see performance requirement).

### Edge Cases
- Leap year: February 29 must appear when applicable and be included in counts.
- Early January usage: If today is Jan 3, YTD view only shows Jan 1–3 (3 days) and still functions.
- Year boundary at midnight: If the user leaves the page across New Year, re-entering YTD should pivot to new year's Jan 1..today; persisted selection must not lock to prior year.
- Timezone differences: Today highlight and truncation must rely on local (user) date boundary, not UTC roll-over.
- No data yet: If there are zero assignments, YTD still shows blank cells; no errors.
- Large dataset: Many manual overrides and leaves should not cause layout jank.

### Visual & Interaction (optional but recommended)
- YTD tab styled identically to other range tabs; selected state visually distinct.
- Today cell uses a highlight ring or background distinct from assignment color overlays.
- Optional sticky month labels for improved scannability while scrolling.
- Keyboard shortcut Shift+Y triggers same handler as clicking the YTD tab.

## Requirements *(mandatory)*

### Functional Requirements
- **FR-YTD-001**: System MUST provide a new selectable range mode labeled "Year–Current" (or abbreviated "YTD").
- **FR-YTD-002**: When YTD mode is active, the calendar MUST render days from January 1 of the current local year through the current local date inclusive; future days in the current month MUST NOT render.
- **FR-YTD-003**: YTD selection state MUST persist across reloads via existing local storage mechanism.
- **FR-YTD-004**: The system MUST not duplicate or omit any day between Jan 1 and today.
- **FR-YTD-005**: Today’s date MUST be visually highlighted in YTD view distinctly from assignment pills.
- **FR-YTD-006**: All existing logic for holidays, leaves, assignments, and report calculations MUST remain unchanged and function identically when YTD view is active.
- **FR-YTD-007**: Switching between YTD and other month-range modes MUST update internal range anchor state predictably without corrupting persisted data.
- **FR-YTD-008**: A keyboard shortcut (Shift+Y) MUST toggle YTD on (if off) without interfering with text inputs; if already in YTD, shortcut MUST noop.
- **FR-YTD-009**: System MUST expose a test-detectable attribute or role to assert YTD mode is active (e.g., aria-selected on the tab).
- **FR-YTD-010**: YTD mode MUST integrate with existing export; no change to export format.
- **FR-YTD-011**: On New Year after page reload, YTD MUST automatically target the new year's Jan 1..today range.
- **FR-YTD-012**: Leap day (Feb 29) MUST appear exactly once in leap years and not in non-leap years.
- **FR-YTD-013**: Performance: Initial YTD render for up to 300 past days MUST complete within a target threshold [NEEDS CLARIFICATION: define ms budget].
- **FR-YTD-014**: Scrolling performance in YTD mode MUST remain responsive (no more than mild frame drops) [NEEDS CLARIFICATION: FPS / scroll test criteria].
- **FR-YTD-015**: Today highlight MUST update correctly if user keeps the page open across midnight (next day tick) [NEEDS CLARIFICATION: is live rollover required or only on refresh?].

### Visual & Interaction Requirements
- **FR-YTD-VIS-001**: YTD tab MUST appear adjacent to existing 1 / 3 / 6 month controls.
- **FR-YTD-VIS-002**: Active YTD tab MUST use the same selected styling token as other selected range tabs.
- **FR-YTD-VIS-003**: Today cell highlight MUST meet minimum contrast guidelines WCAG AA against both blank and colored assignment states.
- **FR-YTD-VIS-004**: Month boundaries SHOULD be visually separable (e.g., subtle divider or month heading) [NEEDS CLARIFICATION: required or optional?].
- **FR-YTD-VIS-005**: If compact multi-month styles exist, they MAY adapt; no truncation of days allowed.
- **FR-YTD-VIS-006**: Hovering the YTD tab MUST show a tooltip/aria-label describing “Year to Date”.

### Key Entities
- Calendar Range Mode: adds new enum/state value `ytd` representing dynamic Jan1..today interval (not a static month count).
- Persisted Settings: extended to store `rangeMode` OR reuses existing monthsToShow with a sentinel value [NEEDS CLARIFICATION: store as separate key vs overload existing?].

## Review & Acceptance Checklist

### Content Quality
- [x] No implementation details (languages, frameworks, APIs) beyond necessary high-level state concepts.
- [x] Focused on user value and business need (auditing year-to-date coverage).
- [x] Written for non-technical stakeholders.
- [x] All mandatory sections completed.

### Requirement Completeness
- [ ] No [NEEDS CLARIFICATION] markers remain (pending decisions listed).
- [x] Requirements are testable and (aside noted clarifications) unambiguous.
- [x] Success criteria generally measurable (perf needs explicit numbers).
- [x] Scope clearly bounded (Jan1..today only, not future days).
- [x] Dependencies & assumptions identified.

### Visual & Interaction Checklist
- [x] Each staff color model preserved (unchanged).
- [x] Calendar cells still show assignment highlights.
- [x] Keyboard shortcut documented.
- [x] Accessibility highlight requirements stated.

## Execution Status

- [x] User description parsed
- [x] Key concepts extracted
- [x] Ambiguities marked
- [x] User scenarios defined
- [x] Requirements generated
- [x] Entities identified
- [ ] Review checklist passed (pending clarifications)

## Ambiguities / Clarifications Needed
1. Define performance budget (ms) for initial YTD render (FR-YTD-013).
2. Define scroll performance criteria (e.g., 60 FPS target or < 100ms event latency) (FR-YTD-014).
3. Should today highlight auto-update at midnight without reload? (FR-YTD-015).
4. Is month boundary visual treatment mandatory (FR-YTD-VIS-004)? If yes, define style.
5. Should storage use a new key (e.g. `rangeMode: 'ytd'`) or reuse `monthsToShow` with sentinel value 0? (Key Entities).
6. Should Shift+Y also toggle off YTD returning to previous mode, or is it one-way activation only? (Current spec: one-way activation.)

## Summary
Year–Current (YTD) view introduces a persistent, keyboard-accessible way to audit all assignments from the start of the year through today, without rendering future days. It extends existing calendar range navigation while preserving all assignment/holiday/leave semantics and emphasizing today for orientation. Clarifications listed will finalize performance and persistence encoding details.

