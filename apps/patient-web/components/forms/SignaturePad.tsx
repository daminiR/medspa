'use client';

import React, {
  useRef,
  useCallback,
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from 'react';

export interface SignaturePadRef {
  clearSignature: () => void;
  getSignature: () => string | null;
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
}

export const SignaturePad = forwardRef<SignaturePadRef, SignaturePadProps>(
  (props, ref) => {
    const {
      onSignatureChange,
      onSignatureEnd,
      onClear,
      label = 'Signature',
      disclaimer,
      clearButtonLabel = 'Clear',
      required = false,
      disabled = false,
      error,
      height = 200,
    } = props;

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [signatureEmpty, setSignatureEmpty] = useState(true);
    const [signedAt, setSignedAt] = useState<Date | null>(null);
    const lastPoint = useRef<{ x: number; y: number } | null>(null);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      ctx.fillStyle = '#FAFAFA';
      ctx.fillRect(0, 0, rect.width, rect.height);
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }, []);

    const getCoordinates = useCallback((e: MouseEvent | TouchEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return null;
      const rect = canvas.getBoundingClientRect();
      let clientX: number, clientY: number;
      if ('touches' in e) {
        if (e.touches.length === 0) return null;
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }
      return { x: clientX - rect.left, y: clientY - rect.top };
    }, []);

    const startDrawing = useCallback((e: React.MouseEvent | React.TouchEvent) => {
      if (disabled) return;
      e.preventDefault();
      const coords = getCoordinates(e.nativeEvent as MouseEvent | TouchEvent);
      if (!coords) return;
      setIsDrawing(true);
      lastPoint.current = coords;
    }, [disabled, getCoordinates]);

    const draw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
      if (!isDrawing || disabled) return;
      e.preventDefault();
      const coords = getCoordinates(e.nativeEvent as MouseEvent | TouchEvent);
      if (!coords || !lastPoint.current) return;
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!ctx) return;
      ctx.beginPath();
      ctx.moveTo(lastPoint.current.x, lastPoint.current.y);
      ctx.lineTo(coords.x, coords.y);
      ctx.stroke();
      lastPoint.current = coords;
      setSignatureEmpty(false);
    }, [isDrawing, disabled, getCoordinates]);

    const stopDrawing = useCallback(() => {
      if (isDrawing && !signatureEmpty) {
        const canvas = canvasRef.current;
        if (canvas) {
          const signature = canvas.toDataURL('image/png');
          setSignedAt(new Date());
          onSignatureChange?.(signature);
          onSignatureEnd?.(signature);
        }
      }
      setIsDrawing(false);
      lastPoint.current = null;
    }, [isDrawing, signatureEmpty, onSignatureChange, onSignatureEnd]);

    const clearSignature = useCallback(() => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!ctx || !canvas) return;
      const rect = canvas.getBoundingClientRect();
      ctx.fillStyle = '#FAFAFA';
      ctx.fillRect(0, 0, rect.width, rect.height);
      setSignatureEmpty(true);
      setSignedAt(null);
      onSignatureChange?.(null);
      onClear?.();
    }, [onSignatureChange, onClear]);

    const getSignature = useCallback(() => {
      if (signatureEmpty) return null;
      const canvas = canvasRef.current;
      return canvas ? canvas.toDataURL('image/png') : null;
    }, [signatureEmpty]);

    useImperativeHandle(ref, () => ({
      clearSignature,
      getSignature,
      isEmpty: () => signatureEmpty,
    }));

    const getBorderClass = () => {
      if (error) return 'border-red-400 bg-red-50';
      if (disabled) return 'border-gray-200 bg-gray-100';
      return 'border-gray-200 hover:border-purple-300';
    };

    const getButtonClass = () => {
      if (signatureEmpty) return 'text-gray-300 cursor-not-allowed';
      return 'text-gray-600 hover:text-gray-800 hover:bg-gray-100';
    };

    return (
      <div className="space-y-3">
        {label && (
          <label className="block text-sm font-semibold text-gray-800">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        {disclaimer && (
          <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
            <p>{disclaimer}</p>
          </div>
        )}

        <div 
          className={`relative border-2 rounded-xl overflow-hidden transition-colors ${getBorderClass()}`}
          style={{ height }}
        >
          <canvas
            ref={canvasRef}
            className={`w-full h-full ${disabled ? 'cursor-not-allowed' : 'cursor-crosshair'}`}
            style={{ touchAction: 'none' }}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />
          <div className="absolute bottom-8 left-5 right-5 flex items-center">
            <span className="text-gray-400 font-medium mr-2">X</span>
            <div className="flex-1 border-b border-dashed border-gray-300" />
          </div>
        </div>

        {!disabled && (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={clearSignature}
              disabled={signatureEmpty}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${getButtonClass()}`}
            >
              {clearButtonLabel}
            </button>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-1.5 text-sm text-red-500">
            <span>{error}</span>
          </div>
        )}

        {signedAt && !signatureEmpty && (
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <span>Signed on {signedAt.toLocaleDateString()}</span>
          </div>
        )}
      </div>
    );
  }
);

SignaturePad.displayName = 'SignaturePad';
export default SignaturePad;
