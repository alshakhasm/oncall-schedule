import { describe, it, expect } from 'vitest'
import { computeWeeklyAssignments } from './scheduler'

describe('scheduler alternation fairness (AC1)', () => {
  it('alternates assignments for two staff over 10 working days', () => {
    const staff = [{ id: 'A', name: 'A' }, { id: 'B', name: 'B' }]
    // Ten working days: pick a range with two weeks (14 days) but exclude weekends in counting
    const res = computeWeeklyAssignments({ staff, rangeStart: '2025-09-01', rangeEnd: '2025-09-14' })

    // Count assigned weekdays excluding holidays
    const counts: Record<string, number> = { A: 0, B: 0 }
    for (const r of res) {
      if (!r.staffId) continue
      const d = new Date(r.date)
      if (d.getDay() === 0 || d.getDay() === 6) continue
      counts[r.staffId] = (counts[r.staffId] || 0) + 1
    }

    expect(Math.abs(counts.A - counts.B)).toBeLessThanOrEqual(1)
  })
})

describe('scheduler holiday and leave rules (AC2, AC3, AC5)', () => {
  it('does not assign weekdays that are holidays (AC2)', () => {
    const staff = [{ id: 'A', name: 'A' }]
    const res = computeWeeklyAssignments({ staff, rangeStart: '2025-09-01', rangeEnd: '2025-09-05', holidays: ['2025-09-03'] })
    const day = res.find(r => r.date === '2025-09-03')
    expect(day).toBeDefined()
    expect(day!.staffId).toBeUndefined()
    expect(day!.holiday).toBe(true)
  })

  it('never assigns a staff on leave (AC3)', () => {
    const staff = [{ id: 'A', name: 'A' }, { id: 'B', name: 'B' }]
    const leaves = [{ staffId: 'A', start: '2025-09-02', end: '2025-09-04' }]
    const res = computeWeeklyAssignments({ staff, rangeStart: '2025-09-01', rangeEnd: '2025-09-05', leaves })
    for (const r of res) {
      if (['2025-09-02', '2025-09-03', '2025-09-04'].includes(r.date)) {
        expect(r.staffId).not.toBe('A')
      }
    }
  })

  it('assigns and marks needs_review when all staff on leave (AC5)', () => {
    const staff = [{ id: 'A', name: 'A' }, { id: 'B', name: 'B' }]
    const leaves = [
      { staffId: 'A', start: '2025-09-02', end: '2025-09-04' },
      { staffId: 'B', start: '2025-09-02', end: '2025-09-04' }
    ]
    const res = computeWeeklyAssignments({ staff, rangeStart: '2025-09-02', rangeEnd: '2025-09-04', leaves })
    for (const r of res) {
      if (r.date === '2025-09-02') {
        expect(r.needs_review).toBe(true)
        expect(r.staffId).toBeDefined()
      }
    }
  })
})

describe('manual assignment persistence (AC4)', () => {
  it('manual assignment overrides auto and persists through compute (AC4)', () => {
    const staff = [{ id: 'A', name: 'A' }, { id: 'B', name: 'B' }]
    const manual = { '2025-09-03': 'B' }
    const res = computeWeeklyAssignments({ staff, rangeStart: '2025-09-01', rangeEnd: '2025-09-07', manual })
    const day = res.find(r => r.date === '2025-09-03')
    expect(day).toBeDefined()
    expect(day!.staffId).toBe('B')
  })
})
