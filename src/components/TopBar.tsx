import React from 'react'

type Props = {
  monthsToShow: number
  onChange: (months: number) => void
  onNavigate?: (direction: 'prev' | 'next') => void
  rangeStart?: string
}

const options = [1, 3, 6]

export default function TopBar({ monthsToShow, onChange, onNavigate, rangeStart }: Props) {
  let monthLabel = ''
  if (rangeStart) {
    const rs = new Date(rangeStart)
    if (monthsToShow && monthsToShow > 1) {
      const endMonth = new Date(rs.getFullYear(), rs.getMonth() + monthsToShow - 1, 1)
      const startLabel = rs.toLocaleString(undefined, { month: 'short' })
      const endLabel = endMonth.toLocaleString(undefined, { month: 'short' })
      const startYear = rs.getFullYear()
      const endYear = endMonth.getFullYear()
      monthLabel = startYear === endYear
        ? `${startLabel}–${endLabel} ${endYear}`
        : `${startLabel} ${startYear} – ${endLabel} ${endYear}`
    } else {
      monthLabel = rs.toLocaleString(undefined, { month: 'long', year: 'numeric' })
    }
  }
  return (
    <div className="topbar card">
      <div className="flex items-center gap-2">
        <button className="nav-btn" aria-label="Previous" onClick={() => onNavigate?.('prev')}>◀</button>
        <div className="font-semibold mx-2">{monthLabel}</div>
        <button className="nav-btn" aria-label="Next" onClick={() => onNavigate?.('next')}>▶</button>
      </div>
      <div role="tablist" aria-label="View range">
        {options.map((opt) => {
          const selected = opt === monthsToShow
              return (
                <button
                  key={opt}
                  role="tab"
                  aria-selected={selected}
                  className={`tab ${selected ? 'tab-selected' : ''}`}
                  onClick={() => onChange(opt)}
                >
                  {opt} month{opt > 1 ? 's' : ''}
                </button>
              )
        })}
      </div>
    </div>
  )
}
