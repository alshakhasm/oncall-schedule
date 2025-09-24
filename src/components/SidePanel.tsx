import React from 'react'
import { Staff } from '../lib/scheduler'

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
  const [color, setColor] = React.useState('#7c3aed')
  return (
  <div className="p-4 border-r card">
      <div className="flex items-center justify-between">
        <h2 className="font-bold">Staff</h2>
        <label className="text-xs flex items-center gap-1"><input type="checkbox" checked={!!autoSchedule} onChange={e => onToggleAuto?.(e.target.checked)} /> Auto schedule</label>
      </div>
      <ul className="mt-2 space-y-1">
        {staff.map(s => (
          <li key={s.id} className="text-sm flex items-center gap-2 justify-between">
            <div className="flex items-center gap-2">
              <button draggable onDragStart={e => e.dataTransfer?.setData('text/plain', s.id)} className="w-6 h-6 rounded-full" style={{ background: s.color || '#888' }} aria-label={`Drag ${s.name}`} />
              <div>
                <div className="font-medium">{s.name}</div>
                <div className="text-xs text-gray-500">{s.id}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input aria-label={`color for ${s.name}`} type="color" value={s.color || '#888888'} onChange={e => onUpdateStaff?.({ ...s, color: e.target.value })} />
              <button className="text-xs text-red-600" onClick={() => onRemoveStaff?.(s.id)} aria-label={`Remove ${s.name}`}>Remove</button>
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-3 flex gap-2">
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Name" className="border p-2 text-sm flex-1" />
        <input aria-label="color" value={color} onChange={e => setColor(e.target.value)} type="color" className="w-12 h-10 p-0 border" />
        <button className="p-2 bg-estheric-500 text-white text-sm rounded" onClick={() => { if (name.trim()) { onAddStaff({ id: name.trim().slice(0,3), name: name.trim(), color }); setName('') } }}>Add</button>
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
          <div className="flex gap-2 items-center">
            <input ref={startRef} type="date" aria-label="holiday start" value={holidayStart} onChange={e => setHolidayStart(e.target.value)} className="sr-only" />
            <button aria-label="Pick holiday start" title="Pick holiday start" className="p-2 border rounded" onClick={() => { const el = startRef.current; if (!el) return; if ((el as any).showPicker) try { (el as any).showPicker(); return } catch {} el.click() }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7 11H9V13H7V11Z" fill="currentColor"/><path d="M11 11H13V13H11V11Z" fill="currentColor"/><path d="M15 11H17V13H15V11Z" fill="currentColor"/><path d="M19 4H18V2H16V4H8V2H6V4H5C3.9 4 3 4.9 3 6V20C3 21.1 3.9 22 5 22H19C20.1 22 21 21.1 21 20V6C21 4.9 20.1 4 19 4ZM19 20H5V9H19V20Z" fill="currentColor"/></svg>
            </button>

            <input ref={endRef} type="date" aria-label="holiday end" value={holidayEnd} onChange={e => setHolidayEnd(e.target.value)} className="sr-only" />
            <button aria-label="Pick holiday end" title="Pick holiday end" className="p-2 border rounded" onClick={() => { const el = endRef.current; if (!el) return; if ((el as any).showPicker) try { (el as any).showPicker(); return } catch {} el.click() }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7 11H9V13H7V11Z" fill="currentColor"/><path d="M11 11H13V13H11V11Z" fill="currentColor"/><path d="M15 11H17V13H15V11Z" fill="currentColor"/><path d="M19 4H18V2H16V4H8V2H6V4H5C3.9 4 3 4.9 3 6V20C3 21.1 3.9 22 5 22H19C20.1 22 21 21.1 21 20V6C21 4.9 20.1 4 19 4ZM19 20H5V9H19V20Z" fill="currentColor"/></svg>
            </button>
          </div>
          <div className="flex gap-2">
            <button className="p-2 bg-yellow-500 text-white text-sm rounded" onClick={() => {
              if (!holidayStart) return
              const start = new Date(holidayStart)
              const end = holidayEnd ? new Date(holidayEnd) : new Date(holidayStart)
              const dates: string[] = []
              for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                dates.push(d.toISOString().slice(0,10))
              }
              dates.forEach(dt => onAddHoliday?.(dt))
              setHolidayStart('')
              setHolidayEnd('')
            }}>Add</button>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <h3 className="font-semibold">Leaves</h3>
        <div className="mt-2 text-sm">
          <select value={leaveStaff} onChange={e => setLeaveStaff(e.target.value)} className="border p-1">
            {staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <div className="mt-1 flex gap-2">
            <input value={leaveStart} onChange={e => setLeaveStart(e.target.value)} placeholder="start YYYY-MM-DD" className="border p-2 text-sm flex-1" />
            <input value={leaveEnd} onChange={e => setLeaveEnd(e.target.value)} placeholder="end YYYY-MM-DD" className="border p-2 text-sm flex-1" />
          </div>
          <div className="mt-2">
            <button className="p-2 bg-coral-500 text-white text-sm rounded" onClick={() => { if (leaveStaff && leaveStart && leaveEnd) { onAddLeave?.({ staffId: leaveStaff, start: leaveStart, end: leaveEnd }); setLeaveStart(''); setLeaveEnd('') } }}>Add Leave</button>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <button className="p-2 bg-green-600 text-white text-sm w-full" onClick={onExport}>Export CSV</button>
      </div>
      
    </div>
  )
}
