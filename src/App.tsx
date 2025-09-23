import React from 'react'
import { computeWeeklyAssignments, Staff, AssignmentMeta } from './lib/scheduler'
import CalendarGrid from './components/CalendarGrid'
import SidePanel from './components/SidePanel'
import TopBar from './components/TopBar'
import { toCSV } from './lib/exporter'
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
  const [rangeStart, setRangeStart] = React.useState('2025-09-01')
  const [rangeEnd, setRangeEnd] = React.useState('2025-09-30')
  const [monthsToShow, setMonthsToShow] = React.useState<number>(() => loadState()?.monthsToShow || 1)
  const [holidays, setHolidays] = React.useState<string[]>(() => loadState()?.holidays || [])
  const [leaves, setLeaves] = React.useState<any[]>(() => loadState()?.leaves || [])
  const [manual, setManual] = React.useState<Record<string,string>>(() => loadState()?.manualAssignments || {})
  const [inspectorDate, setInspectorDate] = React.useState<string | null>(null)
  const [liveMessage, setLiveMessage] = React.useState('')
  const [editRange, setEditRange] = React.useState<{ start: string; end: string; staffId?: string } | null>(null)

  React.useEffect(() => {
    saveState({ staff, holidays, leaves, manualAssignments: manual, monthsToShow })
  }, [staff, holidays, leaves, manual, monthsToShow])

  const assignments: AssignmentMeta[] = computeWeeklyAssignments({ staff, rangeStart, rangeEnd, holidays, leaves, manual })


  function handleAddStaff(s: Staff) {
    setStaff(prev => [...prev, s])
  }

  function handleAddHoliday(d: string) {
    setHolidays(prev => [...prev, d])
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
    setStaff(prev => prev.filter(s => s.id !== id))
    // also remove manual assignments to this staff
    setManual(prev => {
      const copy = { ...prev }
      for (const k of Object.keys(copy)) if (copy[k] === id) delete copy[k]
      return copy
    })
  }

  return (
    <div className="flex h-screen">
      <div className="w-72">
  <SidePanel staff={staff} onAddStaff={handleAddStaff} onExport={handleExport} holidays={holidays} onAddHoliday={handleAddHoliday} onAddLeave={handleAddLeave} onUpdateStaff={handleUpdateStaff} onRemoveStaff={handleRemoveStaff} />
      </div>
      <div className="flex-1 p-4 overflow-auto">
        <h1 className="text-2xl font-bold">OnCall Scheduler</h1>
        <TopBar monthsToShow={monthsToShow} onChange={m => setMonthsToShow(m)} />
        <div className="mt-2">
          <label className="mr-2">Start</label>
          <input value={rangeStart} onChange={e => setRangeStart(e.target.value)} className="border p-1" />
          <label className="ml-4 mr-2">End</label>
          <input value={rangeEnd} onChange={e => setRangeEnd(e.target.value)} className="border p-1" />
        </div>

  <CalendarGrid assignments={assignments} staff={staff} rangeStart={rangeStart} monthsToShow={monthsToShow} onDayClick={d => setInspectorDate(d)} onDropAssign={(date, sid) => handleAssign(date, sid)} onDragAnnounce={m => setLiveMessage(m)} onEditEntry={(s,e,sid) => setEditRange({ start: s, end: e, staffId: sid })} />
  <div aria-live="polite" role="status" className="sr-only" id="drag-live">{liveMessage}</div>
        
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
          onSave={(s,e,sid) => handleEditAssignment(s,e,sid)}
          onRemove={() => { if (editRange) handleEditAssignment(editRange.start, editRange.end, undefined) }}
          onClose={() => setEditRange(null)}
        />
      </div>
    </div>
  )
}
