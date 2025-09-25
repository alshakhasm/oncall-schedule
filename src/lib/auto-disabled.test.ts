import { describe, it, expect } from 'vitest'
import { computeWeeklyAssignments } from './scheduler'

describe('auto disabled leaves days unassigned', () => {
  it('with auto=false and no manual, all weekdays are unassigned', () => {
    const staff = [{ id: 'A', name: 'A' }, { id: 'B', name: 'B' }]
    const res = computeWeeklyAssignments({ staff, rangeStart: '2025-09-01', rangeEnd: '2025-09-07', auto: false })
    // Only holidays/weekends may be unassigned too; we expect all days to be unassigned when auto=false
    expect(res.every(r => !r.staffId)).toBe(true)
  })
  it('with auto=false but manual present, uses manual', () => {
    const staff = [{ id: 'A', name: 'A' }]
    const manual = { '2025-09-02': 'A' }
    const res = computeWeeklyAssignments({ staff, rangeStart: '2025-09-01', rangeEnd: '2025-09-03', auto: false, manual })
    const map = Object.fromEntries(res.map(r => [r.date, r.staffId || '']))
    expect(map['2025-09-01']).toBe('')
    expect(map['2025-09-02']).toBe('A')
    expect(map['2025-09-03']).toBe('')
  })
})
