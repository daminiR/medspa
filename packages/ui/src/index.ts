/**
 * @medical-spa/ui
 * Shared UI components for Medical Spa Platform
 *
 * This package provides cross-platform UI components that work on:
 * - React Native (iOS/Android)
 * - Next.js (Web)
 *
 * Usage:
 * - Import from '@medical-spa/ui' for shared components
 * - Import from '@medical-spa/ui/native' for React Native specific
 * - Import from '@medical-spa/ui/web' for Next.js specific
 */

// Colors and Theme
export * from './theme/colors';
export * from './theme/spacing';
export * from './theme/typography';

// Shared Types
export type { ButtonProps, ButtonVariant, ButtonSize } from './types/button';
export type { InputProps, InputVariant } from './types/input';
export type { CardProps } from './types/card';
