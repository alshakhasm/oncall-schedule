import React from 'react'
import { render, screen } from '@testing-library/react'
import CalendarGrid from './CalendarGrid'
import { AssignmentMeta } from '../lib/scheduler'

test('renders compact 3-month view', () => {
  const start = '2025-01-01'
  const assignments: AssignmentMeta[] = [
    { date: '2025-01-03', staffId: 'A' },
    { date: '2025-02-14', staffId: 'B' },
    { date: '2025-03-01', staffId: 'A' },
  ]
  render(<CalendarGrid assignments={assignments} rangeStart={start} monthsToShow={3} />)
  // expect three mini-month headers
  expect(screen.getByText(/January 2025/)).toBeTruthy()
  expect(screen.getByText(/February 2025/)).toBeTruthy()
  expect(screen.getByText(/March 2025/)).toBeTruthy()
})
