/**
 * AppleWalletButton Component
 *
 * A styled button component for adding appointments to Apple Wallet.
 * Follows Apple's Human Interface Guidelines for the "Add to Apple Wallet" button.
 *
 * Features:
 * - Official Apple Wallet badge styling (black and outline variants)
 * - Three size options (small, medium, large)
 * - Loading state with ActivityIndicator during pass generation
 * - Success state with checkmark feedback
 * - Error handling with user-friendly Alert dialogs
 * - Platform detection (only renders on iOS)
 * - Haptic feedback (impact on press, success/error notifications)
 * - Animated press states with spring animation
 * - Full accessibility support
 *
 * Components exported:
 * - AppleWalletButton: Full button with customizable variants/sizes
 * - AppleWalletBadge: Official-looking badge style button
 * - InlineWalletButton: Compact version for cards/lists
 *
 * @see https://developer.apple.com/design/human-interface-guidelines/wallet
 */

import React, { useState, useCallback } from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from 'react-native-reanimated';

import {
  addToAppleWallet,
  isAppleWalletAvailable,
  type AppointmentDetails,
} from '../../services/wallet';

// ============================================================================
// Types
// ============================================================================

/**
 * Props for the main AppleWalletButton component.
 */
export interface AppleWalletButtonProps {
  /**
   * The appointment ID to generate a pass for.
   * Required - used to fetch appointment details if not provided.
   */
  appointmentId: string;

  /**
   * Optional pre-fetched appointment details.
   * If provided, avoids an extra API call to fetch appointment data.
   */
  appointmentDetails?: AppointmentDetails;

  /**
   * Button visual variant following Apple's guidelines.
   * - 'black': Black background with white text (default, recommended)
   * - 'outline': White/transparent background with black border
   * @default 'black'
   */
  variant?: 'black' | 'outline';

  /**
   * Button size preset.
   * - 'small': Compact size for tight spaces (height: 36px)
   * - 'medium': Standard size (height: 44px, recommended)
   * - 'large': Prominent size for CTAs (height: 52px)
   * @default 'medium'
   */
  size?: 'small' | 'medium' | 'large';

  /**
   * Custom button container style.
   * Applied after variant/size styles.
   */
  style?: ViewStyle;

  /**
   * Custom text style for the button label.
   */
  textStyle?: TextStyle;

  /**
   * Callback fired when pass is successfully added to wallet.
   * Use for analytics, UI updates, or navigation.
   */
  onSuccess?: () => void;

  /**
   * Callback fired when there's an error adding the pass.
   * Error message is passed as parameter.
   */
  onError?: (error: string) => void;

  /**
   * Whether the button is disabled.
   * When true, button is grayed out and non-interactive.
   * @default false
   */
  disabled?: boolean;

  /**
   * Whether to show the button label text.
   * When false, only the wallet icon is shown.
   * @default true
   */
  showLabel?: boolean;

  /**
   * Custom button text (overrides default "Add to Apple Wallet").
   */
  buttonText?: string;

  /**
   * Whether to show the Apple Wallet icon.
   * @default true
   */
  showIcon?: boolean;
}

/**
 * Loading state type for tracking button state.
 */
type LoadingState = 'idle' | 'loading' | 'success' | 'error';

// ============================================================================
// Constants
// ============================================================================

/**
 * Apple Wallet button colors per Apple's brand guidelines.
 * Black variant is the primary recommended style.
 */
const COLORS = {
  black: {
    background: '#000000',
    text: '#FFFFFF',
    border: 'transparent',
  },
  outline: {
    background: 'transparent',
    text: '#000000',
    border: '#000000',
  },
  disabled: {
    background: '#E8E8E8',
    text: '#9E9E9E',
    border: 'transparent',
  },
  success: {
    background: '#10B981',
    text: '#FFFFFF',
    border: 'transparent',
  },
} as const;

/**
 * Button size configurations.
 * Follows Apple's recommended touch target sizes.
 */
const SIZES = {
  small: {
    height: 36,
    paddingHorizontal: 14,
    fontSize: 13,
    iconSize: 18,
    borderRadius: 8,
    gap: 6,
  },
  medium: {
    height: 44,
    paddingHorizontal: 18,
    fontSize: 15,
    iconSize: 20,
    borderRadius: 10,
    gap: 8,
  },
  large: {
    height: 52,
    paddingHorizontal: 22,
    fontSize: 17,
    iconSize: 24,
    borderRadius: 12,
    gap: 10,
  },
} as const;

