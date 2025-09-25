import { render, screen, fireEvent, within } from '@testing-library/react'
import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import SidePanel from './SidePanel'

function setup(overrides: Partial<React.ComponentProps<typeof SidePanel>> = {}) {
  const onAddLeave = vi.fn()
  const props: React.ComponentProps<typeof SidePanel> = {
    staff: [{ id: 'A', name: 'Alice' }],
    onAddStaff: vi.fn(),
    onExport: vi.fn(),
    holidays: [],
    onAddHoliday: vi.fn(),
    onRemoveHoliday: vi.fn(),
    onAddLeave,
    onUpdateStaff: vi.fn(),
    onRemoveStaff: vi.fn(),
    autoSchedule: false,
    onToggleAuto: vi.fn(),
    ...overrides,
  }
  render(<SidePanel {...props} />)
  return { onAddLeave }
}

it('disables Add Leave until staff, start and end are set', () => {
  setup()
  const leaves = screen.getByRole('heading', { name: 'Leaves' }).parentElement as HTMLElement
  const add = within(leaves).getByRole('button', { name: 'Add Leave' }) as HTMLButtonElement
  expect(add.disabled).toBe(true)
})

it('enables Add Leave when valid and clears after adding', () => {
  const { onAddLeave } = setup()
  const startHidden = screen.getByLabelText('leave start') as HTMLInputElement
  const endHidden = screen.getByLabelText('leave end') as HTMLInputElement
  fireEvent.change(startHidden, { target: { value: '2025-09-10' } })
  fireEvent.change(endHidden, { target: { value: '2025-09-12' } })
  const leaves = screen.getByRole('heading', { name: 'Leaves' }).parentElement as HTMLElement
  const add = within(leaves).getByRole('button', { name: 'Add Leave' })
  fireEvent.click(add)
  expect(onAddLeave).toHaveBeenCalledWith({ staffId: 'A', start: '2025-09-10', end: '2025-09-12' })
  const startText = screen.getByLabelText('selected leave start') as HTMLInputElement
  const endText = screen.getByLabelText('selected leave end') as HTMLInputElement
  expect(startText.value).toBe('')
  expect(endText.value).toBe('')
})

it('disables Add Leave when end < start and Clear resets', () => {
  setup()
  const startHidden = screen.getByLabelText('leave start') as HTMLInputElement
  const endHidden = screen.getByLabelText('leave end') as HTMLInputElement
  fireEvent.change(startHidden, { target: { value: '2025-09-10' } })
  fireEvent.change(endHidden, { target: { value: '2025-09-09' } })
  const leaves = screen.getByRole('heading', { name: 'Leaves' }).parentElement as HTMLElement
  const add = within(leaves).getByRole('button', { name: 'Add Leave' }) as HTMLButtonElement
  expect(add.disabled).toBe(true)
  const clear = within(leaves).getByRole('button', { name: 'Clear leave selection' })
  fireEvent.click(clear)
  const startText = screen.getByLabelText('selected leave start') as HTMLInputElement
  const endText = screen.getByLabelText('selected leave end') as HTMLInputElement
  expect(startText.value).toBe('')
  expect(endText.value).toBe('')
})
