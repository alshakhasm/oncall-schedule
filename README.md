# OnCall Scheduler — Local-first Web App

Small desktop-first single-user on-call scheduler.

Setup

```
cd my_project
npm install
npm run dev
```

Tests

```
npm test
```

Build

```
npm run build
```

Export / Import

- CSV export available from side panel (downloads `assignments.csv`).
- Example export JSON is provided in `examples/example-export.json`.

Persistence

- App stores state in `localStorage` under key `oncall-scheduler-v1`. This is single-user, local-only storage. No server sync.

Notes

- Dates are stored and displayed as ISO `YYYY-MM-DD` strings.
- Weekly assignments start on Sundays and are assigned per-week.
- See `specs/001-spec-oncall-scheduler/spec.md` for the full feature spec.
# oncall-schedule
