/**
 * Google Wallet Button Component
 *
 * A styled button component for adding appointments to Google Wallet.
 * Follows Google's brand guidelines for the "Add to Google Wallet" button.
 *
 * @see https://developers.google.com/wallet/generic/resources/brand-guidelines
 */

import React, { useState, useCallback } from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Image,
  ViewStyle,
  TextStyle,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { addToGoogleWallet, AppointmentData } from '../../services/wallet/googleWallet';

// ============================================================================
// Types
// ============================================================================

export interface GoogleWalletButtonProps {
  /**
   * The appointment ID to add to Google Wallet
   */
  appointmentId: string;

  /**
   * Optional full appointment data (to avoid fetching from API)
   */
  appointmentData?: AppointmentData;

  /**
   * Button variant - 'primary' has dark background, 'outline' has border only
   * @default 'primary'
   */
  variant?: 'primary' | 'outline';

  /**
   * Button size
   * @default 'medium'
   */
  size?: 'small' | 'medium' | 'large';

  /**
   * Whether the button is disabled
   * @default false
   */
  disabled?: boolean;

  /**
   * Callback when the pass is successfully added
   */
  onSuccess?: () => void;

  /**
   * Callback when there's an error adding the pass
   */
  onError?: (error: string) => void;

  /**
   * Custom styles for the button container
   */
  style?: ViewStyle;

  /**
   * Custom styles for the button text
   */
  textStyle?: TextStyle;

  /**
   * Whether to show the Google Pay logo
   * @default true
   */
  showLogo?: boolean;

  /**
   * Custom button text (overrides default "Add to Google Wallet")
   */
  buttonText?: string;
}

// ============================================================================
// Constants
// ============================================================================

// Google Wallet button colors per brand guidelines
const COLORS = {
  primary: {
    background: '#000000',
    text: '#FFFFFF',
    border: 'transparent',
  },
  outline: {
    background: 'transparent',
    text: '#000000',
    border: '#747775',
  },
  disabled: {
    background: '#E8E8E8',
    text: '#9E9E9E',
    border: 'transparent',
  },
};

// Button dimensions
const SIZES = {
  small: {
    height: 36,
    paddingHorizontal: 16,
    fontSize: 13,
    logoSize: 18,
    borderRadius: 18,
  },
  medium: {
    height: 44,
    paddingHorizontal: 20,
    fontSize: 14,
    logoSize: 22,
    borderRadius: 22,
  },
  large: {
    height: 52,
    paddingHorizontal: 24,
    fontSize: 16,
    logoSize: 26,
    borderRadius: 26,
  },
};

// Google Pay logo (base64 encoded SVG or use a hosted image)
// For production, use Google's official assets
const GOOGLE_PAY_LOGO_URI = 'https://www.gstatic.com/instantbuy/svg/dark_gpay.svg';

// ============================================================================
// Component
// ============================================================================

