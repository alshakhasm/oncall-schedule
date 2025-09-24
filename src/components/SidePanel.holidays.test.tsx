import { render, screen, fireEvent, within } from '@testing-library/react'
import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import SidePanel from './SidePanel'

function setup(overrides: Partial<React.ComponentProps<typeof SidePanel>> = {}) {
  const onAddHoliday = vi.fn()
  const props: React.ComponentProps<typeof SidePanel> = {
    staff: [],
    onAddStaff: vi.fn(),
    onExport: vi.fn(),
    holidays: [],
    onAddHoliday,
    onRemoveHoliday: vi.fn(),
    onAddLeave: vi.fn(),
    onUpdateStaff: vi.fn(),
    onRemoveStaff: vi.fn(),
    autoSchedule: false,
    onToggleAuto: vi.fn(),
    ...overrides,
  }
  render(<SidePanel {...props} />)
  return { onAddHoliday }
}

// Note: date pickers are hidden and we show read-only text fields; simulate by changing state via input elements internally not accessible.
// We'll interact with the visible read-only inputs to assert values after clicking Clear.

it('disables Add until start is set', () => {
  setup()
  const holidays = screen.getByRole('heading', { name: 'Holidays' }).parentElement as HTMLElement
  const add = within(holidays).getByRole('button', { name: 'Add' }) as HTMLButtonElement
  expect(add.disabled).toBe(true)
})

it('enables Add when only start is set', () => {
  // we cannot type into hidden date input, but we can programmatically set value via the button's click is noop in test.
  // Instead, render with preselected state by overriding component? Not available, so we simulate by selecting start via firing change on hidden input using aria-label.
  setup()
  const startHidden = screen.getByLabelText('holiday start') as HTMLInputElement
  fireEvent.change(startHidden, { target: { value: '2025-09-10' } })
  const holidays = screen.getByRole('heading', { name: 'Holidays' }).parentElement as HTMLElement
  const add = within(holidays).getByRole('button', { name: 'Add' }) as HTMLButtonElement
  expect(add.disabled).toBe(false)
})

it('disables Add when end < start', () => {
  setup()
  const startHidden = screen.getByLabelText('holiday start') as HTMLInputElement
  const endHidden = screen.getByLabelText('holiday end') as HTMLInputElement
  fireEvent.change(startHidden, { target: { value: '2025-09-10' } })
  fireEvent.change(endHidden, { target: { value: '2025-09-09' } })
  const holidays = screen.getByRole('heading', { name: 'Holidays' }).parentElement as HTMLElement
  const add = within(holidays).getByRole('button', { name: 'Add' }) as HTMLButtonElement
  expect(add.disabled).toBe(true)
})

it('adds all dates in range and then clears selection', () => {
  const { onAddHoliday } = setup()
  const startHidden = screen.getByLabelText('holiday start') as HTMLInputElement
  const endHidden = screen.getByLabelText('holiday end') as HTMLInputElement
  fireEvent.change(startHidden, { target: { value: '2025-09-10' } })
  fireEvent.change(endHidden, { target: { value: '2025-09-12' } })
  const holidays = screen.getByRole('heading', { name: 'Holidays' }).parentElement as HTMLElement
  const add = within(holidays).getByRole('button', { name: 'Add' })
  fireEvent.click(add)
  expect(onAddHoliday).toHaveBeenCalledTimes(3)
  expect(onAddHoliday).toHaveBeenNthCalledWith(1, '2025-09-10')
  expect(onAddHoliday).toHaveBeenNthCalledWith(2, '2025-09-11')
  expect(onAddHoliday).toHaveBeenNthCalledWith(3, '2025-09-12')
  // After add, inputs should be cleared
  const startText = screen.getByLabelText('selected holiday start') as HTMLInputElement
  const endText = screen.getByLabelText('selected holiday end') as HTMLInputElement
  expect(startText.value).toBe('')
  expect(endText.value).toBe('')
})

it('clear button resets selection', () => {
  setup()
  const startHidden = screen.getByLabelText('holiday start') as HTMLInputElement
  const endHidden = screen.getByLabelText('holiday end') as HTMLInputElement
  fireEvent.change(startHidden, { target: { value: '2025-09-10' } })
  fireEvent.change(endHidden, { target: { value: '2025-09-12' } })
  const holidays = screen.getByRole('heading', { name: 'Holidays' }).parentElement as HTMLElement
  const clear = within(holidays).getByRole('button', { name: 'Clear holiday selection' })
  fireEvent.click(clear)
  const startText = screen.getByLabelText('selected holiday start') as HTMLInputElement
  const endText = screen.getByLabelText('selected holiday end') as HTMLInputElement
  expect(startText.value).toBe('')
  expect(endText.value).toBe('')
})