/**
 * Brand purple color for inline/accent buttons.
 */
const BRAND_PURPLE = '#8B5CF6';

// ============================================================================
// Main Component: AppleWalletButton
// ============================================================================

/**
 * Main Apple Wallet button component with full customization options.
 *
 * Follows Apple's Human Interface Guidelines for Wallet integration.
 * Only renders on iOS devices.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <AppleWalletButton
 *   appointmentId="apt-123"
 *   onSuccess={() => console.log('Added!')}
 * />
 *
 * // With pre-fetched data and custom styling
 * <AppleWalletButton
 *   appointmentId="apt-123"
 *   appointmentDetails={appointment}
 *   variant="outline"
 *   size="large"
 *   onSuccess={handleSuccess}
 *   onError={handleError}
 * />
 * ```
 */
export function AppleWalletButton({
  appointmentId,
  appointmentDetails,
  variant = 'black',
  size = 'medium',
  style,
  textStyle,
  onSuccess,
  onError,
  disabled = false,
  showLabel = true,
  buttonText,
  showIcon = true,
}: AppleWalletButtonProps): React.ReactElement | null {
  const [loadingState, setLoadingState] = useState<LoadingState>('idle');
  const scale = useSharedValue(1);

  // Don't render on non-iOS platforms
  if (!isAppleWalletAvailable()) {
    return null;
  }

  // Get size configuration
  const sizeConfig = SIZES[size];

  // Get colors based on variant and state
  const getColors = () => {
    if (disabled) return COLORS.disabled;
    if (loadingState === 'success') return COLORS.success;
    return COLORS[variant];
  };

  const colors = getColors();

  /**
   * Handles button press - generates and opens the pass.
   */
  const handlePress = useCallback(async () => {
    if (disabled || loadingState === 'loading') {
      return;
    }

    // Haptic feedback on press
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    setLoadingState('loading');

    try {
      const result = await addToAppleWallet(appointmentId, appointmentDetails);

      if (result.success) {
        setLoadingState('success');
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        onSuccess?.();

        // Reset to idle after showing success state
        setTimeout(() => {
          setLoadingState('idle');
        }, 2000);
      } else {
        throw new Error(result.error || 'Failed to add to wallet');
      }
    } catch (error) {
      setLoadingState('error');
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

      const errorMessage = error instanceof Error ? error.message : 'Something went wrong';
      onError?.(errorMessage);

      // Show error alert with retry option
      Alert.alert(
        'Unable to Add to Wallet',
        errorMessage,
        [
          { text: 'Cancel', style: 'cancel', onPress: () => setLoadingState('idle') },
          { text: 'Try Again', onPress: () => handlePress() },
        ]
      );
    }
  }, [appointmentId, appointmentDetails, disabled, loadingState, onSuccess, onError]);

  /**
   * Handle press in - scale down animation
   */
  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.96, { damping: 15, stiffness: 400 });
  }, [scale]);

  /**
   * Handle press out - scale back up
   */
  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  }, [scale]);

  /**
   * Animated scale style
   */
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  /**
   * Build dynamic button style
   */
  const buttonStyle: ViewStyle = {
    height: sizeConfig.height,
    paddingHorizontal: sizeConfig.paddingHorizontal,
    borderRadius: sizeConfig.borderRadius,
    backgroundColor: colors.background,
    borderWidth: variant === 'outline' ? 1.5 : 0,
    borderColor: colors.border,
    gap: sizeConfig.gap,
  };

  /**
   * Build dynamic text style
   */
  const labelStyle: TextStyle = {
    fontSize: sizeConfig.fontSize,
    color: colors.text,
  };

  /**
   * Get display text based on state
   */
  const getDisplayText = () => {
    if (loadingState === 'loading') return 'Adding...';
    if (loadingState === 'success') return 'Added!';
    return buttonText || 'Add to Apple Wallet';
  };

  /**
   * Render button content based on loading state
   */
  const renderContent = () => {
    if (loadingState === 'loading') {
      return (
        <>
          <ActivityIndicator size="small" color={colors.text} />
          {showLabel && (
            <Text style={[styles.buttonText, labelStyle, textStyle]}>
              {getDisplayText()}
            </Text>
          )}
        </>
      );
    }

    if (loadingState === 'success') {
      return (
        <>
          <Ionicons name="checkmark-circle" size={sizeConfig.iconSize} color={colors.text} />
          {showLabel && (
            <Text style={[styles.buttonText, labelStyle, textStyle]}>
              {getDisplayText()}
            </Text>
          )}
        </>
      );
    }

    return (
      <>
        {showIcon && (
          <AppleWalletIcon size={sizeConfig.iconSize} color={colors.text} />
        )}
        {showLabel && (
          <Text style={[styles.buttonText, labelStyle, textStyle]}>
            {getDisplayText()}
          </Text>
        )}
      </>
    );
  };

  return (
    <Animated.View style={[animatedStyle, style]}>
      <TouchableOpacity
        style={[styles.button, buttonStyle]}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loadingState === 'loading'}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={buttonText || 'Add to Apple Wallet'}
        accessibilityHint="Double tap to add this appointment to your Apple Wallet"
        accessibilityState={{
          disabled: disabled || loadingState === 'loading',
          busy: loadingState === 'loading',
        }}
      >
        {renderContent()}
      </TouchableOpacity>
    </Animated.View>
  );
}

