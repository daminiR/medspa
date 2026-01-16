'use client';

import { useState, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Camera, RefreshCw, AlertCircle, Keyboard, XCircle } from 'lucide-react';

// Dynamic import for Next.js compatibility (SSR disabled)
const Scanner = dynamic(
  () => import('@yudiel/react-qr-scanner').then((mod) => mod.Scanner),
  { ssr: false }
);

interface QRScannerProps {
  onScan: (token: string) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
}

type ScannerState = 'loading' | 'scanning' | 'error';

export default function QRScanner({ onScan, onError, disabled = false }: QRScannerProps) {
  const [state, setState] = useState<ScannerState>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [hasScanned, setHasScanned] = useState(false);

  // Reset scanner state when disabled changes
  useEffect(() => {
    if (!disabled) {
      setHasScanned(false);
      // Set to scanning state after a short delay since onReady is not available
      const timer = setTimeout(() => {
        if (state === 'loading') {
          setState('scanning');
        }
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [disabled, state]);

  // Handle successful scan
  const handleScan = useCallback((result: { rawValue: string }[]) => {
    if (disabled || hasScanned) return;

    if (result && result.length > 0 && result[0].rawValue) {
      setHasScanned(true);
      onScan(result[0].rawValue);
    }
  }, [disabled, hasScanned, onScan]);

  // Handle scanner error
  const handleError = useCallback((error: unknown) => {
    console.error('QR Scanner error:', error);

    let message = 'Failed to access camera. Please try again.';

    if (error instanceof Error) {
      if (error.name === 'NotAllowedError' || error.message.includes('Permission denied')) {
        message = 'Camera access denied. Please allow camera access in your browser settings.';
      } else if (error.name === 'NotFoundError' || error.message.includes('not found')) {
        message = 'No camera found on this device. Please use a device with a camera.';
      } else if (error.name === 'NotReadableError') {
        message = 'Camera is in use by another application. Please close other camera apps.';
      } else if (error.name === 'OverconstrainedError') {
        message = 'Camera does not meet requirements. Please try a different camera.';
      }
    }

    setErrorMessage(message);
    setState('error');
    onError?.(message);
  }, [onError]);

  // Handle camera ready
  const handleCameraReady = useCallback(() => {
    setState('scanning');
  }, []);

  // Retry camera initialization
  const handleRetry = useCallback(() => {
    setErrorMessage('');
    setState('loading');
    setHasScanned(false);
  }, []);

  // Trigger manual code entry
  const handleManualEntry = useCallback(() => {
    onError?.('manual_entry_requested');
  }, [onError]);

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Scanner Container */}
      <div className="relative bg-black rounded-2xl shadow-2xl overflow-hidden">
        {/* Loading State */}
        {state === 'loading' && !disabled && (
          <div className="absolute inset-0 z-20 bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-700 flex flex-col items-center justify-center">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-6 animate-pulse">
              <Camera className="w-10 h-10 text-white" />
            </div>
            <div className="flex items-center gap-3 text-white text-xl font-medium">
              <RefreshCw className="w-6 h-6 animate-spin" />
              Initializing Camera...
            </div>
            <p className="text-white/70 mt-3 text-center px-6">
              Please allow camera access when prompted
            </p>
          </div>
        )}

        {/* Error State */}
        {state === 'error' && (
          <div className="absolute inset-0 z-20 bg-white flex flex-col items-center justify-center p-8">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
              <XCircle className="w-12 h-12 text-red-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3 text-center">
              Camera Error
            </h3>
            <p className="text-gray-600 text-center text-lg mb-8 max-w-sm">
              {errorMessage}
            </p>
            <button
              onClick={handleRetry}
              className="flex items-center gap-3 px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xl rounded-2xl transition-colors"
            >
              <RefreshCw className="w-6 h-6" />
              Try Again
            </button>
          </div>
        )}

        {/* Disabled Overlay */}
        {disabled && (
          <div className="absolute inset-0 z-20 bg-gray-900/80 flex items-center justify-center">
            <div className="text-white/50 text-xl font-medium">Scanner Disabled</div>
          </div>
        )}

        {/* Scanner Viewfinder */}
        <div className="relative aspect-square">
          {/* QR Scanner Component */}
          {!disabled && state !== 'error' && (
            <Scanner
              onScan={handleScan}
              onError={handleError}
              constraints={{
                facingMode: 'environment',
              }}
              styles={{
                container: {
                  width: '100%',
                  height: '100%',
                },
                video: {
                  objectFit: 'cover',
                },
              }}
              components={{
                onOff: false,
                torch: false,
                zoom: false,
                finder: false,
              }}
            />
          )}

          {/* Custom Viewfinder Overlay */}
          {state === 'scanning' && !disabled && (
            <div className="absolute inset-0 z-10 pointer-events-none">
              {/* Semi-transparent overlay with cutout */}
              <div className="absolute inset-0 bg-black/40" />

              {/* Scanning area cutout */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-64 h-64">
                  {/* Clear center area */}
                  <div className="absolute inset-0 bg-black/40" style={{
                    clipPath: 'polygon(0% 0%, 0% 100%, 25% 100%, 25% 25%, 75% 25%, 75% 75%, 25% 75%, 25% 100%, 100% 100%, 100% 0%)'
                  }} />

                  {/* Corner markers - Top Left */}
                  <div className="absolute top-0 left-0 w-12 h-12">
                    <div className="absolute top-0 left-0 w-full h-1 bg-purple-500 rounded-full shadow-lg shadow-purple-500/50" />
                    <div className="absolute top-0 left-0 w-1 h-full bg-purple-500 rounded-full shadow-lg shadow-purple-500/50" />
                  </div>

                  {/* Corner markers - Top Right */}
                  <div className="absolute top-0 right-0 w-12 h-12">
                    <div className="absolute top-0 right-0 w-full h-1 bg-purple-500 rounded-full shadow-lg shadow-purple-500/50" />
                    <div className="absolute top-0 right-0 w-1 h-full bg-purple-500 rounded-full shadow-lg shadow-purple-500/50" />
                  </div>

                  {/* Corner markers - Bottom Left */}
                  <div className="absolute bottom-0 left-0 w-12 h-12">
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-purple-500 rounded-full shadow-lg shadow-purple-500/50" />
                    <div className="absolute bottom-0 left-0 w-1 h-full bg-purple-500 rounded-full shadow-lg shadow-purple-500/50" />
                  </div>

                  {/* Corner markers - Bottom Right */}
                  <div className="absolute bottom-0 right-0 w-12 h-12">
                    <div className="absolute bottom-0 right-0 w-full h-1 bg-purple-500 rounded-full shadow-lg shadow-purple-500/50" />
                    <div className="absolute bottom-0 right-0 w-1 h-full bg-purple-500 rounded-full shadow-lg shadow-purple-500/50" />
                  </div>

                  {/* Scanning animation line */}
                  <div className="absolute inset-x-4 h-0.5 bg-gradient-to-r from-transparent via-purple-400 to-transparent animate-scan-line" />
                </div>
              </div>

              {/* Scanning indicator */}
              <div className="absolute bottom-6 left-0 right-0 flex justify-center">
                <div className="bg-black/60 backdrop-blur-sm px-6 py-3 rounded-full flex items-center gap-3">
                  <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse shadow-lg shadow-purple-500/50" />
                  <span className="text-white font-medium text-lg">Scanning for QR Code...</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Manual Entry Link */}
      {state !== 'error' && (
        <div className="mt-6 text-center">
          <button
            onClick={handleManualEntry}
            disabled={disabled}
            className="inline-flex items-center gap-3 px-6 py-4 bg-white/10 hover:bg-white/20 disabled:bg-white/5 disabled:cursor-not-allowed text-white font-medium text-xl rounded-2xl transition-colors"
          >
            <Keyboard className="w-6 h-6" />
            Enter Code Manually
          </button>
        </div>
      )}

      {/* Instructions */}
      {state === 'scanning' && !disabled && (
        <div className="mt-6 bg-white/10 backdrop-blur-sm rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-6 h-6 text-purple-300" />
            </div>
            <div className="text-white/80 text-lg">
              <p className="font-medium text-white mb-1">Position QR Code in Frame</p>
              <p>Hold steady and ensure good lighting. The code will scan automatically.</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
