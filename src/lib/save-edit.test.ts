import { describe, it, expect } from 'vitest'
import { computeWeeklyAssignments } from './scheduler'

function applySave(manual: Record<string,string>, editRange: { start: string; end: string; staffId?: string } | null, s: string, e: string, sid?: string) {
  const copy: Record<string,string> = { ...manual }
  if (!editRange) {
    for (let d = new Date(s); d <= new Date(e); d.setDate(d.getDate() + 1)) {
      const iso = d.toISOString().slice(0,10)
      if (sid) copy[iso] = sid
      else copy[iso] = ''
    }
    return copy
  }

  const origStart = new Date(editRange.start)
  const origEnd = new Date(editRange.end)
  const newStart = new Date(s)
  const newEnd = new Date(e)
  const unionStart = origStart < newStart ? origStart : newStart
  const unionEnd = origEnd > newEnd ? origEnd : newEnd

  for (let d = new Date(unionStart); d <= unionEnd; d.setDate(d.getDate() + 1)) {
    const iso = d.toISOString().slice(0,10)
    if (d >= newStart && d <= newEnd) {
      if (sid) copy[iso] = sid
      else copy[iso] = ''
    } else {
      copy[iso] = ''
    }
  }
  return copy
}

describe('edit-save behavior', () => {
  it('shortening an assignment end date clears days outside new range', () => {
    const staff = [{ id: 'A', name: 'A' }, { id: 'B', name: 'B' }]
    // initial no manual overrides
    const manual: Record<string,string> = {}

    // assume an editRange covering 2025-09-03..2025-09-07 for staff B
    const editRange = { start: '2025-09-03', end: '2025-09-07', staffId: 'B' }

    // user saves with shortened end to 2025-09-05
    const newManual = applySave(manual, editRange, '2025-09-03', '2025-09-05', 'B')

    // compute assignments over full week
    const res = computeWeeklyAssignments({ staff, rangeStart: '2025-09-01', rangeEnd: '2025-09-14', manual: newManual })

    // days 2025-09-06 and 2025-09-07 should be unassigned (manual '')
    const day6 = res.find(r => r.date === '2025-09-06')
    const day7 = res.find(r => r.date === '2025-09-07')
    expect(day6).toBeDefined()
    expect(day7).toBeDefined()
    expect(day6!.staffId).toBeUndefined()
    expect(day7!.staffId).toBeUndefined()
  })
})
