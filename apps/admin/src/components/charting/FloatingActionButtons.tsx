'use client';

import React, { useState } from 'react';
import { Save, Printer, Download, FileText, Loader2 } from 'lucide-react';
import { DraggablePanel } from './DraggablePanel';
import { useChartingTheme } from '@/contexts/ChartingThemeContext';

interface FloatingActionButtonsProps {
  onSave: () => void;
  onPrint: () => void;
  onExport: () => void;
  onNotes: () => void;
  isSaving?: boolean;
  defaultCollapsed?: boolean;
}

interface ActionButtonProps {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  isPrimary?: boolean;
  isLoading?: boolean;
  disabled?: boolean;
  isDark?: boolean;
}

function ActionButton({
  onClick,
  icon,
  label,
  isPrimary = false,
  isLoading = false,
  disabled = false,
  isDark = true,
}: ActionButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      title={label}
      className={`
        w-12 h-12 rounded-full flex items-center justify-center
        transition-all duration-200 ease-in-out
        shadow-lg hover:shadow-xl
        transform hover:scale-105 active:scale-95
        focus:outline-none focus:ring-2 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
        ${isDark ? 'focus:ring-offset-gray-800' : 'focus:ring-offset-white'}
        ${
          isPrimary
            ? 'bg-purple-600 hover:bg-purple-700 text-white focus:ring-purple-500'
            : isDark
              ? 'bg-gray-700 hover:bg-gray-600 text-gray-200 focus:ring-gray-500 border border-gray-600'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700 focus:ring-gray-400 border border-gray-300'
        }
      `}
    >
      {isLoading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        icon
      )}
    </button>
  );
}

export function FloatingActionButtons({
  onSave,
  onPrint,
  onExport,
  onNotes,
  isSaving = false,
  defaultCollapsed = false,
}: FloatingActionButtonsProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  // Use fixed initial position for SSR to avoid hydration mismatch
  const [defaultPosition, setDefaultPosition] = React.useState({ x: 1000, y: 600 });

  // Get theme from context (safely returns default if outside provider)
  const { theme } = useChartingTheme();
  const isDark = theme === 'dark';

  // Adjust position based on window size after mount (client-side only)
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      setDefaultPosition({
        x: window.innerWidth - 280,
        y: window.innerHeight - 140,
      });
    }
  }, []);

  const actions = [
    {
      id: 'save',
      icon: <Save className="w-5 h-5" />,
      label: 'Save Chart',
      onClick: onSave,
      isPrimary: true,
      isLoading: isSaving,
    },
    {
      id: 'print',
      icon: <Printer className="w-5 h-5" />,
      label: 'Print Chart',
      onClick: onPrint,
      isPrimary: false,
      isLoading: false,
    },
    {
      id: 'export',
      icon: <Download className="w-5 h-5" />,
      label: 'Export Chart',
      onClick: onExport,
      isPrimary: false,
      isLoading: false,
    },
    {
      id: 'notes',
      icon: <FileText className="w-5 h-5" />,
      label: 'Add Notes',
      onClick: onNotes,
      isPrimary: false,
      isLoading: false,
    },
  ];

  return (
    <DraggablePanel
      panelId="floating-action-buttons"
      initialPosition={defaultPosition}
      title="Actions"
      variant="auto"
      onCollapse={() => setIsCollapsed(!isCollapsed)}
      isCollapsed={isCollapsed}
    >
      <div className="flex flex-row items-center gap-3" style={{ pointerEvents: 'auto' }}>
        {actions.map((action) => (
          <ActionButton
            key={action.id}
            onClick={action.onClick}
            icon={action.icon}
            label={action.label}
            isPrimary={action.isPrimary}
            isLoading={action.isLoading}
            disabled={isSaving && action.id !== 'save'}
            isDark={isDark}
          />
        ))}
      </div>
    </DraggablePanel>
  );
}

export default FloatingActionButtons;
