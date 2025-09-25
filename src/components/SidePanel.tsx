import React from 'react'
import { Staff } from '../lib/scheduler'

function genId(name: string) {
  const base = name.replace(/[^A-Za-z0-9]/g,'').toUpperCase().slice(0,3) || 'X'
  const rand = Math.random().toString(36).slice(-4)
  return `${base}-${rand}`
}

export default function SidePanel({ staff, onAddStaff, onExport, holidays, onAddHoliday, onRemoveHoliday, onAddLeave, onUpdateStaff, onRemoveStaff, autoSchedule, onToggleAuto }: { staff: Staff[]; onAddStaff: (s: Staff) => void; onExport: () => void; holidays?: string[]; onAddHoliday?: (d: string) => void; onRemoveHoliday?: (d: string) => void; onAddLeave?: (l: { staffId: string; start: string; end: string }) => void; onUpdateStaff?: (s: Staff) => void; onRemoveStaff?: (id: string) => void; autoSchedule?: boolean; onToggleAuto?: (v: boolean) => void }) {
  const [name, setName] = React.useState('')
  const [holiday, setHoliday] = React.useState('')
  const [holidayStart, setHolidayStart] = React.useState('')
  const [holidayEnd, setHolidayEnd] = React.useState('')
  const startRef = React.useRef<HTMLInputElement | null>(null)
  const endRef = React.useRef<HTMLInputElement | null>(null)
  const [leaveStaff, setLeaveStaff] = React.useState(staff[0]?.id || '')
  const [leaveStart, setLeaveStart] = React.useState('')
  const [leaveEnd, setLeaveEnd] = React.useState('')
  // Ensure selected leaveStaff always points to existing staff
  React.useEffect(() => {
    if (leaveStaff && !staff.find(s => s.id === leaveStaff)) {
      setLeaveStaff(staff[0]?.id || '')
    }
  }, [staff, leaveStaff])
  const [color, setColor] = React.useState('#7c3aed')
  const canAddHoliday = React.useMemo(() => {
    if (!holidayStart) return false
    if (!holidayEnd) return true
    try {
      const s = new Date(holidayStart)
      const e = new Date(holidayEnd)
      return e.getTime() >= s.getTime()
    } catch {
      return false
    }
  }, [holidayStart, holidayEnd])
  return (
  <div className="p-2 border-r card h-full overflow-auto text-xs">
      <div className="flex items-center justify-between">
        <h2 className="font-bold">Staff</h2>
        <label className="flex items-center gap-1"><input type="checkbox" checked={!!autoSchedule} onChange={e => onToggleAuto?.(e.target.checked)} /> Auto schedule</label>
      </div>
      <ul className="mt-2 space-y-1">
        {staff.map(s => (
          <li key={s.id} className="flex items-center gap-2 justify-between">
            <div className="flex items-center gap-2">
              <button draggable onDragStart={e => e.dataTransfer?.setData('text/plain', s.id)} className="w-4 h-4 rounded-full" style={{ background: s.color || '#888' }} aria-label={`Drag ${s.name}`} />
              <div>
                <div className="font-medium">{s.name}</div>
                <div className="text-xs text-gray-500">{s.id}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input aria-label={`color for ${s.name}`} type="color" className="w-6 h-6 p-0 border" value={s.color || '#888888'} onChange={e => onUpdateStaff?.({ ...s, color: e.target.value })} />
              <button className="text-red-600" onClick={() => onRemoveStaff?.(s.id)} aria-label={`Remove ${s.name}`}>Remove</button>
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-3 flex gap-2 min-w-0">
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Name" className="border p-1 flex-1 min-w-0 rounded" />
        <input aria-label="color" value={color} onChange={e => setColor(e.target.value)} type="color" className="w-8 h-6 p-0 border" />
  <button className="px-2 py-1 bg-estheric-500 text-white rounded" onClick={() => { if (name.trim()) { onAddStaff({ id: genId(name.trim()), name: name.trim(), color }); setName('') } }}>Add</button>
      </div>

      <div className="mt-4">
  <h3 className="font-semibold">Holidays</h3>
        <ul className="text-sm mt-1">
          {(() => {
            if (!holidays || holidays.length === 0) return null
            // assume holidays is an array of ISO dates (sorted)
            const sorted = [...holidays].sort()
            type Range = { start: string; end: string; dates: string[] }
            const ranges: Range[] = []
            const dayMs = 24 * 60 * 60 * 1000
            let curRange: Range | null = null
            for (const h of sorted) {
              const d = new Date(h)
              if (!curRange) {
                curRange = { start: h, end: h, dates: [h] }
                continue
              }
              const prev = new Date(curRange.end)
              if (d.getTime() === prev.getTime() + dayMs) {
                curRange.end = h
                curRange.dates.push(h)
              } else {
                ranges.push(curRange)
                curRange = { start: h, end: h, dates: [h] }
              }
            }
            if (curRange) ranges.push(curRange)

            const fmt = (iso: string) => {
              try {
                const d = new Date(iso)
                return d.toLocaleString(undefined, { month: 'short', day: 'numeric' })
              } catch {
                return iso
              }
            }

            return ranges.map(r => (
              <li key={`${r.start}-${r.end}`} className="flex items-center justify-between">
                <span>{r.start === r.end ? fmt(r.start) : `${fmt(r.start)} – ${fmt(r.end)}`}</span>
                <button className="text-xs text-red-600" onClick={() => { r.dates.forEach(dt => onRemoveHoliday?.(dt)) }} aria-label={`Remove holiday range ${fmt(r.start)} to ${fmt(r.end)}`}>Remove</button>
              </li>
            ))
          })()}
        </ul>
        <div className="mt-2 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <input ref={startRef} type="date" aria-label="holiday start" value={holidayStart} onChange={e => setHolidayStart(e.target.value)} className="sr-only" />
            <button aria-label="Pick holiday start" title="Pick holiday start" className="p-1 border rounded" onClick={() => { const el = startRef.current; if (!el) return; if ((el as any).showPicker) try { (el as any).showPicker(); return } catch {} el.click() }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7 11H9V13H7V11Z" fill="currentColor"/><path d="M11 11H13V13H11V11Z" fill="currentColor"/><path d="M15 11H17V13H15V11Z" fill="currentColor"/><path d="M19 4H18V2H16V4H8V2H6V4H5C3.9 4 3 4.9 3 6V20C3 21.1 3.9 22 5 22H19C20.1 22 21 21.1 21 20V6C21 4.9 20.1 4 19 4ZM19 20H5V9H19V20Z" fill="currentColor"/></svg>
            </button>
            <input type="text" aria-label="selected holiday start" placeholder="Start YYYY-MM-DD" value={holidayStart} readOnly className="border p-1 bg-white rounded min-w-0 flex-1" />

            <input ref={endRef} type="date" aria-label="holiday end" value={holidayEnd} onChange={e => setHolidayEnd(e.target.value)} className="sr-only" />
            <button aria-label="Pick holiday end" title="Pick holiday end" className="p-1 border rounded" onClick={() => { const el = endRef.current; if (!el) return; if ((el as any).showPicker) try { (el as any).showPicker(); return } catch {} el.click() }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7 11H9V13H7V11Z" fill="currentColor"/><path d="M11 11H13V13H11V11Z" fill="currentColor"/><path d="M15 11H17V13H15V11Z" fill="currentColor"/><path d="M19 4H18V2H16V4H8V2H6V4H5C3.9 4 3 4.9 3 6V20C3 21.1 3.9 22 5 22H19C20.1 22 21 21.1 21 20V6C21 4.9 20.1 4 19 4ZM19 20H5V9H19V20Z" fill="currentColor"/></svg>
            </button>
            <input type="text" aria-label="selected holiday end" placeholder="End YYYY-MM-DD" value={holidayEnd} readOnly className="border p-1 bg-white rounded min-w-0 flex-1" />
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              className={`px-2 py-1 text-white rounded ${canAddHoliday ? 'bg-yellow-500' : 'bg-gray-300 cursor-not-allowed'}`}
              disabled={!canAddHoliday}
              onClick={() => {
                if (!canAddHoliday) return
                const start = new Date(holidayStart)
                const end = holidayEnd ? new Date(holidayEnd) : new Date(holidayStart)
                if (end.getTime() < start.getTime()) return
                const dates: string[] = []
                for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                  dates.push(d.toISOString().slice(0,10))
                }
                dates.forEach(dt => onAddHoliday?.(dt))
                setHolidayStart('')
                setHolidayEnd('')
              }}
            >Add</button>
            <button
              className="px-2 py-1 border rounded"
              aria-label="Clear holiday selection"
              onClick={() => { setHolidayStart(''); setHolidayEnd('') }}
            >Clear</button>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <h3 className="font-semibold">Leaves</h3>
        <div className="mt-2">
          <div className="flex items-center gap-2">
            <label className="sr-only" htmlFor="leave-staff">Leave staff</label>
            <select id="leave-staff" value={leaveStaff} onChange={e => setLeaveStaff(e.target.value)} className="border p-1 rounded flex-1 min-w-0">
              {staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>

          <div className="mt-2 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <input type="date" aria-label="leave start" value={leaveStart} onChange={e => setLeaveStart(e.target.value)} className="sr-only" />
              <button aria-label="Pick leave start" title="Pick leave start" className="p-1 border rounded" onClick={() => {
                const el = document.querySelector<HTMLInputElement>('input[aria-label="leave start"]');
                if (!el) return; if ((el as any).showPicker) try { (el as any).showPicker(); return } catch {} el.click()
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7 11H9V13H7V11Z" fill="currentColor"/><path d="M11 11H13V13H11V11Z" fill="currentColor"/><path d="M15 11H17V13H15V11Z" fill="currentColor"/><path d="M19 4H18V2H16V4H8V2H6V4H5C3.9 4 3 4.9 3 6V20C3 21.1 3.9 22 5 22H19C20.1 22 21 21.1 21 20V6C21 4.9 20.1 4 19 4ZM19 20H5V9H19V20Z" fill="currentColor"/></svg>
              </button>
              <input type="text" aria-label="selected leave start" placeholder="Start YYYY-MM-DD" value={leaveStart} readOnly className="border p-1 bg-white rounded min-w-0 flex-1" />

              <input type="date" aria-label="leave end" value={leaveEnd} onChange={e => setLeaveEnd(e.target.value)} className="sr-only" />
              <button aria-label="Pick leave end" title="Pick leave end" className="p-1 border rounded" onClick={() => {
                const el = document.querySelector<HTMLInputElement>('input[aria-label="leave end"]');
                if (!el) return; if ((el as any).showPicker) try { (el as any).showPicker(); return } catch {} el.click()
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7 11H9V13H7V11Z" fill="currentColor"/><path d="M11 11H13V13H11V11Z" fill="currentColor"/><path d="M15 11H17V13H15V11Z" fill="currentColor"/><path d="M19 4H18V2H16V4H8V2H6V4H5C3.9 4 3 4.9 3 6V20C3 21.1 3.9 22 5 22H19C20.1 22 21 21.1 21 20V6C21 4.9 20.1 4 19 4ZM19 20H5V9H19V20Z" fill="currentColor"/></svg>
              </button>
              <input type="text" aria-label="selected leave end" placeholder="End YYYY-MM-DD" value={leaveEnd} readOnly className="border p-1 bg-white rounded min-w-0 flex-1" />
            </div>
            <div className="flex gap-2 flex-wrap">
              {(() => {
                const canAddLeave = !!(leaveStaff && leaveStart && leaveEnd && new Date(leaveEnd).getTime() >= new Date(leaveStart).getTime())
                return (
                  <>
                    <button className={`px-2 py-1 text-white rounded ${canAddLeave ? 'bg-coral-500' : 'bg-gray-300 cursor-not-allowed'}`} disabled={!canAddLeave} onClick={() => {
                      if (!canAddLeave) return
                      onAddLeave?.({ staffId: leaveStaff, start: leaveStart, end: leaveEnd })
                      setLeaveStart(''); setLeaveEnd('')
                    }}>Add Leave</button>
                    <button className="px-2 py-1 border rounded" aria-label="Clear leave selection" onClick={() => { setLeaveStart(''); setLeaveEnd('') }}>Clear</button>
                  </>
                )
              })()}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <button className="px-2 py-1 bg-green-600 text-white w-full rounded" onClick={onExport}>Export CSV</button>
      </div>
      
    </div>
  )
}
