# Changelog

All notable changes to this project will be documented in this file.

## [0.2.0] - 2025-09-25
### Added
- Year-To-Date (YTD) range mode with month tile grid (Jan through current month) and Shift+Y shortcut.
- Reporting tab with on-call distribution, working days calculation, fairness percentages, and deviation metrics.
- Today jump control to quickly return to the current month.
- Unique staff ID generation with migration and duplicate handling in reports.
- Persistence of rangeMode (months|ytd) in localStorage.

### Improved
- Robust week/month navigation across 1/3/6 month views.
- Holiday and leave input UX: validation gating and clear actions.
- Report accuracy: correct working day filtering, holiday/leave exclusion, duplicate staff de-duplication.

### Fixed
- Timezone drift issues affecting day boundaries.
- Hidden duplicate staff collapsing rows in the report.

### Tests
- Expanded test suite for scheduler, navigation, side panel (holidays/leaves), and report logic (including duplicate IDs).

## [0.1.0] - 2025-09-??
- Initial public baseline with multi-month calendar, manual assignments, holidays & leaves management, and persistence.

