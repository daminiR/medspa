/**
 * FloatingToolbar Component Tests
 */

/// <reference types="@testing-library/jest-dom" />

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { FloatingToolbar, FloatingToolbarProps } from '../FloatingToolbar'

// ============================================================================
// TEST DATA
// ============================================================================

const mockProducts = [
  {
    id: 'botox-1',
    name: 'Cosmetic',
    brand: 'Botox',
    type: 'neurotoxin' as const
  },
  {
    id: 'juvederm-1',
    name: 'Ultra Plus',
    brand: 'Juvederm',
    type: 'filler' as const
  },
  {
    id: 'dysport-1',
    name: 'Dysport',
    brand: 'Dysport',
    type: 'neurotoxin' as const
  }
]

const mockDosageOptions = [1, 2, 5, 10, 15, 20]

const mockColorOptions = [
  '#9333EA', // Purple
  '#EC4899', // Pink
  '#EF4444', // Red
  '#10B981', // Green
  '#3B82F6', // Blue
  '#F59E0B'  // Amber
]

const defaultProps: FloatingToolbarProps = {
  products: mockProducts,
  onProductSelect: vi.fn(),
  dosageType: 'units',
  dosageOptions: mockDosageOptions,
  onDosageSelect: vi.fn(),
  colorOptions: mockColorOptions,
  onColorSelect: vi.fn(),
  autoHideDelay: 3000,
  initialPosition: { x: 20, y: 100 }
}

// ============================================================================
// TESTS
// ============================================================================

