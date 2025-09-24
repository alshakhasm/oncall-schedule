import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import CalendarGrid from './CalendarGrid'

// Minimal smoke test for six-month view: ensures container renders six months
describe('CalendarGrid six-month view', () => {
	it('renders six mini-month blocks when monthsToShow=6', () => {
		const assignments = [] as any
		// seed with a minimal range to compute start/end; component relies on assignments to determine displayStart
		const seed = [
			{ date: '2025-01-01' },
			{ date: '2025-06-30' },
		] as any
		render(
			<CalendarGrid
				assignments={[...seed]}
				monthsToShow={6}
				rangeStart={'2025-01-01'}
			/>
		)
		const groups = screen.getAllByRole('group')
		// At least six groups (one per month); could include more groups elsewhere, so check >= 6
		expect(groups.length).toBeGreaterThanOrEqual(6)
	})
})
