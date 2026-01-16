/**
 * Input Component Types
 */

export type InputVariant = 'default' | 'filled' | 'outline';

export interface InputProps {
  /** Current value */
  value: string;

  /** Change handler */
  onChangeText: (text: string) => void;

  /** Placeholder text */
  placeholder?: string;

  /** Input label */
  label?: string;

  /** Helper text below input */
  helperText?: string;

  /** Error message */
  error?: string;

  /** Visual style variant */
  variant?: InputVariant;

  /** Whether the input is disabled */
  disabled?: boolean;

  /** Whether the input is required */
  required?: boolean;

  /** Icon to show on the left */
  leftIcon?: React.ReactNode;

  /** Icon to show on the right */
  rightIcon?: React.ReactNode;

  /** Keyboard type */
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad' | 'decimal-pad';

  /** Auto-capitalize behavior */
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';

  /** Whether to autocorrect */
  autoCorrect?: boolean;

  /** Auto-complete hint */
  autoComplete?: string;

  /** Whether this is a secure (password) field */
  secureTextEntry?: boolean;

  /** Maximum length */
  maxLength?: number;

  /** Whether multiline */
  multiline?: boolean;

  /** Number of lines for multiline */
  numberOfLines?: number;

  /** Return key type */
  returnKeyType?: 'done' | 'go' | 'next' | 'search' | 'send';

  /** Submit handler */
  onSubmitEditing?: () => void;

  /** Focus handler */
  onFocus?: () => void;

  /** Blur handler */
  onBlur?: () => void;

  /** Additional style overrides */
  style?: any;

  /** Test ID for testing */
  testID?: string;
}
