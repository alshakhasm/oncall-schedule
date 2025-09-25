import { describe, it, expect } from 'vitest'
import { computeOnCallReport } from './report'
import { AssignmentMeta, Staff } from './scheduler'

describe('report duplicate staff handling', () => {
  it('dedupes duplicate staff ids so working days not doubled', () => {
    const staff: Staff[] = [ { id: 'A', name: 'Alice' }, { id: 'A', name: 'Alice Copy' } ]
    const assignments: AssignmentMeta[] = []
    const today = '2025-01-03'
    const rows = computeOnCallReport({ staff, assignments, holidays: ['2025-01-01'], leaves: [], today })
    // Jan1 holiday removed, Jan2-3 are working -> 2 working days (not 4)
    expect(rows.length).toBe(1)
    expect(rows[0].workingDays).toBe(2)
  })
})