export function GoogleWalletButton({
  appointmentId,
  appointmentData,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  onSuccess,
  onError,
  style,
  textStyle,
  showLogo = true,
  buttonText,
}: GoogleWalletButtonProps): React.ReactElement {
  const [isLoading, setIsLoading] = useState(false);

  const handlePress = useCallback(async () => {
    if (isLoading || disabled) return;

    // Haptic feedback on press
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    setIsLoading(true);

    try {
      const result = await addToGoogleWallet(appointmentId, appointmentData);

      if (result.success) {
        // Success haptic feedback
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        onSuccess?.();
      } else {
        // Error haptic feedback
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

        const errorMessage = result.error || 'Unable to add to Google Wallet';
        onError?.(errorMessage);

        Alert.alert(
          'Unable to Add to Wallet',
          errorMessage,
          [
            {
              text: 'OK',
              style: 'default',
            },
            {
              text: 'Try Again',
              onPress: handlePress,
            },
          ]
        );
      }
    } catch (error) {
      // Error haptic feedback
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      onError?.(errorMessage);

      Alert.alert(
        'Error',
        errorMessage,
        [{ text: 'OK', style: 'default' }]
      );
    } finally {
      setIsLoading(false);
    }
  }, [appointmentId, appointmentData, isLoading, disabled, onSuccess, onError]);

  // Get colors based on variant and disabled state
  const colors = disabled ? COLORS.disabled : COLORS[variant];
  const sizeConfig = SIZES[size];

  // Dynamic styles
  const buttonStyle: ViewStyle = {
    height: sizeConfig.height,
    paddingHorizontal: sizeConfig.paddingHorizontal,
    borderRadius: sizeConfig.borderRadius,
    backgroundColor: colors.background,
    borderWidth: variant === 'outline' ? 1 : 0,
    borderColor: colors.border,
  };

  const labelStyle: TextStyle = {
    fontSize: sizeConfig.fontSize,
    color: colors.text,
  };

  const displayText = buttonText || 'Add to Google Wallet';

  return (
    <TouchableOpacity
      style={[styles.button, buttonStyle, style]}
      onPress={handlePress}
      disabled={disabled || isLoading}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={displayText}
      accessibilityState={{ disabled: disabled || isLoading }}
    >
      {isLoading ? (
        <ActivityIndicator
          size="small"
          color={colors.text}
          style={styles.loader}
        />
      ) : (
        <View style={styles.content}>
          {showLogo && (
            <View style={styles.logoContainer}>
              <GooglePayLogo
                width={sizeConfig.logoSize}
                height={sizeConfig.logoSize}
                variant={variant}
              />
            </View>
          )}
          <Text style={[styles.label, labelStyle, textStyle]}>
            {displayText}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

// ============================================================================
// Google Pay Logo Component
// ============================================================================

interface GooglePayLogoProps {
  width: number;
  height: number;
  variant: 'primary' | 'outline';
}

function GooglePayLogo({ width, height, variant }: GooglePayLogoProps): React.ReactElement {
  // Using a simple representation - in production, use official Google assets
  // The official Google Pay logo should be used per brand guidelines
  return (
    <View style={[styles.googleLogo, { width, height }]}>
      {/* Google 'G' colors */}
      <View style={styles.googleG}>
        <View style={[styles.gSegment, styles.gBlue]} />
        <View style={[styles.gSegment, styles.gRed]} />
        <View style={[styles.gSegment, styles.gYellow]} />
        <View style={[styles.gSegment, styles.gGreen]} />
      </View>
    </View>
  );
}

// ============================================================================
// Compact Button Variant
// ============================================================================

export interface GoogleWalletIconButtonProps {
  appointmentId: string;
  appointmentData?: AppointmentData;
  size?: number;
  disabled?: boolean;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  style?: ViewStyle;
}

/**
 * A compact icon-only version of the Google Wallet button
 */
export function GoogleWalletIconButton({
  appointmentId,
  appointmentData,
  size = 44,
  disabled = false,
  onSuccess,
  onError,
  style,
}: GoogleWalletIconButtonProps): React.ReactElement {
  const [isLoading, setIsLoading] = useState(false);

  const handlePress = useCallback(async () => {
    if (isLoading || disabled) return;

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsLoading(true);

    try {
      const result = await addToGoogleWallet(appointmentId, appointmentData);

      if (result.success) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        onSuccess?.();
      } else {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        onError?.(result.error || 'Unable to add to Google Wallet');
      }
    } catch (error) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      onError?.(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [appointmentId, appointmentData, isLoading, disabled, onSuccess, onError]);

  return (
    <TouchableOpacity
      style={[
        styles.iconButton,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}
      onPress={handlePress}
      disabled={disabled || isLoading}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel="Add to Google Wallet"
    >
      {isLoading ? (
        <ActivityIndicator size="small" color="#FFFFFF" />
      ) : (
        <GooglePayLogo width={size * 0.5} height={size * 0.5} variant="primary" />
      )}
    </TouchableOpacity>
  );
}

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    marginRight: 8,
  },
  label: {
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  loader: {
    marginHorizontal: 8,
  },
  googleLogo: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleG: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  gSegment: {
    position: 'absolute',
    width: '25%',
    height: '100%',
  },
  gBlue: {
    backgroundColor: '#4285F4',
    left: 0,
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4,
  },
  gRed: {
    backgroundColor: '#EA4335',
    left: '25%',
  },
  gYellow: {
    backgroundColor: '#FBBC05',
    left: '50%',
  },
  gGreen: {
    backgroundColor: '#34A853',
    left: '75%',
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },
  iconButton: {
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
});

// ============================================================================
// Export
// ============================================================================

export default GoogleWalletButton;
