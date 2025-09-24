import React from 'react'
import { Staff } from '../lib/scheduler'

export default function DayInspector({ date, staff, value, onAssign, onClose }: { date: string; staff: Staff[]; value?: string; onAssign: (staffId?: string) => void; onClose: () => void }) {
  const [sel, setSel] = React.useState<string | undefined>(value)
  return (
  <div className="fixed right-4 top-16 w-80 p-4 bg-white card">
      <div className="flex justify-between items-center">
        <div className="font-bold">Day: {date}</div>
        <button onClick={onClose} className="text-sm">Close</button>
      </div>
      <div className="mt-2">
        <select value={sel} onChange={e => setSel(e.target.value || undefined)} className="w-full border p-2">
          <option value="">(unassign)</option>
          {staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>
      <div className="mt-2 flex justify-end">
        <button className="p-2 bg-estheric-500 text-white rounded" onClick={() => onAssign(sel)}>Assign</button>
      </div>
    </div>
  )
}
