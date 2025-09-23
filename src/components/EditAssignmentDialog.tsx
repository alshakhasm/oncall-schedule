import React from 'react'
import { Staff } from '../lib/scheduler'

export default function EditAssignmentDialog({ open, rangeStart, rangeEnd, staff, selectedStaffId, onSave, onRemove, onClose }: { open: boolean; rangeStart: string; rangeEnd: string; staff: Staff[]; selectedStaffId?: string; onSave: (start: string, end: string, staffId?: string) => void; onRemove: () => void; onClose: () => void; }) {
  const [start, setStart] = React.useState(rangeStart)
  const [end, setEnd] = React.useState(rangeEnd)
  const [sid, setSid] = React.useState<string | undefined>(selectedStaffId)

  React.useEffect(() => {
    setStart(rangeStart); setEnd(rangeEnd); setSid(selectedStaffId)
  }, [open, rangeStart, rangeEnd, selectedStaffId])

  if (!open) return null

  const valid = new Date(start) <= new Date(end)

  return (
    <div className="fixed inset-0 flex items-center justify-center" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black opacity-30" onClick={onClose} style={{ zIndex: 50 }} />
      <div className="bg-white p-4 rounded shadow-lg w-96" style={{ zIndex: 60, position: 'relative' }}>
        <div className="flex justify-between items-center">
          <div className="font-bold">Edit Assignment</div>
          <button onClick={onClose}>Close</button>
        </div>
        <div className="mt-3">
          <label className="block text-sm">Start Date</label>
          <input type="date" value={start} onChange={e => setStart(e.target.value)} className="w-full border p-1" />
        </div>
        <div className="mt-3">
          <label className="block text-sm">End Date</label>
          <input type="date" value={end} onChange={e => setEnd(e.target.value)} className="w-full border p-1" />
        </div>
        <div className="mt-3">
          <label className="block text-sm">Assigned Staff</label>
          <select value={sid || ''} onChange={e => setSid(e.target.value || undefined)} className="w-full border p-1">
            <option value="">(unassign)</option>
            {staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        {!valid && <div className="text-red-600 mt-2">Start date must be before or equal to end date.</div>}
        <div className="mt-4 flex justify-between">
          <button className="px-3 py-1 border rounded" onClick={() => { onRemove(); onClose() }}>Remove</button>
          <div>
            <button className="px-3 py-1 mr-2 border rounded" onClick={onClose}>Cancel</button>
            <button className="px-3 py-1 bg-blue-600 text-white rounded" disabled={!valid} onClick={() => { onSave(start, end, sid); onClose() }}>Save</button>
          </div>
        </div>
      </div>
    </div>
  )
}
