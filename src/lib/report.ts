import { Staff, Leave, AssignmentMeta } from './scheduler'
import { parseISO } from 'date-fns'

export interface ReportRow {
  staffId: string
  staffName: string
  onCallDays: number
  workingDays: number
  percentShare: number
  deviation: number
}

export interface ComputeOnCallReportOptions {
  staff: Staff[]
  assignments: AssignmentMeta[]
  holidays: string[]
  leaves: Leave[]
  today?: string // ISO date; defaults to browser today
}

function isoToday() {
  const d = new Date()
  return d.toISOString().slice(0,10)
}

function dateInRange(d: string, start: string, end: string) {
  return d >= start && d <= end
}

export function computeOnCallReport(opts: ComputeOnCallReportOptions): ReportRow[] {
  const { assignments, holidays, leaves, today = isoToday() } = opts
  let { staff } = opts
  if (!staff || staff.length === 0) return []
  // De-dupe staff by id to avoid inflating denominators if duplicates accidentally present
  const seen = new Set<string>()
  staff = staff.filter(s => {
    if (seen.has(s.id)) return false
    seen.add(s.id)
    return true
  })

  // Build Jan 1 of the current year deterministically (avoid timezone shifting to previous year)
  const year = parseISO(today).getFullYear()
  const startYear = `${year}-01-01`
  const endDate = today

  const holidaySet = new Set(holidays.filter(h => dateInRange(h, startYear, endDate)))

  // Pre-index leaves per staff for quick lookup
  const leavesByStaff: Record<string, { start: string; end: string }[]> = {}
  for (const l of leaves) {
    if (!leavesByStaff[l.staffId]) leavesByStaff[l.staffId] = []
    leavesByStaff[l.staffId].push({ start: l.start, end: l.end })
  }

  function staffOnLeave(staffId: string, iso: string) {
    const arr = leavesByStaff[staffId]
    if (!arr) return false
    return arr.some(r => dateInRange(iso, r.start, r.end))
  }

  // Build map of assignment days per staff (filtering out holidays & leave days for that staff)
  const onCallCounts: Record<string, number> = {}
  for (const s of staff) onCallCounts[s.id] = 0

  for (const a of assignments) {
    if (!a.staffId) continue
    if (a.date < startYear || a.date > endDate) continue
    if (holidaySet.has(a.date)) continue
    if (staffOnLeave(a.staffId, a.date)) continue
    onCallCounts[a.staffId] = (onCallCounts[a.staffId] || 0) + 1
  }

  // Working days: all days Jan1..today excluding holidays + that staff's leave days.
  // Use manual loop with UTC to avoid DST / TZ off-by-one anomalies inflating counts.
  const workingDays: Record<string, number> = {}
  for (const s of staff) workingDays[s.id] = 0
  const startDateObj = parseISO(startYear)
  const endDateObj = parseISO(endDate)
  const cursor = new Date(startDateObj)
  let anyEffectiveWorkingDay = false
  while (cursor <= endDateObj) {
    const iso = `${cursor.getFullYear()}-${String(cursor.getMonth()+1).padStart(2,'0')}-${String(cursor.getDate()).padStart(2,'0')}`
    if (!holidaySet.has(iso)) {
      // determine if all staff on leave this day
      const allOnLeave = staff.every(s => staffOnLeave(s.id, iso))
      if (!allOnLeave) {
        anyEffectiveWorkingDay = true
        for (const s of staff) {
          if (staffOnLeave(s.id, iso)) continue
          workingDays[s.id]++
        }
      }
    }
    cursor.setDate(cursor.getDate() + 1)
  }
  if (!anyEffectiveWorkingDay) {
    for (const s of staff) workingDays[s.id] = 0
  }

  const staffCount = staff.length
  const equalShare = 100 / staffCount

  const rows: ReportRow[] = staff.map(s => {
    const wd = workingDays[s.id]
    const oc = onCallCounts[s.id]
    const percent = wd > 0 ? (oc / wd) * 100 : 0
    const deviation = percent - equalShare
    return {
      staffId: s.id,
      staffName: s.name,
      onCallDays: oc,
      workingDays: wd,
      percentShare: Number(percent.toFixed(2)),
      deviation: Number(deviation.toFixed(2))
    }
  })

  // stable sort by staff name ascending (localeCompare)
  rows.sort((a,b) => a.staffName.localeCompare(b.staffName))
  return rows
}
