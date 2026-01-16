'use client';

import React, { useRef, useCallback, useState, forwardRef, useImperativeHandle, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Trash2, Info, AlertCircle, Lock, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
  backgroundColor?: string;
  penColor?: string;
  borderColor?: string;
}

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
    },
    ref
  ) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [isEmpty, setIsEmpty] = useState(true);
    const [signedAt, setSignedAt] = useState<Date | null>(null);
    const lastPointRef = useRef<{ x: number; y: number } | null>(null);

    const getContext = useCallback(() => {
      const canvas = canvasRef.current;
      if (!canvas) return null;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = penColor;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
      return ctx;
    }, [penColor]);

    const getCoordinates = useCallback((e: React.MouseEvent | React.TouchEvent): { x: number; y: number } | null => {
      const canvas = canvasRef.current;
      if (!canvas) return null;
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      if ('touches' in e) {
        const touch = e.touches[0];
        return {
          x: (touch.clientX - rect.left) * scaleX,
          y: (touch.clientY - rect.top) * scaleY,
        };
      } else {
        return {
          x: (e.clientX - rect.left) * scaleX,
          y: (e.clientY - rect.top) * scaleY,
        };
      }
    }, []);

    const startDrawing = useCallback((e: React.MouseEvent | React.TouchEvent) => {
      if (disabled) return;
      e.preventDefault();
      const coords = getCoordinates(e);
      if (!coords) return;
      setIsDrawing(true);
      lastPointRef.current = coords;
    }, [disabled, getCoordinates]);

    const draw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
      if (!isDrawing || disabled) return;
      e.preventDefault();
      const coords = getCoordinates(e);
      const ctx = getContext();
      if (!coords || !ctx || !lastPointRef.current) return;

      ctx.beginPath();
      ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
      ctx.lineTo(coords.x, coords.y);
      ctx.stroke();

      lastPointRef.current = coords;
      setIsEmpty(false);
    }, [isDrawing, disabled, getCoordinates, getContext]);

    const stopDrawing = useCallback(() => {
      if (!isDrawing) return;
      setIsDrawing(false);
      lastPointRef.current = null;

      if (!isEmpty) {
        setSignedAt(new Date());
        const canvas = canvasRef.current;
        if (canvas) {
          const signature = canvas.toDataURL('image/png');
          onSignatureChange?.(signature);
          onSignatureEnd?.(signature);
        }
      }
    }, [isDrawing, isEmpty, onSignatureChange, onSignatureEnd]);

    const clearCanvas = useCallback(() => {
      const canvas = canvasRef.current;
      const ctx = getContext();
      if (!canvas || !ctx) return;
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      setIsEmpty(true);
      setSignedAt(null);
      onSignatureChange?.(null);
      onClear?.();
    }, [backgroundColor, getContext, onSignatureChange, onClear]);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const resizeCanvas = () => {
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * 2;
        canvas.height = rect.height * 2;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.scale(2, 2);
          ctx.fillStyle = backgroundColor;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
      };

      resizeCanvas();
      window.addEventListener('resize', resizeCanvas);
      return () => window.removeEventListener('resize', resizeCanvas);
    }, [backgroundColor]);

    useImperativeHandle(ref, () => ({
      clearSignature: clearCanvas,
      getSignature: () => {
        if (isEmpty) return null;
        const canvas = canvasRef.current;
        return canvas ? canvas.toDataURL('image/png') : null;
      },
      isEmpty: () => isEmpty,
    }));

    return (
      <div className="mb-5">
        {label && (
          <div className="flex items-center gap-1 mb-2">
            <span className="text-sm font-semibold text-gray-800">{label}</span>
            {required && <span className="text-red-500">*</span>}
          </div>
        )}

        {disclaimer && (
          <div className="flex items-start gap-2 p-3 bg-gray-100 rounded-lg mb-3">
            <Info className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-gray-600">{disclaimer}</p>
          </div>
        )}

        <div
          className={cn(
            'relative rounded-xl border-2 overflow-hidden',
            error ? 'border-red-500' : `border-[${borderColor}]`,
            disabled && 'opacity-60'
          )}
          style={{ height, borderColor: error ? undefined : borderColor }}
        >
          {disabled ? (
            <div className="flex flex-col items-center justify-center h-full" style={{ backgroundColor }}>
              <Lock className="w-6 h-6 text-gray-400 mb-2" />
              <span className="text-sm text-gray-500">Signature locked</span>
            </div>
          ) : (
            <canvas
              ref={canvasRef}
              className="w-full h-full cursor-crosshair touch-none"
              style={{ backgroundColor }}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
            />
          )}

          <div className="absolute bottom-6 left-4 right-4 flex items-center">
            <div className="flex-1 border-b border-dashed border-gray-300" />
            <span className="absolute left-0 bottom-1 text-sm text-gray-400 font-medium">X</span>
          </div>
        </div>

        <div className="flex items-center justify-between mt-2">
          <div>
            {signedAt && !isEmpty && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Clock className="w-3 h-3" />
                <span>
                  Signed on {signedAt.toLocaleDateString()} at {signedAt.toLocaleTimeString()}
                </span>
              </div>
            )}
          </div>
          
          {!disabled && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearCanvas}
              disabled={isEmpty}
              className={cn('gap-1', isEmpty && 'opacity-50')}
            >
              <Trash2 className="w-4 h-4" />
              {clearButtonLabel}
            </Button>
          )}
        </div>

        {error && (
          <div className="flex items-center gap-1 mt-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-red-500" />
            <p className="text-xs text-red-500">{error}</p>
          </div>
        )}
      </div>
    );
  }
);

SignaturePad.displayName = 'SignaturePad';

export default SignaturePad;
