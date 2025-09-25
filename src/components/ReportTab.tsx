import React from 'react'
import { ReportRow } from '../lib/report'

export function ReportTab({ rows }: { rows: ReportRow[] }) {
  if (!rows || rows.length === 0) return <div className="card p-4 mt-4 text-sm">No data available</div>
  return (
    <div className="card p-4 mt-4" aria-label="On-call report">
      <h2 className="text-lg font-semibold mb-3">Year-To-Date On-Call Coverage</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm border-collapse">
          <thead>
            <tr className="text-left border-b">
              <th className="py-1 pr-4">Staff</th>
              <th className="py-1 pr-4">On-call Days</th>
              <th className="py-1 pr-4">Working Days</th>
              <th className="py-1 pr-4">% Share</th>
              <th className="py-1 pr-4">Deviation</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.staffId} className="border-b last:border-b-0">
                <td className="py-1 pr-4 font-medium">{r.staffName}</td>
                <td className="py-1 pr-4 tabular-nums">{r.onCallDays}</td>
                <td className="py-1 pr-4 tabular-nums">{r.workingDays}</td>
                <td className="py-1 pr-4 tabular-nums">{r.percentShare.toFixed(2)}%</td>
                <td className={`py-1 pr-4 tabular-nums ${r.deviation > 0 ? 'text-emerald-600' : r.deviation < 0 ? 'text-rose-600' : ''}`}>{r.deviation > 0 ? '+' : ''}{r.deviation.toFixed(2)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-gray-600">Working days exclude holidays and each staff member's own leave days. Deviation = % share - equal share.</p>
    </div>
  )
}

export default ReportTab