// ============================================================================
// Apple Wallet Icon Component
// ============================================================================

interface AppleWalletIconProps {
  size?: number;
  color?: string;
}

/**
 * Apple Wallet icon using Ionicons wallet icon.
 * In production, you might use Apple's official wallet badge image.
 */
function AppleWalletIcon({ size = 20, color = '#FFFFFF' }: AppleWalletIconProps) {
  return (
    <View style={[styles.walletIcon, { width: size, height: size }]}>
      <Ionicons name="wallet" size={size} color={color} />
    </View>
  );
}

// ============================================================================
// AppleWalletBadge Component
// ============================================================================

/**
 * Props for the AppleWalletBadge component.
 * Simplified version of AppleWalletButtonProps.
 */
export interface AppleWalletBadgeProps {
  appointmentId: string;
  appointmentDetails?: AppointmentDetails;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  style?: ViewStyle;
  disabled?: boolean;
}

/**
 * Official-looking Apple Wallet badge button.
 * Two-line layout: "Add to" / "Apple Wallet"
 *
 * This matches the official Apple Wallet badge design more closely.
 *
 * @example
 * ```tsx
 * <AppleWalletBadge
 *   appointmentId="apt-123"
 *   onSuccess={() => navigation.goBack()}
 * />
 * ```
 */
export function AppleWalletBadge({
  appointmentId,
  appointmentDetails,
  onSuccess,
  onError,
  style,
  disabled = false,
}: AppleWalletBadgeProps): React.ReactElement | null {
  const [loadingState, setLoadingState] = useState<LoadingState>('idle');

  // Don't render on non-iOS platforms
  if (!isAppleWalletAvailable()) {
    return null;
  }

  /**
   * Handles badge press
   */
  const handlePress = useCallback(async () => {
    if (disabled || loadingState === 'loading') return;

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoadingState('loading');

    try {
      const result = await addToAppleWallet(appointmentId, appointmentDetails);

      if (result.success) {
        setLoadingState('success');
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        onSuccess?.();

        setTimeout(() => setLoadingState('idle'), 2000);
      } else {
        throw new Error(result.error || 'Failed to add to wallet');
      }
    } catch (error) {
      setLoadingState('error');
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

      const errorMessage = error instanceof Error ? error.message : 'Failed to add to wallet';
      onError?.(errorMessage);

      Alert.alert(
        'Unable to Add to Wallet',
        errorMessage,
        [
          { text: 'Cancel', style: 'cancel', onPress: () => setLoadingState('idle') },
          { text: 'Try Again', onPress: () => handlePress() },
        ]
      );
    }
  }, [appointmentId, appointmentDetails, disabled, loadingState, onSuccess, onError]);

  /**
   * Render badge content based on state
   */
  const renderContent = () => {
    if (loadingState === 'loading') {
      return (
        <View style={styles.badgeContent}>
          <ActivityIndicator size="small" color="#FFFFFF" />
          <Text style={styles.badgeTextLarge}>Adding...</Text>
        </View>
      );
    }

    if (loadingState === 'success') {
      return (
        <View style={styles.badgeContent}>
          <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
          <Text style={styles.badgeTextLarge}>Added!</Text>
        </View>
      );
    }

    return (
      <View style={styles.badgeContent}>
        <View style={styles.badgeIconContainer}>
          <Ionicons name="wallet" size={22} color="#FFFFFF" />
        </View>
        <View style={styles.badgeTextContainer}>
          <Text style={styles.badgeTextSmall}>Add to</Text>
          <Text style={styles.badgeTextLarge}>Apple Wallet</Text>
        </View>
      </View>
    );
  };

  return (
    <TouchableOpacity
      style={[
        styles.badge,
        loadingState === 'success' && styles.badgeSuccess,
        disabled && styles.badgeDisabled,
        style,
      ]}
      onPress={handlePress}
      disabled={disabled || loadingState === 'loading'}
      activeOpacity={0.9}
      accessibilityRole="button"
      accessibilityLabel="Add to Apple Wallet"
      accessibilityState={{ disabled: disabled || loadingState === 'loading' }}
    >
      {renderContent()}
    </TouchableOpacity>
  );
}

