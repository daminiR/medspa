/**
 * Card Component Types
 */

export interface CardProps {
  /** Card content */
  children: React.ReactNode;

  /** Whether the card is pressable */
  pressable?: boolean;

  /** Press handler for pressable cards */
  onPress?: () => void;

  /** Whether to show shadow */
  shadow?: boolean;

  /** Border radius variant */
  rounded?: 'sm' | 'md' | 'lg' | 'xl';

  /** Padding inside the card */
  padding?: 'none' | 'sm' | 'md' | 'lg';

  /** Background color override */
  backgroundColor?: string;

  /** Border color override */
  borderColor?: string;

  /** Additional style overrides */
  style?: any;

  /** Test ID for testing */
  testID?: string;
}
