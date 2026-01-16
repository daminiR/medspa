/**
 * Wallet Components Index
 *
 * Exports all wallet-related UI components for Apple Wallet and Google Wallet.
 *
 * Components:
 * - AppleWalletButton: Full-featured button with variants/sizes (iOS only)
 * - AppleWalletBadge: Official Apple Wallet badge style button (iOS only)
 * - InlineWalletButton: Compact button for cards/lists (iOS only)
 * - GoogleWalletButton: Full-featured Google Wallet button (Android)
 * - GoogleWalletIconButton: Compact icon-only button (Android)
 */

// Apple Wallet components
export {
  AppleWalletButton,
  AppleWalletBadge,
  InlineWalletButton,
  type AppleWalletButtonProps,
  type AppleWalletBadgeProps,
  type InlineWalletButtonProps,
} from './AppleWalletButton';

// Google Wallet components
export {
  GoogleWalletButton,
  GoogleWalletIconButton,
  type GoogleWalletButtonProps,
  type GoogleWalletIconButtonProps,
} from './GoogleWalletButton';
