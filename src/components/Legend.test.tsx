import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Legend } from './Legend'

describe('Legend', () => {
  it('should render the search intent label', () => {
    render(<Legend />)

    expect(screen.getByText('Search Intent:')).toBeInTheDocument()
  })

  it('should render all four intent types', () => {
    render(<Legend />)

    expect(screen.getByText('Informational')).toBeInTheDocument()
    expect(screen.getByText('Navigational')).toBeInTheDocument()
    expect(screen.getByText('Transactional')).toBeInTheDocument()
    expect(screen.getByText('Commercial')).toBeInTheDocument()
  })

  it('should render difficulty explanation', () => {
    render(<Legend />)

    expect(screen.getByText('Opacity indicates difficulty: solid = low, faded = high')).toBeInTheDocument()
  })

  it('should apply custom className', () => {
    const { container } = render(<Legend className="custom-class" />)

    const legendDiv = container.firstChild as HTMLElement
    expect(legendDiv.className).toContain('custom-class')
  })

  it('should render color indicators for each intent', () => {
    render(<Legend />)

    expect(screen.getByTestId('legend-color-informational')).toBeInTheDocument()
    expect(screen.getByTestId('legend-color-navigational')).toBeInTheDocument()
    expect(screen.getByTestId('legend-color-transactional')).toBeInTheDocument()
    expect(screen.getByTestId('legend-color-commercial')).toBeInTheDocument()
  })

  it('should apply correct background colors to indicators', () => {
    render(<Legend />)

    const informational = screen.getByTestId('legend-color-informational')
    const navigational = screen.getByTestId('legend-color-navigational')
    const transactional = screen.getByTestId('legend-color-transactional')
    const commercial = screen.getByTestId('legend-color-commercial')

    expect(informational).toHaveStyle({ backgroundColor: '#6d5dfc' })
    expect(navigational).toHaveStyle({ backgroundColor: '#00b4d8' })
    expect(transactional).toHaveStyle({ backgroundColor: '#2ecc71' })
    expect(commercial).toHaveStyle({ backgroundColor: '#f39c12' })
  })

  it('should have default empty className when not provided', () => {
    const { container } = render(<Legend />)

    const legendDiv = container.firstChild as HTMLElement
    expect(legendDiv.className).toContain('flex')
    expect(legendDiv.className).toContain('flex-wrap')
  })
})
