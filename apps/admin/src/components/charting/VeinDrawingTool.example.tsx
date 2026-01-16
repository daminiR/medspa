'use client';

/**
 * VeinDrawingTool Example Usage
 *
 * This file demonstrates how to integrate the VeinDrawingTool component
 * for sclerotherapy documentation in the charting system.
 */

import React, { useState, useRef } from 'react';
import {
  VeinDrawingTool,
  VeinDrawingToolRef,
  VeinPath,
  useVeinPathsState,
  VEIN_TYPE_CONFIGS,
} from './VeinDrawingTool';

// =============================================================================
// BASIC USAGE EXAMPLE
// =============================================================================

/**
 * Basic example showing standalone VeinDrawingTool usage
 */
export function BasicVeinDrawingExample() {
  const [isActive, setIsActive] = useState(true);
  const toolRef = useRef<VeinDrawingToolRef>(null);

  // Use the custom hook for state management
  const {
    veinPaths,
    selectedVeinId,
    setVeinPaths,
    setSelectedVeinId,
    getTreatedVeins,
    getUntreatedVeins,
    getTotalInjectionSites,
  } = useVeinPathsState();

  const handleSave = () => {
    const paths = toolRef.current?.exportPaths();
    console.log('Saved vein paths:', paths);
    // In real usage, you would send this to your backend/state management
  };

  return (
    <div className="relative h-screen w-full bg-gray-100">
      {/* Toolbar to toggle tool */}
      <div className="absolute top-4 left-4 z-50 bg-white rounded-lg shadow-lg p-4 space-y-3">
        <h3 className="font-semibold text-gray-900">Sclerotherapy Chart</h3>

        <button
          onClick={() => setIsActive(!isActive)}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            isActive
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {isActive ? 'Drawing Active' : 'Activate Drawing'}
        </button>

        <div className="text-sm text-gray-600 space-y-1">
          <p>Veins: {veinPaths.length}</p>
          <p>Treated: {getTreatedVeins().length}</p>
          <p>Untreated: {getUntreatedVeins().length}</p>
          <p>Injection Sites: {getTotalInjectionSites()}</p>
        </div>

        <button
          onClick={handleSave}
          className="w-full px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
        >
          Save Chart
        </button>
      </div>

      {/* The VeinDrawingTool */}
      <VeinDrawingTool
        ref={toolRef}
        isActive={isActive}
        veinPaths={veinPaths}
        onVeinPathsChange={setVeinPaths}
        selectedVeinId={selectedVeinId}
        onSelectionChange={setSelectedVeinId}
        showToolbar={true}
        initialVeinType="spider"
      />
    </div>
  );
}

// =============================================================================
// INTEGRATED CHARTING EXAMPLE
// =============================================================================

/**
 * Example showing integration within a larger charting context
 * with leg image background
 */
export function IntegratedChartingExample() {
  const [isVeinToolActive, setIsVeinToolActive] = useState(false);
  const [veinPaths, setVeinPaths] = useState<VeinPath[]>([]);
  const [selectedVeinId, setSelectedVeinId] = useState<string | null>(null);

  return (
    <div className="flex h-screen">
      {/* Left Sidebar - Tool Selection */}
      <div className="w-64 bg-white border-r border-gray-200 p-4 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Charting Tools</h2>

        <div className="space-y-2">
          <button
            onClick={() => setIsVeinToolActive(false)}
            className={`w-full px-3 py-2 rounded-lg text-left ${
              !isVeinToolActive
                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
            }`}
          >
            Standard Charting
          </button>

          <button
            onClick={() => setIsVeinToolActive(true)}
            className={`w-full px-3 py-2 rounded-lg text-left ${
              isVeinToolActive
                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
            }`}
          >
            Vein Mapping (Sclerotherapy)
          </button>
        </div>

        {/* Vein Type Legend */}
        {isVeinToolActive && (
          <div className="pt-4 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Vein Types</h3>
            <div className="space-y-2 text-sm">
              {(Object.keys(VEIN_TYPE_CONFIGS) as Array<keyof typeof VEIN_TYPE_CONFIGS>).map((key) => {
                const config = VEIN_TYPE_CONFIGS[key];
                return (
                  <div key={key} className="flex items-center gap-2">
                    <div
                      className="w-4 h-1 rounded"
                      style={{
                        backgroundColor: config.color,
                        height: config.strokeWidth,
                      }}
                    />
                    <span className="text-gray-600">{config.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Summary */}
        {isVeinToolActive && veinPaths.length > 0 && (
          <div className="pt-4 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Treatment Summary</h3>
            <div className="space-y-1 text-sm text-gray-600">
              <p>Total Veins: {veinPaths.length}</p>
              <p>Spider: {veinPaths.filter(v => v.veinType === 'spider').length}</p>
              <p>Reticular: {veinPaths.filter(v => v.veinType === 'reticular').length}</p>
              <p className="pt-2 font-medium text-green-600">
                Treated: {veinPaths.filter(v => v.treatmentStatus === 'treated').length}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Main Chart Area */}
      <div className="flex-1 relative bg-gray-50">
        {isVeinToolActive ? (
          <VeinDrawingTool
            isActive={true}
            veinPaths={veinPaths}
            onVeinPathsChange={setVeinPaths}
            selectedVeinId={selectedVeinId}
            onSelectionChange={setSelectedVeinId}
            showToolbar={true}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-500">
            Standard charting view would go here
          </div>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// CONTROLLED EXAMPLE WITH EXTERNAL STATE
// =============================================================================

/**
 * Example showing controlled usage with external state management
 * (e.g., for integration with Redux or other state management)
 */
export function ControlledVeinDrawingExample({
  initialPaths = [],
  onPathsChange,
}: {
  initialPaths?: VeinPath[];
  onPathsChange?: (paths: VeinPath[]) => void;
}) {
  const [veinPaths, setVeinPaths] = useState<VeinPath[]>(initialPaths);
  const [selectedVeinId, setSelectedVeinId] = useState<string | null>(null);

  const handlePathsChange = (paths: VeinPath[]) => {
    setVeinPaths(paths);
    onPathsChange?.(paths);
  };

  return (
    <div className="h-[600px] relative border border-gray-200 rounded-xl overflow-hidden">
      <VeinDrawingTool
        isActive={true}
        veinPaths={veinPaths}
        onVeinPathsChange={handlePathsChange}
        selectedVeinId={selectedVeinId}
        onSelectionChange={setSelectedVeinId}
        showToolbar={true}
        readOnly={false}
      />
    </div>
  );
}

// =============================================================================
// DEFAULT EXPORT
// =============================================================================

export default BasicVeinDrawingExample;
