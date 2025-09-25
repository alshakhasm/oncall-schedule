import React from 'react'
import { computeWeeklyAssignments, Staff, AssignmentMeta } from './lib/scheduler'
import CalendarGrid from './components/CalendarGrid'
import SidePanel from './components/SidePanel'
import TopBar from './components/TopBar'
import { toCSV } from './lib/exporter'
import { computeOnCallReport } from './lib/report'
import ReportTab from './components/ReportTab'
import DayInspector from './components/DayInspector'
import EditAssignmentDialog from './components/EditAssignmentDialog'

const STORAGE_KEY = 'oncall-scheduler-v1'

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function saveState(obj: any) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(obj))
}

export default function App() {
  const [staff, setStaff] = React.useState<Staff[]>(() => loadState()?.staff || [{ id: 'A', name: 'Alice', color: '#7c3aed' }, { id: 'B', name: 'Bob', color: '#059669' }])
  const [rangeStart, setRangeStart] = React.useState<string>(() => loadState()?.rangeStart || '2025-09-01')
  const [rangeEnd, setRangeEnd] = React.useState('2025-09-30')
  const [monthsToShow, setMonthsToShow] = React.useState<number>(() => loadState()?.monthsToShow || 1)
  const [autoSchedule, setAutoSchedule] = React.useState<boolean>(() => loadState()?.autoSchedule ?? false)
  const [holidays, setHolidays] = React.useState<string[]>(() => {
    const raw = (loadState()?.holidays || []) as string[]
    // normalize and dedupe
    const uniq = Array.from(new Set(raw)).sort()
    return uniq as string[]
  })
  const [leaves, setLeaves] = React.useState<any[]>(() => loadState()?.leaves || [])
  const [manual, setManual] = React.useState<Record<string,string>>(() => loadState()?.manualAssignments || {})
  const [inspectorDate, setInspectorDate] = React.useState<string | null>(null)
  const [liveMessage, setLiveMessage] = React.useState('')
  const [editRange, setEditRange] = React.useState<{ start: string; end: string; staffId?: string } | null>(null)

  React.useEffect(() => {
    saveState({ staff, holidays, leaves, manualAssignments: manual, monthsToShow, autoSchedule, rangeStart })
  }, [staff, holidays, leaves, manual, monthsToShow, autoSchedule, rangeStart])

  // Migration: ensure staff IDs are unique; if duplicates found, reassign and update references
  React.useEffect(() => {
    const counts: Record<string, number> = {}
    staff.forEach(s => { counts[s.id] = (counts[s.id] || 0) + 1 })
    const dups = Object.keys(counts).filter(k => counts[k] > 1)
    if (dups.length === 0) return
    const idMap: Record<string, string[]> = {}
    const newStaff: Staff[] = []
    staff.forEach(s => {
      if (!idMap[s.id]) idMap[s.id] = []
      const list = idMap[s.id]
      if (list.length === 0) {
        list.push(s.id)
        newStaff.push(s)
      } else {
        const newId = `${s.id}-${Math.random().toString(36).slice(-3)}`
        list.push(newId)
        newStaff.push({ ...s, id: newId })
      }
    })
    // Build reverse lookup old->new (skip first occurrence which keeps old id)
    const remap: Record<string, string> = {}
    Object.keys(idMap).forEach(orig => {
      const arr = idMap[orig]
      if (arr.length > 1) {
        // arr[0] is original; subsequent correspond to duplicate staff entries
        for (let i = 1; i < arr.length; i++) {
          remap[`${orig}#${i}`] = arr[i]
        }
      }
    })
    // Because we didn't store index markers previously, simpler approach: we only changed duplicate second+ entries; to update manual/leaves we match by name duplication order.
    // For leaves & manual we cannot distinguish duplicates reliably if same id used historically; they will still reference first staff (acceptable trade-off).
    setStaff(newStaff)
  }, [staff])

  // ensure compute range covers the requested monthsToShow starting at rangeStart
  const computedRangeEnd = React.useMemo(() => {
    try {
      const rs = new Date(rangeStart)
      const lastMonth = rs.getMonth() + (monthsToShow || 1) - 1
      // compute last day using UTC to avoid local timezone offsets when serializing
      const lastDayUtc = new Date(Date.UTC(rs.getFullYear(), lastMonth + 1, 0))
      return lastDayUtc.toISOString().slice(0,10)
    } catch {
      return rangeEnd
    }
  }, [rangeStart, monthsToShow, rangeEnd])

  const assignments: AssignmentMeta[] = computeWeeklyAssignments({ staff, rangeStart, rangeEnd: computedRangeEnd, holidays, leaves, manual, auto: autoSchedule })
  const [activeTab, setActiveTab] = React.useState<'calendar' | 'report'>('calendar')
  const reportRows = React.useMemo(() => {
    if (activeTab !== 'report') return []
    return computeOnCallReport({ staff, assignments, holidays, leaves })
  }, [activeTab, staff, assignments, holidays, leaves])

  React.useEffect(() => {
  }, [rangeStart, computedRangeEnd, assignments.length])


  function handleAddStaff(s: Staff) {
    setStaff(prev => [...prev, s])
  }

  function handleAddHoliday(d: string) {
    setHolidays(prev => {
      if (prev.includes(d)) return prev
      return [...prev, d].sort()
    })
    try {
      const dt = new Date(d)
      const rs = `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-01`
      setRangeStart(rs)
    } catch {}
  }

  function handleRemoveHoliday(d: string) {
    setHolidays(prev => prev.filter(h => h !== d))
  }

  function handleAddLeave(l: { staffId: string; start: string; end: string }) {
    setLeaves(prev => [...prev, l])
  }

  function handleAssign(date: string, staffId?: string) {
    setManual(prev => {
      const copy = { ...prev }
      if (staffId) copy[date] = staffId
      else delete copy[date]
      return copy
    })
    setInspectorDate(null)
  }

  function handleEditAssignment(start: string, end: string, staffId?: string) {
    // apply staffId to each day in range, or remove if no staffId
    setManual(prev => {
      const copy = { ...prev }
      for (let d = new Date(start); d <= new Date(end); d.setDate(d.getDate() + 1)) {
        const iso = d.toISOString().slice(0,10)
        if (staffId) copy[iso] = staffId
        else delete copy[iso]
      }
      return copy
    })
  }

  function handleExport() {
    const rows = assignments.map(a => ({ date: a.date, staffId: a.staffId, staffName: staff.find(s => s.id === a.staffId)?.name, manual: a.manual, holiday: a.holiday, leave: a.leave }))
    const csv = toCSV(rows)
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'assignments.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleUpdateStaff(updated: Staff) {
    setStaff(prev => prev.map(s => s.id === updated.id ? updated : s))
  }

  function handleRemoveStaff(id: string) {
    // capture dates currently assigned to this staff in visible range
    const datesToClear = assignments.filter(a => a.staffId === id).map(a => a.date)
    setStaff(prev => prev.filter(s => s.id !== id))
    // remove manual entries pointing to this staff and explicitly unassign their dates
    setManual(prev => {
      const copy = { ...prev }
      for (const k of Object.keys(copy)) if (copy[k] === id) delete copy[k]
      datesToClear.forEach(d => { copy[d] = '' })
      return copy
    })
  }


  return (
    <div className="flex h-screen">
  <div className="w-72 h-screen overflow-hidden">
  <SidePanel staff={staff} onAddStaff={handleAddStaff} onExport={handleExport} holidays={holidays} onAddHoliday={handleAddHoliday} onRemoveHoliday={handleRemoveHoliday} onAddLeave={handleAddLeave} onUpdateStaff={handleUpdateStaff} onRemoveStaff={handleRemoveStaff} autoSchedule={autoSchedule} onToggleAuto={setAutoSchedule} />
    </div>
      <div className="flex-1 p-4 overflow-auto">
        <h1 className="text-2xl font-bold">OnCall Scheduler</h1>
  <TopBar
          monthsToShow={monthsToShow}
          rangeStart={rangeStart}
    activeTab={activeTab}
    onTabChange={setActiveTab}
    onJumpToCurrent={() => {
      const now = new Date()
      const first = new Date(now.getFullYear(), now.getMonth(), 1)
      const formatted = `${first.getFullYear()}-${String(first.getMonth()+1).padStart(2,'0')}-${String(first.getDate()).padStart(2,'0')}`
      setRangeStart(formatted)
    }}
          onChange={(m) => {
            setMonthsToShow(m)
            if (m === 6) {
              // Anchor six-month view to January of the current anchor year
              const rs = new Date(rangeStart)
              const jan = new Date(rs.getFullYear(), 0, 1)
              const formatted = `${jan.getFullYear()}-${String(jan.getMonth()+1).padStart(2,'0')}-${String(jan.getDate()).padStart(2,'0')}`
              setRangeStart(formatted)
            }
          }}
          onNavigate={(dir) => {
            const rs = new Date(rangeStart)
            const step = monthsToShow === 6 ? 6 : 1
            const delta = dir === 'next' ? step : -step
            const newRs = new Date(rs.getFullYear(), rs.getMonth() + delta, 1)
            const formatted = `${newRs.getFullYear()}-${String(newRs.getMonth()+1).padStart(2,'0')}-${String(newRs.getDate()).padStart(2,'0')}`
            setRangeStart(formatted)
          }}
        />
        
  {activeTab === 'calendar' && (
    <>
      <CalendarGrid assignments={assignments} staff={staff} rangeStart={rangeStart} monthsToShow={monthsToShow} onDayClick={d => setInspectorDate(d)} onDropAssign={(date, sid) => handleAssign(date, sid)} onDragAnnounce={m => setLiveMessage(m)} onEditEntry={(s,e,sid) => setEditRange({ start: s, end: e, staffId: sid })} />
      <div aria-live="polite" role="status" className="sr-only" id="drag-live">{liveMessage}</div>
    </>
  )}
  {activeTab === 'report' && (
    <ReportTab rows={reportRows} />
  )}
        
        {inspectorDate && (
          <DayInspector
            date={inspectorDate}
            staff={staff}
            value={manual[inspectorDate]}
            onAssign={(sid) => handleAssign(inspectorDate, sid)}
            onClose={() => setInspectorDate(null)}
          />
        )}
        <EditAssignmentDialog
          open={!!editRange}
          rangeStart={editRange?.start || ''}
          rangeEnd={editRange?.end || ''}
          staff={staff}
          selectedStaffId={editRange?.staffId}
          onSave={(s, e, sid) => {
            // When editing an assignment (auto or manual), convert the original full range into
            // explicit manual overrides so the saved start/end exactly controls the visible pill extent.
            setManual(prev => {
              const copy = { ...prev }
              if (!editRange) {
                // just apply new range
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

              // compute union range to ensure surrounding days are cleared when shrinking
              const unionStart = origStart < newStart ? origStart : newStart
              const unionEnd = origEnd > newEnd ? origEnd : newEnd

              for (let d = new Date(unionStart); d <= unionEnd; d.setDate(d.getDate() + 1)) {
                const iso = d.toISOString().slice(0,10)
                // if this day falls within the new saved range, assign sid (or explicit unassign '')
                if (d >= newStart && d <= newEnd) {
                  if (sid) copy[iso] = sid
                  else copy[iso] = ''
                } else {
                  // outside new range but inside original union -> explicitly unassign
                  copy[iso] = ''
                }
              }

              return copy
            })
            setEditRange(null)
          }}
          onRemove={() => {
            if (!editRange) return
            // set explicit unassign manual entries (empty string) so they are treated as manual overrides
            setManual(prev => {
              const copy = { ...prev }
              for (let d = new Date(editRange.start); d <= new Date(editRange.end); d.setDate(d.getDate() + 1)) {
                const iso = d.toISOString().slice(0,10)
                copy[iso] = ''
              }
              return copy
            })
            setEditRange(null)
          }}
          onClose={() => setEditRange(null)}
        />
      </div>
    </div>
  )
}
