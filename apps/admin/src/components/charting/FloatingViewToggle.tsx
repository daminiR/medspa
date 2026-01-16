'use client';

import React, { startTransition, useState } from 'react';
import { Box, Layers, User, Users } from 'lucide-react';
import { DraggablePanel } from './DraggablePanel';
import { useChartingTheme } from '@/contexts/ChartingThemeContext';

export type ViewMode = '2D' | '3D';
export type BodyPart = 'face' | 'torso' | 'fullBody';
export type Gender = 'male' | 'female';

interface FloatingViewToggleProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  bodyPart: BodyPart;
  onBodyPartChange: (part: BodyPart) => void;
  gender: Gender;
  onGenderChange: (gender: Gender) => void;
  defaultCollapsed?: boolean;
}

interface ToggleButtonProps {
  onClick: () => void;
  icon?: React.ReactNode;
  label: string;
  isActive: boolean;
  activeColor?: 'white' | 'blue' | 'purple';
  isDark?: boolean;
}

function ToggleButton({
  onClick,
  icon,
  label,
  isActive,
  activeColor = 'white',
  isDark = true,
}: ToggleButtonProps) {
  const activeClasses = {
    white: isDark ? 'bg-white text-gray-900 shadow-md' : 'bg-gray-900 text-white shadow-md',
    blue: 'bg-blue-500 text-white shadow-md',
    purple: 'bg-purple-500 text-white shadow-md',
  };

  const inactiveClass = isDark
    ? 'text-white/80 hover:text-white hover:bg-white/10'
    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200';

  return (
    <button
      onClick={onClick}
      title={label}
      className={`
        flex items-center justify-center gap-1.5 px-4 rounded-full
        min-w-[48px] min-h-[48px] transition-all duration-200
        ${isActive ? activeClasses[activeColor] : inactiveClass}
      `}
    >
      {icon}
      <span className="text-sm font-medium whitespace-nowrap">{label}</span>
    </button>
  );
}

export function FloatingViewToggle({
  viewMode,
  onViewModeChange,
  bodyPart,
  onBodyPartChange,
  gender,
  onGenderChange,
  defaultCollapsed = false,
}: FloatingViewToggleProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  // Use fixed position that works for both SSR and client to avoid hydration mismatch
  const [defaultPosition] = useState({ x: 20, y: 68 });

  // Get theme from context (safely returns default if outside provider)
  const { theme } = useChartingTheme();
  const isDark = theme === 'dark';

  const bodyPartOptions: { value: BodyPart; label: string }[] = [
    { value: 'face', label: 'Face' },
    { value: 'torso', label: 'Torso' },
    { value: 'fullBody', label: 'Full Body' },
  ];

  const genderOptions: { value: Gender; label: string; icon: React.ReactNode }[] = [
    { value: 'male', label: 'Male', icon: <User className="w-5 h-5" /> },
    { value: 'female', label: 'Female', icon: <Users className="w-5 h-5" /> },
  ];

  // Theme-aware background for toggle groups
  const toggleGroupBg = isDark ? 'bg-black/20' : 'bg-gray-200';
  const dividerColor = isDark ? 'bg-white/20' : 'bg-gray-300';

  return (
    <DraggablePanel
      panelId="floating-view-toggle"
      initialPosition={defaultPosition}
      title="View Options"
      variant="auto"
      onCollapse={() => setIsCollapsed(!isCollapsed)}
      isCollapsed={isCollapsed}
    >
      <div className="flex flex-col gap-2" style={{ pointerEvents: 'auto' }}>
        {/* Top Row: View Mode + Body Part */}
        <div className="flex items-center gap-2" style={{ pointerEvents: 'auto' }}>
          {/* View Mode Toggle (2D/3D) */}
          <div className={`flex items-center ${toggleGroupBg} rounded-full p-0.5`} style={{ pointerEvents: 'auto' }}>
            <ToggleButton
              onClick={() => onViewModeChange('2D')}
              icon={<Layers className="w-5 h-5" />}
              label="2D"
              isActive={viewMode === '2D'}
              activeColor="white"
              isDark={isDark}
            />
            <ToggleButton
              onClick={() => onViewModeChange('3D')}
              icon={<Box className="w-5 h-5" />}
              label="3D"
              isActive={viewMode === '3D'}
              activeColor="white"
              isDark={isDark}
            />
          </div>

          {/* Divider */}
          <div className={`w-px h-10 ${dividerColor}`} />

          {/* Body Part Toggle (Face/Torso/Full Body) */}
          <div className={`flex items-center ${toggleGroupBg} rounded-full p-0.5`} style={{ pointerEvents: 'auto' }}>
            {bodyPartOptions.map((option) => (
              <ToggleButton
                key={option.value}
                onClick={() => onBodyPartChange(option.value)}
                label={option.label}
                isActive={bodyPart === option.value}
                activeColor="blue"
                isDark={isDark}
              />
            ))}
          </div>
        </div>

        {/* Bottom Row: Gender Toggle */}
        <div className="flex items-center justify-center" style={{ pointerEvents: 'auto' }}>
          <div className={`flex items-center ${toggleGroupBg} rounded-full p-0.5`} style={{ pointerEvents: 'auto' }}>
            {genderOptions.map((option) => (
              <ToggleButton
                key={option.value}
                onClick={() => onGenderChange(option.value)}
                icon={option.icon}
                label={option.label}
                isActive={gender === option.value}
                activeColor="purple"
                isDark={isDark}
              />
            ))}
          </div>
        </div>
      </div>
    </DraggablePanel>
  );
}

// Hook for managing FloatingViewToggle state
// Uses startTransition for non-blocking updates during view switches
export function useViewToggleState(
  initialViewMode: ViewMode = '2D',
  initialBodyPart: BodyPart = 'face',
  initialGender: Gender = 'female'
) {
  const [viewMode, setViewMode] = React.useState<ViewMode>(initialViewMode);
  const [bodyPart, setBodyPart] = React.useState<BodyPart>(initialBodyPart);
  const [gender, setGender] = React.useState<Gender>(initialGender);

  // Use startTransition to keep UI responsive during view mode changes
  // This prevents blocking while 3D components update
  const handleViewModeChange = React.useCallback((mode: ViewMode) => {
    startTransition(() => {
      setViewMode(mode);
    });
  }, []);

  // Use startTransition for body part changes to ensure smooth transitions
  const handleBodyPartChange = React.useCallback((part: BodyPart) => {
    startTransition(() => {
      setBodyPart(part);
    });
  }, []);

  // Use startTransition for gender changes to maintain responsiveness
  const handleGenderChange = React.useCallback((g: Gender) => {
    startTransition(() => {
      setGender(g);
    });
  }, []);

  return {
    viewMode,
    bodyPart,
    gender,
    onViewModeChange: handleViewModeChange,
    onBodyPartChange: handleBodyPartChange,
    onGenderChange: handleGenderChange,
  };
}

// Default export for convenience
export default FloatingViewToggle;
