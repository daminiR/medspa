'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Camera,
  X,
  Barcode,
  Flashlight,
  FlashlightOff,
  RotateCcw,
  Check,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';

// GS1 Application Identifiers
const GS1_AI = {
  GTIN: '01',
  LOT_NUMBER: '10',
  EXPIRATION_DATE: '17',
  SERIAL_NUMBER: '21',
  PRODUCTION_DATE: '11',
  QUANTITY: '30',
};

export interface ParsedBarcode {
  gtin?: string;
  lotNumber?: string;
  expirationDate?: Date;
  serialNumber?: string;
  productionDate?: Date;
  quantity?: number;
  rawCode: string;
  format: string;
}

interface BarcodeScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (data: ParsedBarcode) => void;
  acceptedFormats?: string[];
}

export function BarcodeScanner({
  isOpen,
  onClose,
  onScan,
  acceptedFormats = ['datamatrix', 'qr_code', 'code_128', 'ean_13'],
}: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [isScanning, setIsScanning] = useState(false);
  const [hasCamera, setHasCamera] = useState(true);
  const [torchOn, setTorchOn] = useState(false);
  const [lastScanned, setLastScanned] = useState<ParsedBarcode | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [manualInput, setManualInput] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);

  // Parse GS1 barcode (DataMatrix, GS1-128)
  const parseGS1Barcode = useCallback((code: string): ParsedBarcode => {
    const result: ParsedBarcode = {
      rawCode: code,
      format: 'GS1',
    };

    // Remove FNC1 character if present (ASCII 29 or ])
    let cleanCode = code.replace(/\x1d|\]/g, '');

    // Parse Application Identifiers
    let position = 0;
    while (position < cleanCode.length) {
      const ai2 = cleanCode.substring(position, position + 2);
      const ai3 = cleanCode.substring(position, position + 3);
      const ai4 = cleanCode.substring(position, position + 4);

      // GTIN (AI 01) - 14 digits
      if (ai2 === GS1_AI.GTIN) {
        result.gtin = cleanCode.substring(position + 2, position + 16);
        position += 16;
      }
      // Lot Number (AI 10) - variable length
      else if (ai2 === GS1_AI.LOT_NUMBER) {
        // Find next AI or end
        let endPos = position + 2;
        while (
          endPos < cleanCode.length &&
          !/^\d{2}$/.test(cleanCode.substring(endPos, endPos + 2))
        ) {
          endPos++;
        }
        result.lotNumber = cleanCode.substring(position + 2, endPos);
        position = endPos;
      }
      // Expiration Date (AI 17) - YYMMDD
      else if (ai2 === GS1_AI.EXPIRATION_DATE) {
        const dateStr = cleanCode.substring(position + 2, position + 8);
        const year = parseInt('20' + dateStr.substring(0, 2));
        const month = parseInt(dateStr.substring(2, 4)) - 1;
        const day = parseInt(dateStr.substring(4, 6)) || 1;
        result.expirationDate = new Date(year, month, day);
        position += 8;
      }
      // Serial Number (AI 21) - variable length
      else if (ai2 === GS1_AI.SERIAL_NUMBER) {
        let endPos = position + 2;
        while (
          endPos < cleanCode.length &&
          !/^\d{2}$/.test(cleanCode.substring(endPos, endPos + 2))
        ) {
          endPos++;
        }
        result.serialNumber = cleanCode.substring(position + 2, endPos);
        position = endPos;
      }
      // Production Date (AI 11) - YYMMDD
      else if (ai2 === GS1_AI.PRODUCTION_DATE) {
        const dateStr = cleanCode.substring(position + 2, position + 8);
        const year = parseInt('20' + dateStr.substring(0, 2));
        const month = parseInt(dateStr.substring(2, 4)) - 1;
        const day = parseInt(dateStr.substring(4, 6)) || 1;
        result.productionDate = new Date(year, month, day);
        position += 8;
      }
      // Unknown AI - skip 2 characters and try again
      else {
        position++;
      }
    }

    return result;
  }, []);

  // Parse standard barcodes (UPC, EAN, etc.)
  const parseStandardBarcode = useCallback((code: string, format: string): ParsedBarcode => {
    return {
      rawCode: code,
      format,
      gtin: code.length >= 12 ? code.padStart(14, '0') : undefined,
    };
  }, []);

  // Start camera
  const startCamera = useCallback(async () => {
    try {
      setError(null);
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsScanning(true);
        setHasCamera(true);
      }
    } catch (err) {
      console.error('Camera error:', err);
      setHasCamera(false);
      setError('Camera access denied. Please allow camera access or use manual entry.');
    }
  }, []);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  }, []);

  // Toggle torch
  const toggleTorch = useCallback(async () => {
    if (streamRef.current) {
      const track = streamRef.current.getVideoTracks()[0];
      const capabilities = track.getCapabilities() as MediaTrackCapabilities & { torch?: boolean };

      if (capabilities.torch) {
        await track.applyConstraints({
          advanced: [{ torch: !torchOn } as MediaTrackConstraintSet],
        });
        setTorchOn(!torchOn);
      } else {
        toast.error('Torch not available on this device');
      }
    }
  }, [torchOn]);

  // Scan using native BarcodeDetector API (if available)
  const scanWithNativeAPI = useCallback(async () => {
    if (!('BarcodeDetector' in window)) {
      return null;
    }

    try {
      // @ts-ignore - BarcodeDetector is not in TypeScript types yet
      const barcodeDetector = new BarcodeDetector({
        formats: ['data_matrix', 'qr_code', 'code_128', 'ean_13', 'ean_8', 'upc_a', 'upc_e'],
      });

      if (videoRef.current && canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          canvasRef.current.width = videoRef.current.videoWidth;
          canvasRef.current.height = videoRef.current.videoHeight;
          ctx.drawImage(videoRef.current, 0, 0);

          const barcodes = await barcodeDetector.detect(canvasRef.current);
          if (barcodes.length > 0) {
            return {
              code: barcodes[0].rawValue,
              format: barcodes[0].format,
            };
          }
        }
      }
    } catch (err) {
      console.error('Barcode detection error:', err);
    }

    return null;
  }, []);

  // Main scanning loop
  useEffect(() => {
    let animationFrame: number;
    let lastScanTime = 0;
    const SCAN_INTERVAL = 200; // ms between scans

    const scan = async () => {
      if (!isScanning) return;

      const now = Date.now();
      if (now - lastScanTime < SCAN_INTERVAL) {
        animationFrame = requestAnimationFrame(scan);
        return;
      }
      lastScanTime = now;

      const result = await scanWithNativeAPI();
      if (result) {
        // Debounce - prevent multiple scans of same code
        if (lastScanned?.rawCode !== result.code) {
          const parsed =
            result.format === 'data_matrix' || result.code.startsWith('01')
              ? parseGS1Barcode(result.code)
              : parseStandardBarcode(result.code, result.format);

          setLastScanned(parsed);
          toast.success('Barcode scanned successfully');

          // Vibrate on success (if supported)
          if (navigator.vibrate) {
            navigator.vibrate(100);
          }
        }
      }

      animationFrame = requestAnimationFrame(scan);
    };

    if (isScanning) {
      animationFrame = requestAnimationFrame(scan);
    }

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [isScanning, lastScanned, scanWithNativeAPI, parseGS1Barcode, parseStandardBarcode]);

  // Start/stop camera based on modal state
  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
      setLastScanned(null);
      setError(null);
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, startCamera, stopCamera]);

  // Handle manual input
  const handleManualSubmit = () => {
    if (!manualInput.trim()) {
      toast.error('Please enter a barcode');
      return;
    }

    const parsed =
      manualInput.startsWith('01') || manualInput.length > 20
        ? parseGS1Barcode(manualInput.trim())
        : parseStandardBarcode(manualInput.trim(), 'manual');

    setLastScanned(parsed);
    setManualInput('');
    setShowManualInput(false);
    toast.success('Barcode processed');
  };

  // Confirm scanned barcode
  const handleConfirm = () => {
    if (lastScanned) {
      onScan(lastScanned);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black/50">
        <h2 className="text-white font-medium flex items-center gap-2">
          <Barcode className="w-5 h-5" />
          Scan Barcode
        </h2>
        <button onClick={onClose} className="text-white hover:text-gray-300">
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Camera View */}
      <div className="flex-1 relative overflow-hidden">
        {hasCamera ? (
          <>
            <video
              ref={videoRef}
              className="absolute inset-0 w-full h-full object-cover"
              playsInline
              muted
            />
            <canvas ref={canvasRef} className="hidden" />

            {/* Scanning overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-72 h-72">
                {/* Corner markers */}
                <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-white rounded-tl-lg" />
                <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-white rounded-tr-lg" />
                <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-white rounded-bl-lg" />
                <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-white rounded-br-lg" />

                {/* Scanning line animation */}
                {isScanning && (
                  <div className="absolute inset-x-4 h-0.5 bg-green-500 animate-scan" />
                )}
              </div>
            </div>

            {/* Camera controls */}
            <div className="absolute bottom-32 left-0 right-0 flex justify-center gap-4">
              <button
                onClick={toggleTorch}
                className="p-3 bg-black/50 rounded-full text-white hover:bg-black/70"
              >
                {torchOn ? (
                  <FlashlightOff className="w-6 h-6" />
                ) : (
                  <Flashlight className="w-6 h-6" />
                )}
              </button>
              <button
                onClick={() => {
                  stopCamera();
                  startCamera();
                }}
                className="p-3 bg-black/50 rounded-full text-white hover:bg-black/70"
              >
                <RotateCcw className="w-6 h-6" />
              </button>
              <button
                onClick={() => setShowManualInput(true)}
                className="px-4 py-2 bg-black/50 rounded-full text-white hover:bg-black/70 text-sm"
              >
                Enter Manually
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center px-6">
              <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
              <p className="text-white mb-4">{error || 'Camera not available'}</p>
              <button
                onClick={() => setShowManualInput(true)}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg"
              >
                Enter Barcode Manually
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Scanned Result */}
      {lastScanned && (
        <div className="bg-white rounded-t-2xl p-6 animate-slide-up">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Check className="w-5 h-5 text-green-500" />
                Barcode Scanned
              </h3>
              <p className="text-sm text-gray-500">Format: {lastScanned.format}</p>
            </div>
            <button
              onClick={() => setLastScanned(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-2 mb-6">
            {lastScanned.gtin && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">GTIN:</span>
                <span className="font-mono text-gray-900">{lastScanned.gtin}</span>
              </div>
            )}
            {lastScanned.lotNumber && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Lot Number:</span>
                <span className="font-mono text-gray-900">{lastScanned.lotNumber}</span>
              </div>
            )}
            {lastScanned.expirationDate && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Expiration Date:</span>
                <span className="font-mono text-gray-900">
                  {lastScanned.expirationDate.toLocaleDateString()}
                </span>
              </div>
            )}
            {lastScanned.serialNumber && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Serial Number:</span>
                <span className="font-mono text-gray-900">{lastScanned.serialNumber}</span>
              </div>
            )}
            <div className="flex justify-between text-sm pt-2 border-t">
              <span className="text-gray-500">Raw Code:</span>
              <span className="font-mono text-gray-900 text-xs truncate max-w-48">
                {lastScanned.rawCode}
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setLastScanned(null)}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Scan Again
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Use This Code
            </button>
          </div>
        </div>
      )}

      {/* Manual Input Modal */}
      {showManualInput && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="font-semibold text-gray-900 mb-4">Enter Barcode Manually</h3>
            <input
              type="text"
              value={manualInput}
              onChange={e => setManualInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleManualSubmit()}
              placeholder="Enter barcode or lot number..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono"
              autoFocus
            />
            <p className="text-sm text-gray-500 mt-2">
              Supports GS1 DataMatrix, GS1-128, UPC, and EAN barcodes
            </p>
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => {
                  setShowManualInput(false);
                  setManualInput('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleManualSubmit}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Process
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Styles */}
      <style jsx>{`
        @keyframes scan {
          0% {
            top: 1rem;
          }
          50% {
            top: calc(100% - 1rem);
          }
          100% {
            top: 1rem;
          }
        }
        .animate-scan {
          animation: scan 2s ease-in-out infinite;
        }
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

export default BarcodeScanner;
