import { describe, it, expect } from 'vitest'
import { computeOnCallReport } from './report'
import { Staff, AssignmentMeta, Leave } from './scheduler'

function makeAssignments(dates: string[], staffId?: string): AssignmentMeta[] {
  return dates.map(d => ({ date: d, staffId }))
}

describe('computeOnCallReport', () => {
  const staff: Staff[] = [
    { id: 'A', name: 'Alice' },
    { id: 'B', name: 'Bob' }
  ]

  it('single staff scenario percent and deviation zero equal share', () => {
    const single: Staff[] = [{ id: 'A', name: 'Alice' }]
    const assignments = makeAssignments(['2025-01-01','2025-01-02','2025-01-03'], 'A')
    const report = computeOnCallReport({ staff: single, assignments, holidays: [], leaves: [], today: '2025-01-03' })
    expect(report[0].onCallDays).toBe(3)
    expect(report[0].workingDays).toBe(3) // Jan1..Jan3
    expect(report[0].percentShare).toBeCloseTo(100)
    expect(report[0].deviation).toBeCloseTo(0)
  })

  it('holiday exclusion removes day from working and on-call counts', () => {
    const assignments = makeAssignments(['2025-01-01','2025-01-02','2025-01-03'], 'A')
    const report = computeOnCallReport({ staff: [{ id: 'A', name: 'Alice' }], assignments, holidays: ['2025-01-02'], leaves: [], today: '2025-01-03' })
    const row = report[0]
    expect(row.onCallDays).toBe(2)
    expect(row.workingDays).toBe(2)
  })

  it('leave exclusion removes day from working and on-call for that staff only', () => {
    const assignments = makeAssignments(['2025-01-01','2025-01-02','2025-01-03'], 'A')
    const leaves: Leave[] = [{ staffId: 'A', start: '2025-01-02', end: '2025-01-02' }]
    const report = computeOnCallReport({ staff: [{ id: 'A', name: 'Alice' }], assignments, holidays: [], leaves, today: '2025-01-03' })
    const row = report[0]
    expect(row.onCallDays).toBe(2)
    expect(row.workingDays).toBe(2)
  })

  it('multi staff equal distribution gives deviations summing approx zero', () => {
    const assignments: AssignmentMeta[] = [
      { date: '2025-01-01', staffId: 'A' },
      { date: '2025-01-02', staffId: 'B' },
      { date: '2025-01-03', staffId: 'A' },
      { date: '2025-01-04', staffId: 'B' }
    ]
    const report = computeOnCallReport({ staff, assignments, holidays: [], leaves: [], today: '2025-01-04' })
    const totalDeviation = report.reduce((sum, r) => sum + r.deviation, 0)
    expect(Math.abs(totalDeviation)).toBeLessThan(0.01)
  })

  it('guard zero working days -> percentShare 0', () => {
    const assignments: AssignmentMeta[] = []
    const report = computeOnCallReport({ staff, assignments, holidays: ['2025-01-01','2025-01-02'], leaves: [ { staffId: 'A', start: '2025-01-03', end: '2025-01-10' }, { staffId: 'B', start: '2025-01-03', end: '2025-01-10' }], today: '2025-01-10' })
    for (const r of report) {
      expect(r.workingDays).toBe(0)
      expect(r.percentShare).toBe(0)
    }
  })
})
