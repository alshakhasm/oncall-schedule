import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import SidePanel from './SidePanel'
import { Staff } from '../lib/scheduler'

function setup(initial: Staff[] = [{ id: 'A', name: 'Alice', color: '#7c3aed' }]) {
  const onAddStaff = vi.fn()
  const onExport = vi.fn()
  const onAddHoliday = vi.fn()
  const onRemoveHoliday = vi.fn()
  const onAddLeave = vi.fn()
  const onUpdateStaff = vi.fn()
  const onRemoveStaff = vi.fn()
  const onToggleAuto = vi.fn()

  render(
    <SidePanel
      staff={initial}
      onAddStaff={onAddStaff}
      onExport={onExport}
      holidays={[]}
      onAddHoliday={onAddHoliday}
      onRemoveHoliday={onRemoveHoliday}
      onAddLeave={onAddLeave}
      onUpdateStaff={onUpdateStaff}
      onRemoveStaff={onRemoveStaff}
      autoSchedule={false}
      onToggleAuto={onToggleAuto}
    />
  )
  return { onAddStaff, onExport, onAddHoliday, onRemoveHoliday, onAddLeave, onUpdateStaff, onRemoveStaff, onToggleAuto }
}

describe('SidePanel roster management', () => {
  it('adds a staff member', () => {
    const { onAddStaff } = setup([])
    const name = screen.getByPlaceholderText('Name') as HTMLInputElement
    fireEvent.change(name, { target: { value: 'Bob' } })
  const addButtons = screen.getAllByText('Add')
  fireEvent.click(addButtons[0])
    expect(onAddStaff).toHaveBeenCalled()
    const arg = onAddStaff.mock.calls[0][0] as Staff
    expect(arg.name).toBe('Bob')
    expect(arg.id).toBe('Bob'.slice(0,3))
  })

  it('updates staff color', () => {
    const { onUpdateStaff } = setup([{ id: 'A', name: 'Alice', color: '#000000' }])
    const colorPickers = screen.getAllByLabelText(/color for/i) as HTMLInputElement[]
    fireEvent.change(colorPickers[0], { target: { value: '#ff0000' } })
    expect(onUpdateStaff).toHaveBeenCalled()
    const updated = onUpdateStaff.mock.calls[0][0] as Staff
    expect(updated.color).toBe('#ff0000')
  })

  it('removes a staff member', () => {
    const { onRemoveStaff } = setup([{ id: 'X1', name: 'X' } as Staff])
    fireEvent.click(screen.getByRole('button', { name: /Remove/i }))
    expect(onRemoveStaff).toHaveBeenCalledWith('X1')
  })
})
