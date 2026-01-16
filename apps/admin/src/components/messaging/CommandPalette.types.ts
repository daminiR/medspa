/**
 * Type definitions for Command Palette
 *
 * These types can be imported and extended by other components
 * that need to work with the command palette system.
 */

export interface CommandPaletteProps {
  /**
   * Controls whether the command palette modal is visible
   */
  isOpen: boolean

  /**
   * Callback fired when the palette should close
   * (e.g., user presses Escape or clicks backdrop)
   */
  onClose: () => void

  /**
   * Callback fired when a command is executed
   * @param command - The command ID that was executed
   * @param payload - Optional data associated with the command
   */
  onCommand: (command: string, payload?: any) => void

  /**
   * Optional array of recently used command IDs
   * These will be shown at the top of the command list
   * @default []
   */
  recentCommands?: string[]
}

export type CommandCategory = 'actions' | 'navigation' | 'quick-replies' | 'recent'

export interface CommandItem {
  /**
   * Unique identifier for the command
   */
  id: string

  /**
   * Display name of the command
   */
  name: string

  /**
   * Optional description shown below the command name
   */
  description?: string

  /**
   * Category this command belongs to
   */
  category: CommandCategory

  /**
   * Icon to display next to the command
   */
  icon: React.ReactNode

  /**
   * Optional keyboard shortcut (for display only)
   * Examples: '⌘K', '⌘⇧C', 'A', '/'
   */
  shortcut?: string

  /**
   * Function to execute when this command is selected
   */
  action: () => void

  /**
   * Optional keywords for improved search matching
   */
  keywords?: string[]
}

export interface CommandPaletteState {
  /**
   * Current search query
   */
  searchQuery: string

  /**
   * Index of currently selected command
   */
  selectedIndex: number

  /**
   * Whether the palette is currently loading
   */
  isLoading?: boolean
}

export interface CommandGroup {
  /**
   * Category/group name
   */
  category: CommandCategory

  /**
   * Display label for this group
   */
  label: string

  /**
   * Icon for this group
   */
  icon: React.ReactNode

  /**
   * Commands in this group
   */
  commands: CommandItem[]
}

/**
 * Keyboard shortcut configuration
 */
export interface KeyboardShortcut {
  /**
   * Unique ID for this shortcut
   */
  id: string

  /**
   * Display name
   */
  name: string

  /**
   * Key combination (e.g., 'cmd+k', 'ctrl+shift+c')
   */
  keys: string

  /**
   * Command to execute
   */
  commandId: string

  /**
   * Whether this shortcut is enabled
   * @default true
   */
  enabled?: boolean

  /**
   * Whether this shortcut is global (works anywhere)
   * or contextual (only in specific views)
   * @default true
   */
  global?: boolean
}

/**
 * Command execution result
 */
export interface CommandExecutionResult {
  /**
   * Whether the command executed successfully
   */
  success: boolean

  /**
   * Optional message (e.g., error message if failed)
   */
  message?: string

  /**
   * Optional data returned from command execution
   */
  data?: any
}

/**
 * Command palette configuration
 */
export interface CommandPaletteConfig {
  /**
   * Whether to show recent commands section
   * @default true
   */
  showRecent?: boolean

  /**
   * Maximum number of recent commands to show
   * @default 5
   */
  maxRecentCommands?: number

  /**
   * Whether to enable fuzzy search
   * @default false
   */
  fuzzySearch?: boolean

  /**
   * Custom keyboard shortcut to open palette
   * @default 'cmd+k' / 'ctrl+k'
   */
  openShortcut?: string

  /**
   * Whether to blur backdrop
   * @default true
   */
  backdropBlur?: boolean

  /**
   * Animation duration in milliseconds
   * @default 200
   */
  animationDuration?: number
}

/**
 * Hook return type for useCommandPalette
 */
export interface UseCommandPaletteReturn {
  /**
   * Whether the palette is open
   */
  isOpen: boolean

  /**
   * Open the palette
   */
  open: () => void

  /**
   * Close the palette
   */
  close: () => void

  /**
   * Toggle the palette
   */
  toggle: () => void

  /**
   * Execute a command by ID
   */
  executeCommand: (commandId: string, payload?: any) => void

  /**
   * Recent commands
   */
  recentCommands: string[]

  /**
   * Add a command to recent
   */
  addToRecent: (commandId: string) => void

  /**
   * Clear recent commands
   */
  clearRecent: () => void
}
