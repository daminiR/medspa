/**
 * Button Component Types
 */

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  /** Button text content */
  children: React.ReactNode;

  /** Visual style variant */
  variant?: ButtonVariant;

  /** Size of the button */
  size?: ButtonSize;

  /** Whether the button is disabled */
  disabled?: boolean;

  /** Whether to show a loading state */
  loading?: boolean;

  /** Icon to show before the text */
  leftIcon?: React.ReactNode;

  /** Icon to show after the text */
  rightIcon?: React.ReactNode;

  /** Whether the button should take full width */
  fullWidth?: boolean;

  /** Click handler */
  onPress?: () => void;

  /** Additional style overrides */
  style?: any;

  /** Test ID for testing */
  testID?: string;
}
