import React from 'react'
import { AssignmentMeta, Staff } from '../lib/scheduler'

function weekdayHeader() {
  return ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
}

export default function CalendarGrid({ assignments, onDayClick, staff, onDropAssign, onDragAnnounce, monthsToShow, rangeStart, onEditEntry, ytd }: { assignments: AssignmentMeta[]; onDayClick?: (date: string) => void; staff?: Staff[]; onDropAssign?: (date: string, staffId: string) => void; onDragAnnounce?: (msg: string) => void; monthsToShow?: number; rangeStart?: string; onEditEntry?: (start: string, end: string, staffId?: string) => void; ytd?: boolean }) {
  const sorted = [...assignments].sort((a,b)=> a.date.localeCompare(b.date))
  if (sorted.length === 0) return <div />

  // map assignments by date for fast lookup
  const map: Record<string, AssignmentMeta> = {}
  for (const a of sorted) map[a.date] = a

  // determine display range: Sunday on-or-before first date to Saturday on-or-after last date
  const first = new Date(sorted[0].date)
  let last = new Date(sorted[sorted.length-1].date)
  // if monthsToShow and rangeStart provided, compute last from rangeStart + monthsToShow months
  if (monthsToShow && rangeStart) {
    const rs = new Date(rangeStart)
    const endMonth = rs.getMonth() + monthsToShow - 1
    last = new Date(rs.getFullYear(), endMonth + 1, 0) // last day of final month
  }
  const displayStart = new Date(first)
  while (displayStart.getDay() !== 0) displayStart.setDate(displayStart.getDate() - 1)
  const displayEnd = new Date(last)
  while (displayEnd.getDay() !== 6) displayEnd.setDate(displayEnd.getDate() + 1)

  // build weeks array (each week is array of 7 AssignmentMeta-like objects)
  const weeks: AssignmentMeta[][] = []
  for (let d = new Date(displayStart); d <= displayEnd; d.setDate(d.getDate() + 7)) {
    const week: AssignmentMeta[] = []
    for (let i = 0; i < 7; i++) {
      const cell = new Date(d)
      cell.setDate(d.getDate() + i)
      const iso = cell.toISOString().slice(0,10)
      if (map[iso]) week.push(map[iso])
      else week.push({ date: iso } as AssignmentMeta)
    }
    weeks.push(week)
  }

  // compute first-Sunday anchor per month present in the assignments (with exception rule handled)
  const firstSundayByMonth: Record<string,string> = {}
  const monthsSeen = new Set<string>()
  for (const a of sorted) {
    const d = new Date(a.date)
    const monthKey = `${d.getFullYear()}-${d.getMonth()+1}`
    if (monthsSeen.has(monthKey)) continue
    monthsSeen.add(monthKey)
    const year = d.getFullYear(), month = d.getMonth()
    const firstDay = new Date(year, month, 1)
    // find first Sunday in month
    let s = new Date(firstDay)
    while (s.getMonth() === month && s.getDay() !== 0) s.setDate(s.getDate() + 1)
    if (s.getMonth() === month && s.getDay() === 0) {
      firstSundayByMonth[monthKey] = s.toISOString().slice(0,10)
    } else {
      // consider Sunday 1-2 days before the 1st
      const prev1 = new Date(firstDay); prev1.setDate(firstDay.getDate()-1)
      const prev2 = new Date(firstDay); prev2.setDate(firstDay.getDate()-2)
      if (prev1.getDay() === 0) firstSundayByMonth[monthKey] = prev1.toISOString().slice(0,10)
      else if (prev2.getDay() === 0) firstSundayByMonth[monthKey] = prev2.toISOString().slice(0,10)
    }
  }

  // If compact 3-month view requested, render three small month grids side-by-side
  if (ytd && rangeStart) {
    // Render months from Jan to current month as grid tiles (similar to six-month but dynamic count)
    const rs = new Date(rangeStart) // should be Jan 1 current year
    const now = new Date()
    const monthCount = now.getMonth() + 1 // months are 0-based, +1 to include current month
    const months: { year: number; month: number; days: AssignmentMeta[] }[] = []
    for (let i = 0; i < monthCount; i++) {
      const m = new Date(rs.getFullYear(), i, 1)
      const year = m.getFullYear(), month = m.getMonth()
      const days: AssignmentMeta[] = []
      const lastDay = new Date(year, month + 1, 0).getDate()
      for (let d = 1; d <= lastDay; d++) {
        const iso = new Date(year, month, d).toISOString().slice(0,10)
        days.push(map[iso] || ({ date: iso } as AssignmentMeta))
      }
      months.push({ year, month, days })
    }
    return (
      <div className="mt-4">
        <div className="compact-months six-months" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))' }} role="grid" aria-label={`YTD view ${monthCount} months`}>
          {months.map((mBlock, idx) => (
            <div key={idx} className="mini-month card p-2" role="group" aria-label={`${mBlock.year}-${mBlock.month+1}`}>
              <div className="text-sm font-semibold mb-1">{new Date(mBlock.year, mBlock.month, 1).toLocaleString(undefined,{ month: 'long', year: 'numeric' })}</div>
              <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium">
                {weekdayHeader().map(h => <div key={h} className="p-0.5">{h.slice(0,1)}</div>)}
              </div>
              <div className="mt-1 space-y-1">
                {(() => {
                  const year = mBlock.year, month = mBlock.month
                  const firstDay = new Date(year, month, 1)
                  const lastDay = new Date(year, month + 1, 0)
                  const start = new Date(firstDay)
                  while (start.getDay() !== 0) start.setDate(start.getDate() - 1)
                  const end = new Date(lastDay)
                  while (end.getDay() !== 6) end.setDate(end.getDate() + 1)
                  const monthWeeks: AssignmentMeta[][] = []
                  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 7)) {
                    const wk: AssignmentMeta[] = []
                    for (let i = 0; i < 7; i++) {
                      const cell = new Date(d); cell.setDate(d.getDate() + i)
                      const iso = cell.toISOString().slice(0,10)
                      wk.push(map[iso] || ({ date: iso } as AssignmentMeta))
                    }
                    monthWeeks.push(wk)
                  }
                  const filteredWeeks = monthWeeks.filter(wk => new Date(wk[0].date).getMonth() === month)
                  return filteredWeeks.map((week, wi) => {
                    const segments: { start: number; length: number; staffId?: string }[] = []
                    let segStart = -1; let segStaff: string | undefined = undefined
                    for (let i = 0; i < week.length; i++) {
                      const cell = week[i]
                      if (cell && cell.staffId) {
                        if (segStart === -1) { segStart = i; segStaff = cell.staffId }
                        else if (segStaff !== cell.staffId) { segments.push({ start: segStart, length: i - segStart, staffId: segStaff }); segStart = i; segStaff = cell.staffId }
                      } else {
                        if (segStart !== -1) { segments.push({ start: segStart, length: i - segStart, staffId: segStaff }); segStart = -1; segStaff = undefined }
                      }
                    }
                    if (segStart !== -1) segments.push({ start: segStart, length: week.length - segStart, staffId: segStaff })
                    return (
                      <div key={wi} className="relative" role="row">
                        {(() => {
                          const multi = segments.filter(s => (s.length || 0) > 1)
                          if (multi.length === 0) return null
                          return (
                            <div className="absolute inset-0 pointer-events-none oncall-overlay">
                              <div className="overlay-grid h-full w-full">
                                {multi.map((s, si) => {
                                  if (!s.staffId) return null
                                  const color = staff?.find(x => x.id === s.staffId)?.color || 'rgba(124,58,237,0.6)'
                                  const colStart = s.start + 1
                                  const colEnd = s.start + s.length + 1
                                  const staffObj = staff?.find(x => x.id === s.staffId)
                                  const label = staffObj?.name ? `${staffObj.name} oncall` : `${s.staffId} oncall`
                                  const startIso = week[colStart - 1]?.date
                                  const endIso = week[colEnd - 2]?.date
                                  return (
                                    <div key={si}
                                      className="oncall-bar"
                                      style={{ gridColumn: `${colStart} / ${colEnd}`, background: color, cursor: 'pointer' }}
                                      role="button"
                                      aria-label={`${label} from ${startIso} to ${endIso}`}
                                      onClick={() => onEditEntry?.(startIso, endIso, s.staffId)}
                                    >
                                      <div className="oncall-label">{label}</div>
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          )
                        })()}
                        <div className="grid grid-cols-7 gap-1" role="presentation">
                          {week.map((d, idx) => {
                            const staffObj = staff?.find(s => s.id === d.staffId)
                            const tooltip = d.holiday ? 'Holiday' : d.staffId ? `${staffObj?.name || d.staffId}` : 'No assignment'
                            const coveredByMulti = segments.some(s => (s.length || 0) > 1 && idx >= s.start && idx < s.start + (s.length || 0))
                            const today = new Date().toISOString().slice(0,10) === d.date
                            return (
                              <button key={d.date} onClick={() => d.staffId ? onEditEntry?.(d.date, d.date, d.staffId) : onDayClick?.(d.date)} className={`relative p-0.5 border rounded text-xxs bg-white text-left mini-day ${d.holiday ? 'holiday' : ''} ${today ? 'today' : ''}`} data-tooltip={tooltip} aria-label={`Date ${d.date}. ${today ? 'Today. ' : ''}${d.holiday ? 'Holiday.' : d.staffId ? `Assigned to ${d.staffId}.` : 'No assignment.'}`}>
                                <div className="day-number text-xxs font-mono">{new Date(d.date).getDate()}</div>
                                <div className="mt-0.5">{d.holiday ? null : d.staffId ? null : <span className="text-gray-400">·</span>}</div>
                                {!coveredByMulti && d.staffId && (
                                  <div className="in-cell-pill" style={{ background: staffObj?.color || 'rgba(124,58,237,0.8)' }}>
                                    <div className="oncall-label">{staffObj?.name || d.staffId}</div>
                                  </div>
                                )}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })
                })()}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if ((monthsToShow === 3 || monthsToShow === 6) && rangeStart) {
    const rs = new Date(rangeStart)
    const count = monthsToShow === 6 ? 6 : 3
    const months: { year: number; month: number; days: AssignmentMeta[] }[] = []
    for (let i = 0; i < count; i++) {
      const m = new Date(rs.getFullYear(), rs.getMonth() + i, 1)
      const year = m.getFullYear(), month = m.getMonth()
      const days: AssignmentMeta[] = []
      const lastDay = new Date(year, month + 1, 0).getDate()
      for (let d = 1; d <= lastDay; d++) {
        const iso = new Date(year, month, d).toISOString().slice(0,10)
        days.push(map[iso] || ({ date: iso } as AssignmentMeta))
      }
      months.push({ year, month, days })
    }

    return (
      <div className="mt-4">
        <div className={`compact-months ${monthsToShow === 6 ? 'six-months' : 'flex gap-3'}`} role="grid" aria-label={`${count} month compact view`}>
          {months.map((mBlock, idx) => (
            <div key={idx} className="mini-month card p-2" role="group" aria-label={`${mBlock.year}-${mBlock.month+1}`}>
              <div className="text-sm font-semibold mb-1">{new Date(mBlock.year, mBlock.month, 1).toLocaleString(undefined,{ month: 'long', year: 'numeric' })}</div>
              <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium">
                {weekdayHeader().map(h => <div key={h} className="p-0.5">{h.slice(0,1)}</div>)}
              </div>
              <div className="mt-1 space-y-1">
                {
                  // build weeks for this month block (Sunday-start full weeks)
                  (() => {
                    const year = mBlock.year, month = mBlock.month
                    const firstDay = new Date(year, month, 1)
                    const lastDay = new Date(year, month + 1, 0)
                    const start = new Date(firstDay)
                    while (start.getDay() !== 0) start.setDate(start.getDate() - 1)
                    const end = new Date(lastDay)
                    while (end.getDay() !== 6) end.setDate(end.getDate() + 1)
                    const monthWeeks: AssignmentMeta[][] = []
                    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 7)) {
                      const wk: AssignmentMeta[] = []
                      for (let i = 0; i < 7; i++) {
                        const cell = new Date(d)
                        cell.setDate(d.getDate() + i)
                        const iso = cell.toISOString().slice(0,10)
                        wk.push(map[iso] || ({ date: iso } as AssignmentMeta))
                      }
                      monthWeeks.push(wk)
                    }
                    // Ensure a week is only shown in one month by owning the week via Sunday's month
                    const filteredWeeks = monthWeeks.filter(wk => new Date(wk[0].date).getMonth() === month)
                    return filteredWeeks.map((week, wi) => {
                      // compute segments for this week
                      const segments: { start: number; length: number; staffId?: string }[] = []
                      let segStart = -1; let segStaff: string | undefined = undefined
                      for (let i = 0; i < week.length; i++) {
                        const cell = week[i]
                        if (cell && cell.staffId) {
                          if (segStart === -1) { segStart = i; segStaff = cell.staffId }
                          else if (segStaff !== cell.staffId) { segments.push({ start: segStart, length: i - segStart, staffId: segStaff }); segStart = i; segStaff = cell.staffId }
                        } else {
                          if (segStart !== -1) { segments.push({ start: segStart, length: i - segStart, staffId: segStaff }); segStart = -1; segStaff = undefined }
                        }
                      }
                      if (segStart !== -1) segments.push({ start: segStart, length: week.length - segStart, staffId: segStaff })

                      return (
                          <div key={wi} className="relative" role="row">

                            {(() => {
                              const multi = segments.filter(s => (s.length || 0) > 1)
                              if (multi.length === 0) return null
                              return (
                                <div className="absolute inset-0 pointer-events-none oncall-overlay">
                                  <div className="overlay-grid h-full w-full">
                                    {multi.map((s, si) => {
                                      if (!s.staffId) return null
                                      const color = staff?.find(x => x.id === s.staffId)?.color || 'rgba(124,58,237,0.6)'
                                      const colStart = s.start + 1
                                      const colEnd = s.start + s.length + 1
                                      const staffObj = staff?.find(x => x.id === s.staffId)
                                      const label = staffObj?.name ? `${staffObj.name} oncall` : `${s.staffId} oncall`
                                      const startIso = week[colStart - 1]?.date
                                      const endIso = week[colEnd - 2]?.date
                                      return (
                                        <div key={si}
                                          className="oncall-bar"
                                          style={{ gridColumn: `${colStart} / ${colEnd}`, background: color, cursor: 'pointer' }}
                                          role="button"
                                          aria-label={`${label} from ${startIso} to ${endIso}`}
                                          onClick={() => {
                                            try {
                                              const staffId = s.staffId
                                              // temporary debug logging to inspect map entries across month boundary
                                              console.log('overlay-click debug', { startIso, endIso, staffId })
                                              console.log('map 2025-10-01..2025-10-04:', map['2025-10-01'], map['2025-10-02'], map['2025-10-03'], map['2025-10-04'])
                                              if (!staffId) return
                                              const safeIso = (d: Date) => {
                                                if (isNaN(d.getTime())) return null
                                                return d.toISOString().slice(0,10)
                                              }
                                              let sDate = new Date(startIso)
                                              let eDate = new Date(endIso)
                                              // expand left safely
                                              let p = new Date(sDate)
                                              p.setDate(p.getDate() - 1)
                                              while (true) {
                                                const iso = safeIso(p)
                                                if (!iso) break
                                                const entry = map[iso]
                                                if (!entry || entry.staffId !== staffId) break
                                                sDate = new Date(p)
                                                p.setDate(p.getDate() - 1)
                                              }
                                              // expand right safely
                                              let n = new Date(eDate)
                                              n.setDate(n.getDate() + 1)
                                              while (true) {
                                                const iso = safeIso(n)
                                                if (!iso) break
                                                const entry = map[iso]
                                                if (!entry || entry.staffId !== staffId) break
                                                eDate = new Date(n)
                                                n.setDate(n.getDate() + 1)
                                              }
                                              const fullStart = safeIso(sDate) || startIso
                                              const fullEnd = safeIso(eDate) || endIso
                                              onEditEntry?.(fullStart, fullEnd, staffId)
                                            } catch (err) {
                                              // fallback to original range if expansion fails
                                              onEditEntry?.(startIso, endIso, s.staffId)
                                            }
                                          }}
                                        >
                                          <div className="oncall-label">{label}</div>
                                        </div>
                                      )
                                    })}
                                  </div>
                                </div>
                              )
                            })()}

                            <div className="grid grid-cols-7 gap-1" role="presentation">
                                {week.map((d, idx) => {
                                const staffObj = staff?.find(s => s.id === d.staffId)
                                const tooltip = d.holiday ? 'Holiday' : d.staffId ? `${staffObj?.name || d.staffId}` : 'No assignment'
                                const coveredByMulti = segments.some(s => (s.length || 0) > 1 && idx >= s.start && idx < s.start + (s.length || 0))
                                return (
                                    <button
                                    key={d.date}
                                    onClick={() => {
                                      if (d.staffId) {
                                        // detect contiguous range for this staff in this month-week
                                        // simple expand left/right within week
                                        let startIdx = idx, endIdx = idx
                                        while (startIdx > 0 && week[startIdx-1].staffId === d.staffId) startIdx--
                                        while (endIdx < week.length-1 && week[endIdx+1].staffId === d.staffId) endIdx++
                                        const startIso = week[startIdx].date
                                        const endIso = week[endIdx].date
                                        onEditEntry?.(startIso, endIso, d.staffId)
                                      } else onDayClick?.(d.date)
                                    }}
                                    onDragOver={(e: any) => e.preventDefault && e.preventDefault()}
                                    onDrop={(e: any) => {
                                      e.preventDefault && e.preventDefault()
                                      const sid = e.dataTransfer?.getData('text/plain')
                                      if (sid) onDropAssign?.(d.date, sid)
                                    }}
                                    className={`relative p-0.5 border rounded text-xxs bg-white text-left mini-day ${d.holiday ? 'holiday' : ''}`}
                                    aria-label={`Date ${d.date}. ${d.holiday ? `Holiday${d.holiday && (d as any).holidayName ? `: ${(d as any).holidayName}` : ''}.` : d.staffId ? `Assigned to ${d.staffId}.` : 'No assignment.'}`}
                                    data-tooltip={tooltip}
                                  >
                                    <div className="day-number text-xxs font-mono">{new Date(d.date).getDate()}</div>
                                      <div className="mt-0.5">
                                        {d.holiday ? null : d.staffId ? null : <span className="text-gray-400">·</span>}
                                      </div>
                                      {!coveredByMulti && d.staffId && (
                                        <div className="in-cell-pill" style={{ background: staffObj?.color || 'rgba(124,58,237,0.8)' }}>
                                          <div className="oncall-label">{staffObj?.name || d.staffId}</div>
                                        </div>
                                      )}
                                  </button>
                                )
                              })}
                            </div>
                          </div>
                        )
                    })
                  })()
                }
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="mt-4">
      <div role="grid" aria-label="Monthly calendar">
        <div className="grid grid-cols-7 gap-1 text-center font-semibold" role="row">
          {weekdayHeader().map(h => <div key={h} className="p-1" role="columnheader">{h}</div>)}
        </div>
        <div className="mt-2 space-y-1">
          {(() => {
            const anchorMonth = (rangeStart ? new Date(rangeStart) : first).getMonth()
            // Week ownership anchored to Sunday: show week only in the month of its Sunday
            const displayWeeks = weeks.filter(wk => new Date(wk[0].date).getMonth() === anchorMonth)
            return displayWeeks.map((r, ri) => {
            const trailing = 0
            // compute contiguous segments of same staff across this week
            const segments: { start: number; length: number; staffId?: string }[] = []
            let segStart = -1
            let segStaff: string | undefined = undefined
            for (let i = 0; i < r.length; i++) {
              const cell = r[i]
              if (cell && cell.staffId) {
                if (segStart === -1) { segStart = i; segStaff = cell.staffId }
                else if (segStaff !== cell.staffId) { segments.push({ start: segStart, length: i - segStart, staffId: segStaff }); segStart = i; segStaff = cell.staffId }
              } else {
                if (segStart !== -1) { segments.push({ start: segStart, length: i - segStart, staffId: segStaff }); segStart = -1; segStaff = undefined }
              }
            }
            if (segStart !== -1) segments.push({ start: segStart, length: r.length - segStart, staffId: segStaff })

            return (
              <div key={ri} className="relative" role="row">
                {(() => {
                  const multi = segments.filter(s => (s.length || 0) > 1)
                  if (multi.length === 0) return null
                  return (
                    <div className="absolute inset-0 pointer-events-none oncall-overlay">
                      <div className="overlay-grid h-full w-full">
                        {multi.map((s, si) => {
                          if (!s.staffId) return null
                          const color = staff?.find(x => x.id === s.staffId)?.color || 'rgba(124,58,237,0.6)'
                          const staffObj = staff?.find(x => x.id === s.staffId)
                          const label = staffObj?.name ? `${staffObj.name} oncall` : `${s.staffId} oncall`
                          const colStart = s.start + 1
                          const colEnd = s.start + s.length + 1
                          const startIso = r[s.start]?.date
                          const endIso = r[s.start + (s.length || 1) - 1]?.date
                          return (
                            <div key={si}
                              className="oncall-bar"
                              style={{ gridColumn: `${colStart} / ${colEnd}`, background: color, cursor: 'pointer' }}
                              role="button"
                              aria-label={`${label} from ${startIso} to ${endIso}`}
                              onClick={() => onEditEntry?.(startIso, endIso, s.staffId)}
                            >
                              <div className="oncall-label">{label}</div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })()}

                <div className="grid grid-cols-7 gap-1" role="presentation">
                  {r.map((a, ci) => {
                    const staffObj = staff?.find(s => s.id === a.staffId)
                    const coveredBy = segments.some(s => (s.length || 0) > 1 && ci >= s.start && ci < s.start + (s.length || 0))
                    return (
                      <button
                        key={a.date}
                        onClick={() => {
                          if (a.staffId) {
                            // expand contiguous range left/right across days using the map
                            const staffId = a.staffId
                            let s = new Date(a.date)
                            let e = new Date(a.date)
                            const prev = () => { const d = new Date(s); d.setDate(d.getDate() - 1); return d }
                            const next = () => { const d = new Date(e); d.setDate(d.getDate() + 1); return d }
                            // expand left
                            let p = prev()
                            while (map[p.toISOString().slice(0,10)]?.staffId === staffId) {
                              s = new Date(p)
                              p = prev()
                            }
                            // expand right
                            let n = next()
                            while (map[n.toISOString().slice(0,10)]?.staffId === staffId) {
                              e = new Date(n)
                              n = next()
                            }
                            const startIso = s.toISOString().slice(0,10)
                            const endIso = e.toISOString().slice(0,10)
                            onEditEntry?.(startIso, endIso, staffId)
                          } else {
                            onDayClick?.(a.date)
                          }
                        }}
                        onDragOver={(e: any) => { e.preventDefault && e.preventDefault() }}
                        onDragEnter={(e: any) => {
                          e.preventDefault && e.preventDefault()
                          (e.currentTarget as HTMLElement).classList.add('drag-over')
                          const sid = e.dataTransfer?.getData('text/plain')
                          if (sid) onDragAnnounce?.(`Drop ${sid} on ${a.date}`)
                        }}
                        onDragLeave={(e: React.DragEvent<HTMLButtonElement>) => {
                          (e.currentTarget as HTMLElement).classList.remove('drag-over')
                          onDragAnnounce?.(`Left ${a.date}`)
                        }}
                        onDrop={(e: any) => {
                          e.preventDefault && e.preventDefault()
                          (e.currentTarget as HTMLElement).classList.remove('drag-over')
                          const sid = e.dataTransfer?.getData('text/plain')
                          if (sid) {
                            onDropAssign?.(a.date, sid)
                            onDragAnnounce?.(`Assigned ${sid} to ${a.date}`)
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') onDayClick?.(a.date)
                          if (e.key === 'ArrowRight') {
                            const next = document.querySelector(`[data-date="${a.date}"]`)?.nextElementSibling as HTMLElement | null
                            next?.focus()
                          }
                          if (e.key === 'ArrowLeft') {
                            const prev = document.querySelector(`[data-date="${a.date}"]`)?.previousElementSibling as HTMLElement | null
                            prev?.focus()
                          }
                        }}
                        data-date={a.date}
                        className={`relative p-2 border rounded text-sm bg-white text-left card ${(() => {
                          const d = new Date(a.date); const key = `${d.getFullYear()}-${d.getMonth()+1}`
                          return `${firstSundayByMonth[key] === a.date ? 'month-anchor' : ''} ${a.holiday ? 'holiday' : ''}`.trim()
                        })()}`}
                        role="gridcell"
                        aria-label={`Date ${a.date}. ${a.holiday ? `Holiday${a.holiday && (a as any).holidayName ? `: ${(a as any).holidayName}` : ''}.` : a.staffId ? `Assigned to ${a.staffId}.` : 'No assignment.'}`}
                      >
                        <div className="day-number font-mono text-xs">{new Date(a.date).getDate()}</div>
                        <div className="mt-1">
                          {a.holiday ? null : a.staffId ? null : <span className="text-gray-400">—</span>}
                        </div>
                        {!coveredBy && a.staffId && (
                          <div className="in-cell-pill" style={{ background: staff?.find(s => s.id === a.staffId)?.color || 'rgba(124,58,237,0.8)' }}>
                            <div className="oncall-label">{staff?.find(s => s.id === a.staffId)?.name || a.staffId}</div>
                          </div>
                        )}
                        <div className="text-xs mt-1">
                          {a.leave && <span className="mr-2 text-orange-600">leave</span>}
                          {a.needs_review && <span className="mr-2 text-red-600">needs_review</span>}
                        </div>
                      </button>
                    )
                  })}
                  {Array.from({ length: trailing }).map((_, i) => <div key={`t${i}`} />)}
                </div>
              </div>
            )
            })
          })()}
        </div>
      </div>
    </div>
  )
}
