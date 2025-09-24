import { eachDayOfInterval, format, parseISO, addDays } from 'date-fns'

export type Staff = { id: string; name: string; color?: string }
export type Leave = { staffId: string; start: string; end: string }
export type AssignmentMeta = {
  date: string
  staffId?: string
  manual?: boolean
  holiday?: boolean
  leave?: boolean
  needs_review?: boolean
}

function isWeekend(date: Date) {
  const d = date.getDay()
  return d === 0 || d === 6
}

function iso(date: Date) {
  return format(date, 'yyyy-MM-dd')
}

function dateRangeIncludes(rangeStart: string, rangeEnd: string, isoDate: string) {
  return parseISO(isoDate) >= parseISO(rangeStart) && parseISO(isoDate) <= parseISO(rangeEnd)
}

export function computeWeeklyAssignments(options: {
  staff: Staff[]
  rangeStart: string
  rangeEnd: string
  holidays?: string[]
  leaves?: Leave[]
  manual?: Record<string, string>
  auto?: boolean
}): AssignmentMeta[] {
  const { staff, rangeStart, rangeEnd, holidays = [], leaves = [], manual = {}, auto = true } = options

  // Build list of all dates in interval
  const days = eachDayOfInterval({ start: parseISO(rangeStart), end: parseISO(rangeEnd) })

  // Determine an anchor Sunday for rotation: the Sunday on-or-before rangeStart
  const rangeStartDate = parseISO(rangeStart)
  let firstSunday = rangeStartDate
  while (firstSunday.getDay() !== 0) {
    firstSunday = addDays(firstSunday, -1)
  }

  const result: AssignmentMeta[] = []
  let rotationIndex = 0

  for (let day of days) {
    const dIso = iso(day)
    const isHoliday = holidays.includes(dIso)
  const hasManual = Object.prototype.hasOwnProperty.call(manual, dIso)
  const manualStaff = hasManual ? manual[dIso] : undefined

    let onLeaveForAnyone = false
    // compute eligible staff
    const eligible = staff.filter(s => {
      const hasLeave = leaves.some(l => l.staffId === s.id && dateRangeIncludes(l.start, l.end, dIso))
      if (hasLeave) onLeaveForAnyone = true
      return !hasLeave
    })

    let assignId: string | undefined
    let needsReview = false

    if (hasManual) {
      assignId = manualStaff || undefined
    } else if (isHoliday || isWeekend(day)) {
      assignId = undefined
    } else if (!auto) {
      // auto-scheduling disabled -> leave unassigned unless manual
      assignId = undefined
    } else {
      // weekly assignment: only assign on Sundays as rotation anchors; for weekdays, use the staff assigned for that week.
      // Find the week start (Sunday) on or before this day within rangeStart..rangeEnd
      let weekStart = day
      while (weekStart.getDay() !== 0) {
        weekStart = addDays(weekStart, -1)
      }

      // pick rotation index based on weekStart date
  const weekIso = iso(weekStart)
  // simple deterministic: rotationIndex = number of weeks since firstSunday
  const weeksSince = Math.floor((parseISO(weekIso).getTime() - firstSunday.getTime()) / (7 * 24 * 60 * 60 * 1000))
      const idx = ((weeksSince % staff.length) + staff.length) % staff.length

      // pick next eligible staff starting from idx
      let attempts = 0
      for (let i = 0; i < staff.length; i++) {
        const candidate = staff[(idx + i) % staff.length]
        const candidateOnLeave = leaves.some(l => l.staffId === candidate.id && dateRangeIncludes(l.start, l.end, dIso))
        if (!candidateOnLeave) { assignId = candidate.id; break }
        attempts++
      }

      if (!assignId) {
        // everyone on leave -> assign next in rotation (idx) and mark needs_review
        assignId = staff[idx % staff.length]?.id
        needsReview = true
      }
    }

    result.push({ date: dIso, staffId: assignId, holiday: isHoliday, leave: onLeaveForAnyone, needs_review: needsReview })
  }

  return result
}
