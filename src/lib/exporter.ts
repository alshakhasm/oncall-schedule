import { Staff, Leave } from './scheduler'

export type ExportState = {
  schemaVersion: number
  createdAt: string
  staff: Staff[]
  holidays: string[]
  leaves: Leave[]
  manualAssignments: Record<string, string>
}


export function toCSV(assignments: { date: string; staffId?: string; staffName?: string; manual?: boolean; holiday?: boolean; leave?: boolean }[]) {
  const rows = ['date,staffId,staffName,manualFlag,holidayFlag,leaveFlag']
  for (const a of assignments) {
    rows.push([
      a.date,
      a.staffId || '',
      a.staffName || '',
      a.manual ? 'true' : 'false',
      a.holiday ? 'true' : 'false',
      a.leave ? 'true' : 'false'
    ].join(','))
  }
  return rows.join('\n')
}
