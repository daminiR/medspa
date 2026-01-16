/**
 * SignaturePad Component
 *
 * Touch-based signature capture component for mobile forms.
 * Uses react-native-signature-canvas for drawing functionality.
 */

import React, { useRef, useCallback, useState, forwardRef, useImperativeHandle } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import SignatureCanvas from 'react-native-signature-canvas';
import { Ionicons } from '@expo/vector-icons';

export interface SignaturePadRef {
  clearSignature: () => void;
  getSignature: () => Promise<string | null>;
  isEmpty: () => boolean;
}

export interface SignaturePadProps {
  onSignatureChange?: (signature: string | null) => void;
  onSignatureEnd?: (signature: string) => void;
  onClear?: () => void;
  label?: string;
  disclaimer?: string;
  clearButtonLabel?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  height?: number;
  backgroundColor?: string;
  penColor?: string;
  borderColor?: string;
  testID?: string;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DEFAULT_HEIGHT = 200;

export const SignaturePad = forwardRef<SignaturePadRef, SignaturePadProps>(
  (
    {
      onSignatureChange,
      onSignatureEnd,
      onClear,
      label = 'Signature',
      disclaimer,
      clearButtonLabel = 'Clear',
      required = false,
      disabled = false,
      error,
      height = DEFAULT_HEIGHT,
      backgroundColor = '#FAFAFA',
      penColor = '#000000',
      borderColor = '#E5E7EB',
      testID,
    },
    ref
  ) => {
    const signatureRef = useRef<SignatureCanvas>(null);
    const [isEmpty, setIsEmpty] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    useImperativeHandle(ref, () => ({
      clearSignature: () => {
        signatureRef.current?.clearSignature();
        setIsEmpty(true);
        onSignatureChange?.(null);
        onClear?.();
      },
      getSignature: async () => {
        if (isEmpty) return null;
        return new Promise((resolve) => {
          signatureRef.current?.readSignature();
          // The signature will be returned via onOK callback
          // This is a limitation of the library
          setTimeout(() => {
            signatureRef.current?.readSignature();
          }, 100);
        });
      },
      isEmpty: () => isEmpty,
    }));

    const handleClear = useCallback(() => {
      signatureRef.current?.clearSignature();
      setIsEmpty(true);
      onSignatureChange?.(null);
      onClear?.();
    }, [onSignatureChange, onClear]);

    const handleEnd = useCallback(() => {
      setIsEmpty(false);
      signatureRef.current?.readSignature();
    }, []);

    const handleOK = useCallback(
      (signature: string) => {
        if (signature && signature !== 'data:,') {
          onSignatureChange?.(signature);
          onSignatureEnd?.(signature);
        }
      },
      [onSignatureChange, onSignatureEnd]
    );

    const handleEmpty = useCallback(() => {
      setIsEmpty(true);
      onSignatureChange?.(null);
    }, [onSignatureChange]);

    const handleBegin = useCallback(() => {
      setIsEmpty(false);
    }, []);

    // Web style for the signature canvas
    const webStyle = `.m-signature-pad {
      box-shadow: none;
      border: none;
      background-color: ${backgroundColor};
    }
    .m-signature-pad--body {
      border: none;
    }
    .m-signature-pad--footer {
      display: none;
    }
    body, html {
      background-color: ${backgroundColor};
    }
    canvas {
      background-color: ${backgroundColor};
    }`;

    return (
      <View style={styles.container} testID={testID}>
        {/* Label */}
        {label && (
          <View style={styles.labelContainer}>
            <Text style={styles.label}>
              {label}
              {required && <Text style={styles.required}> *</Text>}
            </Text>
          </View>
        )}

        {/* Disclaimer */}
        {disclaimer && (
          <View style={styles.disclaimerContainer}>
            <Ionicons name="information-circle-outline" size={16} color="#6B7280" />
            <Text style={styles.disclaimer}>{disclaimer}</Text>
          </View>
        )}

        {/* Signature Canvas */}
        <View
          style={[
            styles.canvasContainer,
            {
              height,
              borderColor: error ? '#EF4444' : borderColor,
              backgroundColor,
            },
            disabled && styles.disabled,
          ]}
        >
          {disabled ? (
            <View style={styles.disabledOverlay}>
              <Ionicons name="lock-closed" size={24} color="#9CA3AF" />
              <Text style={styles.disabledText}>Signature locked</Text>
            </View>
          ) : (
            <SignatureCanvas
              ref={signatureRef}
              webStyle={webStyle}
              onOK={handleOK}
              onEmpty={handleEmpty}
              onEnd={handleEnd}
              onBegin={handleBegin}
              descriptionText=""
              clearText=""
              confirmText=""
              autoClear={false}
              imageType="image/png"
              backgroundColor={backgroundColor}
              penColor={penColor}
              dotSize={2}
              minWidth={1.5}
              maxWidth={3}
              style={styles.signatureCanvas}
            />
          )}

          {/* Signature Line */}
          <View style={styles.signatureLine}>
            <View style={[styles.line, { borderColor }]} />
            <Text style={styles.signatureX}>X</Text>
          </View>

          {/* Loading Overlay */}
          {isLoading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="small" color="#8B5CF6" />
            </View>
          )}
        </View>

        {/* Clear Button */}
        {!disabled && (
          <TouchableOpacity
            style={[styles.clearButton, isEmpty && styles.clearButtonDisabled]}
            onPress={handleClear}
            disabled={isEmpty}
            accessibilityLabel={clearButtonLabel}
            accessibilityRole="button"
          >
            <Ionicons
              name="trash-outline"
              size={18}
              color={isEmpty ? '#D1D5DB' : '#6B7280'}
            />
            <Text style={[styles.clearButtonText, isEmpty && styles.clearButtonTextDisabled]}>
              {clearButtonLabel}
            </Text>
          </TouchableOpacity>
        )}

        {/* Error Message */}
        {error && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={14} color="#EF4444" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Timestamp Info */}
        {!isEmpty && (
          <View style={styles.timestampContainer}>
            <Ionicons name="time-outline" size={12} color="#9CA3AF" />
            <Text style={styles.timestampText}>
              Signed on {new Date().toLocaleDateString()} at{' '}
              {new Date().toLocaleTimeString()}
            </Text>
          </View>
        )}
      </View>
    );
  }
);

SignaturePad.displayName = 'SignaturePad';

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  required: {
    color: '#EF4444',
    fontSize: 16,
  },
  disclaimerContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    gap: 8,
  },
  disclaimer: {
    flex: 1,
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  canvasContainer: {
    borderWidth: 2,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  signatureCanvas: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  signatureLine: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  line: {
    flex: 1,
    borderBottomWidth: 1,
    borderStyle: 'dashed',
  },
  signatureX: {
    position: 'absolute',
    left: 0,
    bottom: 4,
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.6,
  },
  disabledOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  disabledText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginTop: 8,
    gap: 6,
    alignSelf: 'flex-end',
  },
  clearButtonDisabled: {
    opacity: 0.5,
  },
  clearButtonText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  clearButtonTextDisabled: {
    color: '#D1D5DB',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 4,
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
  },
  timestampContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 4,
  },
  timestampText: {
    fontSize: 11,
    color: '#9CA3AF',
  },
});

export default SignaturePad;
