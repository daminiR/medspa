'use client';

import React, { useState, useCallback } from 'react';

interface InjectionPoint {
  id: string;
  x: number;
  y: number;
  label?: string;
  units?: number;
  product?: string;
}

interface Centered3DFaceViewerProps {
  gender: 'male' | 'female';
  onPointClick?: (point: InjectionPoint) => void;
  injectionPoints?: InjectionPoint[];
}

export function Centered3DFaceViewer({
  gender,
  onPointClick,
  injectionPoints = [],
}: Centered3DFaceViewerProps) {
  const [rotation, setRotation] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);

  const handleRotateLeft = useCallback(() => {
    setRotation((prev) => prev - 15);
  }, []);

  const handleRotateRight = useCallback(() => {
    setRotation((prev) => prev + 15);
  }, []);

  const handleResetView = useCallback(() => {
    setRotation(0);
    setIsAnimating(true);
  }, []);

  const handlePointClick = useCallback(
    (point: InjectionPoint) => {
      if (onPointClick) {
        onPointClick(point);
      }
    },
    [onPointClick]
  );

  const isMale = gender === 'male';

  return (
    <div className="relative flex flex-col items-center justify-center w-full h-full min-h-[100dvh] bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
      {/* Ambient background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      {/* 3D Face Container */}
      <div
        className={`relative flex items-center justify-center flex-1 w-full ${
          isAnimating ? 'animate-float' : ''
        }`}
        style={{
          transform: `perspective(1000px) rotateY(${rotation}deg)`,
          transition: 'transform 0.3s ease-out',
        }}
      >
        {/* Stylized Face Illustration - scales to 80-90% of viewport */}
        <div
          className="relative"
          style={{
            width: 'min(70vw, 55vh)',
            height: 'min(93vw, 73vh)',
            aspectRatio: '3 / 4',
          }}
        >
          {/* Face base shape */}
          <div
            className={`absolute inset-0 rounded-[45%_45%_40%_40%] ${
              isMale
                ? 'bg-gradient-to-b from-amber-200 via-amber-100 to-amber-200'
                : 'bg-gradient-to-b from-rose-100 via-pink-50 to-rose-100'
            }`}
            style={{
              boxShadow: `
                inset -8px -8px 20px rgba(0,0,0,0.1),
                inset 8px 8px 20px rgba(255,255,255,0.3),
                0 20px 40px rgba(0,0,0,0.3)
              `,
            }}
          >
            {/* Forehead highlight */}
            <div className="absolute top-[5%] left-1/2 -translate-x-1/2 w-[40%] h-[10%] bg-white/20 rounded-full blur-md" />

            {/* Eyes */}
            <div className="absolute top-[35%] left-[22%] w-[12%] h-[5%] bg-white rounded-full shadow-inner">
              <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[75%] rounded-full ${isMale ? 'bg-amber-800' : 'bg-blue-400'}`}>
                <div className="absolute top-[15%] left-[15%] w-[30%] h-[30%] bg-white rounded-full" />
              </div>
            </div>
            <div className="absolute top-[35%] right-[22%] w-[12%] h-[5%] bg-white rounded-full shadow-inner">
              <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[75%] rounded-full ${isMale ? 'bg-amber-800' : 'bg-blue-400'}`}>
                <div className="absolute top-[15%] left-[15%] w-[30%] h-[30%] bg-white rounded-full" />
              </div>
            </div>

            {/* Eyebrows */}
            <div className={`absolute top-[28%] left-[18%] w-[16%] h-[1.5%] ${isMale ? 'bg-amber-900' : 'bg-amber-700'} rounded-full`} style={{ transform: 'rotate(-5deg)' }} />
            <div className={`absolute top-[28%] right-[18%] w-[16%] h-[1.5%] ${isMale ? 'bg-amber-900' : 'bg-amber-700'} rounded-full`} style={{ transform: 'rotate(5deg)' }} />

            {/* Nose */}
            <div className="absolute top-[45%] left-1/2 -translate-x-1/2 w-[6%] h-[15%]">
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[150%] h-[25%] bg-gradient-to-b from-transparent to-black/5 rounded-full" />
            </div>

            {/* Lips */}
            <div className="absolute top-[68%] left-1/2 -translate-x-1/2 w-[16%]">
              <div className={`w-full h-[0.8rem] ${isMale ? 'bg-rose-300' : 'bg-rose-400'} rounded-full`} style={{ height: '2.5%' }} />
              <div className={`w-[80%] h-[0.6rem] ${isMale ? 'bg-rose-200' : 'bg-rose-300'} rounded-full mt-[2px] mx-auto`} style={{ height: '2%' }} />
            </div>

            {/* Cheek highlights */}
            <div className="absolute top-[50%] left-[10%] w-[12%] h-[8%] bg-rose-200/30 rounded-full blur-sm" />
            <div className="absolute top-[50%] right-[10%] w-[12%] h-[8%] bg-rose-200/30 rounded-full blur-sm" />

            {/* Chin shadow */}
            <div className="absolute bottom-[5%] left-1/2 -translate-x-1/2 w-[25%] h-[5%] bg-black/5 rounded-full blur-sm" />
          </div>

          {/* Neck */}
          <div
            className={`absolute -bottom-[10%] left-1/2 -translate-x-1/2 w-[30%] h-[20%] rounded-b-3xl ${
              isMale
                ? 'bg-gradient-to-b from-amber-200 to-amber-300'
                : 'bg-gradient-to-b from-rose-100 to-rose-200'
            }`}
            style={{
              boxShadow: 'inset 0 -10px 20px rgba(0,0,0,0.1)',
            }}
          />

          {/* Hair indication */}
          <div
            className={`absolute -top-[3%] left-1/2 -translate-x-1/2 w-[85%] h-[25%] rounded-t-full ${
              isMale ? 'bg-amber-900' : 'bg-amber-800'
            }`}
            style={{
              clipPath: isMale
                ? 'ellipse(50% 60% at 50% 100%)'
                : 'ellipse(55% 80% at 50% 100%)',
            }}
          />

          {/* Injection Points Overlay */}
          {injectionPoints.map((point) => (
            <button
              key={point.id}
              onClick={() => handlePointClick(point)}
              className="absolute w-[4%] h-[3%] min-w-[12px] min-h-[12px] bg-blue-500 rounded-full border-2 border-white shadow-lg hover:scale-150 hover:bg-blue-400 transition-transform cursor-pointer z-10"
              style={{
                left: `${point.x}%`,
                top: `${point.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
              title={point.label || `Point ${point.id}`}
            >
              {point.units && (
                <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-white bg-blue-600 px-1.5 py-0.5 rounded whitespace-nowrap">
                  {point.units}u
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Rotation Controls - compact at bottom */}
      <div className="relative z-10 flex items-center gap-4 py-2">
        <button
          onClick={handleRotateLeft}
          className="flex items-center justify-center w-12 h-12 bg-slate-700 hover:bg-slate-600 text-white rounded-full transition-colors shadow-lg"
          aria-label="Rotate left"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>

        <button
          onClick={handleResetView}
          className="flex items-center justify-center px-5 h-12 bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium rounded-full transition-colors shadow-lg"
          aria-label="Reset view"
        >
          Reset
        </button>

        <button
          onClick={handleRotateRight}
          className="flex items-center justify-center w-12 h-12 bg-slate-700 hover:bg-slate-600 text-white rounded-full transition-colors shadow-lg"
          aria-label="Rotate right"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      </div>

      {/* Loading/Placeholder Message - minimal padding */}
      <div className="relative z-10 pb-2">
        <div className="flex items-center gap-2 text-slate-400 text-sm">
          <div className="flex gap-1">
            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
          </div>
          <span>3D model loading...</span>
        </div>
      </div>

      {/* Float animation styles */}
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: perspective(1000px) rotateY(${rotation}deg) translateY(0px);
          }
          50% {
            transform: perspective(1000px) rotateY(${rotation}deg) translateY(-8px);
          }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

export default Centered3DFaceViewer;