describe('FloatingToolbar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllTimers()
  })

  // ==========================================================================
  // RENDERING
  // ==========================================================================

  describe('Rendering', () => {
    it('renders the toolbar with correct title', () => {
      render(<FloatingToolbar {...defaultProps} />)
      expect(screen.getByText('Charting Tools')).toBeInTheDocument()
    })

    it('renders all products', () => {
      render(<FloatingToolbar {...defaultProps} />)
      expect(screen.getByText('Botox')).toBeInTheDocument()
      expect(screen.getByText('Juvederm')).toBeInTheDocument()
      expect(screen.getByText('Dysport')).toBeInTheDocument()
    })

    it('renders all dosage options', () => {
      render(<FloatingToolbar {...defaultProps} />)
      mockDosageOptions.forEach(dosage => {
        expect(screen.getByText(dosage.toString())).toBeInTheDocument()
      })
    })

    it('renders all color options', () => {
      const { container } = render(<FloatingToolbar {...defaultProps} />)
      const colorButtons = container.querySelectorAll('[style*="background-color"]')
      expect(colorButtons.length).toBeGreaterThanOrEqual(mockColorOptions.length)
    })

    it('displays correct dosage type label', () => {
      render(<FloatingToolbar {...defaultProps} />)
      expect(screen.getByText(/units/i)).toBeInTheDocument()
    })

    it('displays ml label when dosageType is ml', () => {
      render(<FloatingToolbar {...defaultProps} dosageType="ml" />)
      expect(screen.getByText(/ml/i)).toBeInTheDocument()
    })
  })

  // ==========================================================================
  // INTERACTIONS
  // ==========================================================================

  describe('Product Selection', () => {
    it('calls onProductSelect when product is clicked', () => {
      const onProductSelect = vi.fn()
      render(<FloatingToolbar {...defaultProps} onProductSelect={onProductSelect} />)

      const botoxButton = screen.getByText('Botox').closest('button')
      fireEvent.click(botoxButton!)

      expect(onProductSelect).toHaveBeenCalledWith('botox-1')
    })

    it('highlights selected product', () => {
      const { container } = render(
        <FloatingToolbar {...defaultProps} selectedProductId="botox-1" />
      )

      const botoxButton = screen.getByText('Botox').closest('button')
      expect(botoxButton).toHaveClass('bg-gradient-to-br')
    })

    it('shows different gradient for different product types', () => {
      const { rerender, container } = render(
        <FloatingToolbar {...defaultProps} selectedProductId="botox-1" />
      )

      const botoxButton = screen.getByText('Botox').closest('button')
      expect(botoxButton?.className).toContain('purple')

      rerender(<FloatingToolbar {...defaultProps} selectedProductId="juvederm-1" />)

      const juvedermButton = screen.getByText('Juvederm').closest('button')
      expect(juvedermButton?.className).toContain('pink')
    })
  })

  describe('Dosage Selection', () => {
    it('calls onDosageSelect when dosage is clicked', () => {
      const onDosageSelect = vi.fn()
      render(<FloatingToolbar {...defaultProps} onDosageSelect={onDosageSelect} />)

      const dosageButton = screen.getByText('10').closest('button')
      fireEvent.click(dosageButton!)

      expect(onDosageSelect).toHaveBeenCalledWith(10)
    })

    it('highlights selected dosage', () => {
      render(<FloatingToolbar {...defaultProps} selectedDosage={10} />)

      const dosageButton = screen.getByText('10').closest('button')
      expect(dosageButton).toHaveClass('bg-gradient-to-br')
    })

    it('formats ml dosages correctly', () => {
      const mlOptions = [0.1, 0.5, 1.0, 2.0]
      render(
        <FloatingToolbar
          {...defaultProps}
          dosageType="ml"
          dosageOptions={mlOptions}
        />
      )

      expect(screen.getByText('0.10')).toBeInTheDocument()
      expect(screen.getByText('0.5')).toBeInTheDocument()
      expect(screen.getByText('1.0')).toBeInTheDocument()
    })
  })

  describe('Color Selection', () => {
    it('calls onColorSelect when color is clicked', () => {
      const onColorSelect = vi.fn()
      const { container } = render(
        <FloatingToolbar {...defaultProps} onColorSelect={onColorSelect} />
      )

      const colorButtons = container.querySelectorAll('[style*="background-color"]')
      fireEvent.click(colorButtons[0])

      expect(onColorSelect).toHaveBeenCalled()
    })

    it('shows checkmark on selected color', () => {
      const { container } = render(
        <FloatingToolbar {...defaultProps} selectedColor="#9333EA" />
      )

      // Check for SVG checkmark
      const svgs = container.querySelectorAll('svg')
      expect(svgs.length).toBeGreaterThan(0)
    })
  })

  // ==========================================================================
  // COLLAPSE/EXPAND
  // ==========================================================================

  describe('Collapse/Expand', () => {
    it('collapses when collapse button is clicked', () => {
      render(<FloatingToolbar {...defaultProps} />)

      const collapseButton = screen.getByTitle(/collapse/i)
      fireEvent.click(collapseButton)

      // Content should be hidden
      expect(screen.queryByText('Product')).not.toBeInTheDocument()
    })

    it('expands when expand button is clicked', () => {
      render(<FloatingToolbar {...defaultProps} />)

      // Collapse first
      const collapseButton = screen.getByTitle(/collapse/i)
      fireEvent.click(collapseButton)

      // Then expand
      const expandButton = screen.getByTitle(/expand/i)
      fireEvent.click(expandButton)

      // Content should be visible
      expect(screen.getByText('Product')).toBeInTheDocument()
    })

    it('displays correct icon when collapsed', () => {
      render(<FloatingToolbar {...defaultProps} />)

      const collapseButton = screen.getByTitle(/collapse/i)
      expect(collapseButton).toHaveTextContent('−')

      fireEvent.click(collapseButton)
      expect(collapseButton).toHaveTextContent('+')
    })
  })

  // ==========================================================================
  // CLOSE BUTTON
  // ==========================================================================

  describe('Close Functionality', () => {
    it('calls onClose when close button is clicked', () => {
      const onClose = vi.fn()
      render(<FloatingToolbar {...defaultProps} onClose={onClose} />)

      const closeButton = screen.getByTitle(/close/i)
      fireEvent.click(closeButton)

      expect(onClose).toHaveBeenCalled()
    })

    it('does not render close button when onClose is not provided', () => {
      render(<FloatingToolbar {...defaultProps} onClose={undefined} />)

      expect(screen.queryByTitle(/close/i)).not.toBeInTheDocument()
    })
  })

  // ==========================================================================
  // AUTO-HIDE BEHAVIOR
  // ==========================================================================

  describe('Auto-Hide', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('starts visible', () => {
      const { container } = render(<FloatingToolbar {...defaultProps} />)
      const toolbar = container.querySelector('[class*="opacity-100"]')
      expect(toolbar).toBeInTheDocument()
    })

    it('fades after autoHideDelay', () => {
      const { container } = render(<FloatingToolbar {...defaultProps} autoHideDelay={1000} />)

      // Fast-forward time
      vi.advanceTimersByTime(1000)

      // Should have reduced opacity
      const toolbar = container.querySelector('[class*="opacity-30"]')
      expect(toolbar).toBeInTheDocument()
    })

    it('resets timer on mouse enter', () => {
      const { container } = render(<FloatingToolbar {...defaultProps} autoHideDelay={1000} />)

      // Fast-forward almost to hide time
      vi.advanceTimersByTime(900)

      // Trigger mouse enter
      const toolbar = container.firstChild as HTMLElement
      fireEvent.mouseEnter(toolbar)

      // Fast-forward original remaining time
      vi.advanceTimersByTime(100)

      // Should still be visible (timer was reset)
      expect(toolbar).toHaveClass('opacity-100')
    })

    it('resets timer on interaction', () => {
      const { container } = render(<FloatingToolbar {...defaultProps} autoHideDelay={1000} />)

      // Fast-forward to hide
      vi.advanceTimersByTime(1000)

      // Interact with toolbar
      const productButton = screen.getByText('Botox').closest('button')
      fireEvent.click(productButton!)

      // Should be visible again
      const toolbar = container.firstChild as HTMLElement
      expect(toolbar).toHaveClass('opacity-100')
    })
  })

  // ==========================================================================
  // POSITIONING
  // ==========================================================================

  describe('Positioning', () => {
    it('applies initial position', () => {
      const { container } = render(
        <FloatingToolbar {...defaultProps} initialPosition={{ x: 50, y: 150 }} />
      )

      const toolbar = container.firstChild as HTMLElement
      expect(toolbar.style.left).toBe('50px')
      expect(toolbar.style.top).toBe('150px')
    })

    it('has fixed positioning', () => {
      const { container } = render(<FloatingToolbar {...defaultProps} />)

      const toolbar = container.firstChild as HTMLElement
      expect(toolbar).toHaveClass('fixed')
    })

    it('has high z-index', () => {
      const { container } = render(<FloatingToolbar {...defaultProps} />)

      const toolbar = container.firstChild as HTMLElement
      expect(toolbar).toHaveClass('z-50')
    })
  })

  // ==========================================================================
  // ACCESSIBILITY
  // ==========================================================================

  describe('Accessibility', () => {
    it('has aria-label on color buttons', () => {
      const { container } = render(<FloatingToolbar {...defaultProps} />)

      const colorButtons = container.querySelectorAll('[aria-label*="color"]')
      expect(colorButtons.length).toBeGreaterThan(0)
    })

    it('has title attributes on buttons', () => {
      render(<FloatingToolbar {...defaultProps} />)

      expect(screen.getByTitle(/collapse/i)).toBeInTheDocument()
    })

    it('all interactive elements are buttons', () => {
      const { container } = render(<FloatingToolbar {...defaultProps} />)

      const nonButtonInteractive = container.querySelectorAll(
        'div[onclick], span[onclick]'
      )
      expect(nonButtonInteractive.length).toBe(0)
    })
  })

  // ==========================================================================
  // RESPONSIVE DESIGN
  // ==========================================================================

  describe('Responsive Design', () => {
    it('has minimum touch target size', () => {
      const { container } = render(<FloatingToolbar {...defaultProps} />)

      // Check dosage buttons (should be 48px min)
      const dosageButtons = screen.getByText('10').closest('button')
      expect(dosageButtons).toHaveClass('min-h-[48px]')
      expect(dosageButtons).toHaveClass('min-w-[48px]')
    })

    it('uses grid layout for products', () => {
      const { container } = render(<FloatingToolbar {...defaultProps} />)

      const productGrid = screen.getByText('Botox').closest('div')?.parentElement
      expect(productGrid).toHaveClass('grid')
    })

    it('has touch-action none for dragging', () => {
      const { container } = render(<FloatingToolbar {...defaultProps} />)

      const toolbar = container.firstChild as HTMLElement
      expect(toolbar.style.touchAction).toBe('none')
    })
  })
})
