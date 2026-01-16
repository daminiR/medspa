'use client';

import React, { useState } from 'react';

interface InjectionPointProps {
  x: number; // percentage (0-100) or pixel position
  y: number; // percentage (0-100) or pixel position
  product: {
    name: string;
    color: string;
  };
  units: number;
  isSelected?: boolean;
  isNew?: boolean; // triggers pulse animation
  usePixels?: boolean; // if true, x/y are pixels; if false, percentages
  onClick?: () => void;
}

export function InjectionPoint({
  x,
  y,
  product,
  units,
  isSelected = false,
  isNew = false,
  usePixels = false,
  onClick,
}: InjectionPointProps) {
  const [isHovered, setIsHovered] = useState(false);

  const showBadge = isSelected || isHovered;
  const size = isSelected ? 16 : 12;
  const hitAreaSize = 44; // Touch-friendly minimum

  const positionStyle: React.CSSProperties = usePixels
    ? { left: `${x}px`, top: `${y}px` }
    : { left: `${x}%`, top: `${y}%` };

  return (
    <div
      className="absolute"
      style={{
        ...positionStyle,
        transform: 'translate(-50%, -50%)',
        zIndex: isSelected ? 20 : 10,
      }}
    >
      {/* Touch-friendly hit area */}
      <button
        type="button"
        className="relative flex items-center justify-center cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 rounded-full"
        style={{
          width: `${hitAreaSize}px`,
          height: `${hitAreaSize}px`,
        }}
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onTouchStart={() => setIsHovered(true)}
        onTouchEnd={() => setIsHovered(false)}
        aria-label={`${product.name} injection point: ${units} units`}
      >
        {/* Visual dot */}
        <div
          className={`
            rounded-full shadow-md transition-all duration-150 ease-out
            ${isNew ? 'animate-pulse' : ''}
            ${isSelected ? 'ring-2 ring-white ring-offset-1' : ''}
          `}
          style={{
            width: `${size}px`,
            height: `${size}px`,
            backgroundColor: product.color,
            boxShadow: isSelected
              ? `0 0 0 2px white, 0 0 8px ${product.color}`
              : `0 1px 3px rgba(0,0,0,0.3)`,
          }}
        />

        {/* Units badge */}
        {showBadge && (
          <div
            className="absolute -top-6 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded text-xs font-medium text-white whitespace-nowrap shadow-lg animate-in fade-in zoom-in-95 duration-150"
            style={{ backgroundColor: product.color }}
          >
            {units}u
          </div>
        )}
      </button>
    </div>
  );
}

export default InjectionPoint;