// ============================================================================
// InlineWalletButton Component
// ============================================================================

/**
 * Props for the InlineWalletButton component.
 */
export interface InlineWalletButtonProps {
  appointmentId: string;
  appointmentDetails?: AppointmentDetails;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  style?: ViewStyle;
  disabled?: boolean;
}

/**
 * Compact inline wallet button for use in cards and lists.
 * Uses brand purple color scheme for visual consistency.
 *
 * @example
 * ```tsx
 * <View style={styles.cardActions}>
 *   <InlineWalletButton
 *     appointmentId={appointment.id}
 *     appointmentDetails={appointment}
 *     onSuccess={() => showToast('Added to Wallet')}
 *   />
 *   <TouchableOpacity onPress={handleReschedule}>
 *     <Text>Reschedule</Text>
 *   </TouchableOpacity>
 * </View>
 * ```
 */
export function InlineWalletButton({
  appointmentId,
  appointmentDetails,
  onSuccess,
  onError,
  style,
  disabled = false,
}: InlineWalletButtonProps): React.ReactElement | null {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Don't render on non-iOS platforms
  if (!isAppleWalletAvailable()) {
    return null;
  }

  /**
   * Handles inline button press
   */
  const handlePress = useCallback(async () => {
    if (loading || disabled) return;

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLoading(true);

    try {
      const result = await addToAppleWallet(appointmentId, appointmentDetails);

      if (result.success) {
        setSuccess(true);
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        onSuccess?.();

        // Reset after showing success
        setTimeout(() => {
          setSuccess(false);
        }, 2000);
      } else {
        throw new Error(result.error || 'Failed to add to wallet');
      }
    } catch (error) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

      const errorMessage = error instanceof Error ? error.message : 'Failed to add to wallet';
      onError?.(errorMessage);

      Alert.alert(
        'Unable to Add',
        errorMessage,
        [{ text: 'OK', style: 'default' }]
      );
    } finally {
      setLoading(false);
    }
  }, [appointmentId, appointmentDetails, loading, disabled, onSuccess, onError]);

  return (
    <TouchableOpacity
      style={[
        styles.inlineButton,
        success && styles.inlineButtonSuccess,
        disabled && styles.inlineButtonDisabled,
        style,
      ]}
      onPress={handlePress}
      disabled={loading || disabled}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel="Add to Wallet"
      accessibilityState={{ disabled: loading || disabled }}
    >
      {loading ? (
        <ActivityIndicator size="small" color={BRAND_PURPLE} />
      ) : success ? (
        <>
          <Ionicons name="checkmark-circle" size={18} color="#10B981" />
          <Text style={[styles.inlineButtonText, styles.inlineButtonTextSuccess]}>Added</Text>
        </>
      ) : (
        <>
          <Ionicons name="wallet-outline" size={18} color={BRAND_PURPLE} />
          <Text style={styles.inlineButtonText}>Add to Wallet</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  // Main button styles
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  walletIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Badge styles (official Apple Wallet badge look)
  badge: {
    backgroundColor: '#000000',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
    minWidth: 160,
    height: 44,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  badgeSuccess: {
    backgroundColor: '#10B981',
  },
  badgeDisabled: {
    opacity: 0.6,
  },
  badgeContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  badgeIconContainer: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeTextContainer: {
    alignItems: 'flex-start',
  },
  badgeTextSmall: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '400',
    letterSpacing: 0.3,
    opacity: 0.9,
  },
  badgeTextLarge: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: -0.2,
  },

  // Inline button styles (for cards/lists)
  inlineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F5F3FF',
  },
  inlineButtonSuccess: {
    backgroundColor: '#D1FAE5',
  },
  inlineButtonDisabled: {
    opacity: 0.6,
  },
  inlineButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: BRAND_PURPLE,
  },
  inlineButtonTextSuccess: {
    color: '#10B981',
  },
});

// ============================================================================
// Exports
// ============================================================================

export default AppleWalletButton;
