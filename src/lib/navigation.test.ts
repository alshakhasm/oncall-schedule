import { computeWeeklyAssignments, Staff } from './scheduler'
import { describe, it, expect } from 'vitest'

function computeRangeEnd(rangeStart: string, monthsToShow = 1) {
  const rs = new Date(rangeStart)
  const lastMonth = rs.getMonth() + monthsToShow - 1
  // build last day as UTC to avoid timezone shifts when serializing
  const lastDayUtc = new Date(Date.UTC(rs.getFullYear(), lastMonth + 1, 0))
  return lastDayUtc.toISOString().slice(0, 10)
}

describe('navigation simulation', () => {
  const staff: Staff[] = [{ id: 'A', name: 'Alice' }, { id: 'B', name: 'Bob' }]

  it('has assignments for next month when navigating', () => {
    const start = '2025-09-01'
    const monthsToShow = 1
    const end = computeRangeEnd(start, monthsToShow)
  // validate dates
  const sDate = new Date(start)
  const eDate = new Date(end)
  console.log('TEST DEBUG this', { start, end, sValid: !isNaN(sDate.getTime()), eValid: !isNaN(eDate.getTime()) })
  if (isNaN(sDate.getTime()) || isNaN(eDate.getTime()) || sDate > eDate) throw new Error(`Invalid interval ${start} -> ${end}`)
  const assignmentsThis = computeWeeklyAssignments({ staff, rangeStart: start, rangeEnd: end })
    expect(assignmentsThis.length).toBeGreaterThan(0)

    // advance one calendar month
  const rs = new Date(start)
  const nextUtc = new Date(Date.UTC(rs.getFullYear(), rs.getMonth() + 1, 1))
  const next = nextUtc.toISOString().slice(0,10)
  const nextEnd = computeRangeEnd(next, monthsToShow)
  const nsDate = new Date(next)
  const neDate = new Date(nextEnd)
  console.log('TEST DEBUG next', { next, nextEnd, nsValid: !isNaN(nsDate.getTime()), neValid: !isNaN(neDate.getTime()) })
  if (isNaN(nsDate.getTime()) || isNaN(neDate.getTime()) || nsDate > neDate) throw new Error(`Invalid interval ${next} -> ${nextEnd}`)
  const assignmentsNext = computeWeeklyAssignments({ staff, rangeStart: next, rangeEnd: nextEnd })
    expect(assignmentsNext.length).toBeGreaterThan(0)
  })
})
