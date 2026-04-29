import { render, screen } from '@testing-library/react'
import { expect, test, describe } from 'vitest'

// A simple dummy test to ensure the setup is working
describe('Vitest Setup', () => {
  test('renders a basic component', () => {
    render(<div>SIVRON Dashboard</div>)
    expect(screen.getByText('SIVRON Dashboard')).toBeInTheDocument()
  })

  test('math works', () => {
    expect(1 + 1).toBe(2)
  })
})
