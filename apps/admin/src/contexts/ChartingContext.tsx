'use client';

import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useMemo,
  ReactNode,
} from 'react';

// Types
export type ViewMode = 'front' | 'back' | 'left' | 'right' | '3d';
export type BodyPart = 'face' | 'neck' | 'body' | 'hands' | 'scalp';
export type Gender = 'male' | 'female';
export type ActiveTool = 'inject' | 'erase' | 'select' | 'measure' | 'annotate' | null;

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: 'neurotoxin' | 'filler' | 'biostimulator' | 'prp' | 'other';
  unitType: 'units' | 'ml' | 'syringe';
  pricePerUnit: number;
  color: string;
}

export interface InjectionPoint {
  id: string;
  x: number;
  y: number;
  productId: string;
  productName: string;
  dosage: number;
  unitType: string;
  depth?: 'superficial' | 'mid' | 'deep';
  technique?: 'bolus' | 'linear' | 'fanning' | 'cross-hatching';
  notes?: string;
  timestamp: number;
}

export interface ChartingState {
  viewMode: ViewMode;
  bodyPart: BodyPart;
  gender: Gender;
  activeTool: ActiveTool;
  selectedProduct: Product | null;
  dosage: number;
  injectionPoints: InjectionPoint[];
}

interface HistoryState {
  past: ChartingState[];
  present: ChartingState;
  future: ChartingState[];
}

// Actions
type ChartingAction =
  | { type: 'SET_VIEW_MODE'; payload: ViewMode }
  | { type: 'SET_BODY_PART'; payload: BodyPart }
  | { type: 'SET_GENDER'; payload: Gender }
  | { type: 'SET_ACTIVE_TOOL'; payload: ActiveTool }
  | { type: 'SET_PRODUCT'; payload: Product | null }
  | { type: 'SET_DOSAGE'; payload: number }
  | { type: 'ADD_INJECTION_POINT'; payload: Omit<InjectionPoint, 'id' | 'timestamp'> }
  | { type: 'REMOVE_INJECTION_POINT'; payload: string }
  | { type: 'UPDATE_INJECTION_POINT'; payload: { id: string; updates: Partial<InjectionPoint> } }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'CLEAR_ALL' };

const MAX_HISTORY_LENGTH = 50;

const initialChartingState: ChartingState = {
  viewMode: 'front',
  bodyPart: 'face',
  gender: 'female',
  activeTool: null,
  selectedProduct: null,
  dosage: 4,
  injectionPoints: [],
};

const initialHistoryState: HistoryState = {
  past: [],
  present: initialChartingState,
  future: [],
};

// Helper to create new history entry
function pushToHistory(
  past: ChartingState[],
  present: ChartingState
): ChartingState[] {
  const newPast = [...past, present];
  if (newPast.length > MAX_HISTORY_LENGTH) {
    return newPast.slice(newPast.length - MAX_HISTORY_LENGTH);
  }
  return newPast;
}

// Reducer
function chartingReducer(state: HistoryState, action: ChartingAction): HistoryState {
  const { past, present, future } = state;

  switch (action.type) {
    case 'SET_VIEW_MODE': {
      const newPresent = { ...present, viewMode: action.payload };
      return {
        past: pushToHistory(past, present),
        present: newPresent,
        future: [],
      };
    }

    case 'SET_BODY_PART': {
      const newPresent = { ...present, bodyPart: action.payload };
      return {
        past: pushToHistory(past, present),
        present: newPresent,
        future: [],
      };
    }

    case 'SET_GENDER': {
      const newPresent = { ...present, gender: action.payload };
      return {
        past: pushToHistory(past, present),
        present: newPresent,
        future: [],
      };
    }

    case 'SET_ACTIVE_TOOL': {
      // Tool changes don't affect history
      return {
        ...state,
        present: { ...present, activeTool: action.payload },
      };
    }

    case 'SET_PRODUCT': {
      // Product selection doesn't affect history
      return {
        ...state,
        present: { ...present, selectedProduct: action.payload },
      };
    }

    case 'SET_DOSAGE': {
      // Dosage changes don't affect history
      return {
        ...state,
        present: { ...present, dosage: action.payload },
      };
    }

    case 'ADD_INJECTION_POINT': {
      const newPoint: InjectionPoint = {
        ...action.payload,
        id: `inj-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
      };
      const newPresent = {
        ...present,
        injectionPoints: [...present.injectionPoints, newPoint],
      };
      return {
        past: pushToHistory(past, present),
        present: newPresent,
        future: [],
      };
    }

    case 'REMOVE_INJECTION_POINT': {
      const newPresent = {
        ...present,
        injectionPoints: present.injectionPoints.filter(
          (point) => point.id !== action.payload
        ),
      };
      return {
        past: pushToHistory(past, present),
        present: newPresent,
        future: [],
      };
    }

    case 'UPDATE_INJECTION_POINT': {
      const newPresent = {
        ...present,
        injectionPoints: present.injectionPoints.map((point) =>
          point.id === action.payload.id
            ? { ...point, ...action.payload.updates }
            : point
        ),
      };
      return {
        past: pushToHistory(past, present),
        present: newPresent,
        future: [],
      };
    }

    case 'UNDO': {
      if (past.length === 0) return state;
      const previous = past[past.length - 1];
      const newPast = past.slice(0, past.length - 1);
      return {
        past: newPast,
        present: previous,
        future: [present, ...future],
      };
    }

    case 'REDO': {
      if (future.length === 0) return state;
      const next = future[0];
      const newFuture = future.slice(1);
      return {
        past: [...past, present],
        present: next,
        future: newFuture,
      };
    }

    case 'CLEAR_ALL': {
      const newPresent = {
        ...present,
        injectionPoints: [],
        activeTool: null,
        selectedProduct: null,
      };
      return {
        past: pushToHistory(past, present),
        present: newPresent,
        future: [],
      };
    }

    default:
      return state;
  }
}

// Context interface
interface ChartingContextValue {
  // State
  viewMode: ViewMode;
  bodyPart: BodyPart;
  gender: Gender;
  activeTool: ActiveTool;
  selectedProduct: Product | null;
  dosage: number;
  injectionPoints: InjectionPoint[];

  // Computed values
  totalUnits: number;
  totalCost: number;
  canUndo: boolean;
  canRedo: boolean;
  historyLength: number;

  // Actions
  setViewMode: (mode: ViewMode) => void;
  setBodyPart: (part: BodyPart) => void;
  setGender: (gender: Gender) => void;
  setActiveTool: (tool: ActiveTool) => void;
  setProduct: (product: Product | null) => void;
  setDosage: (dosage: number) => void;
  addInjectionPoint: (point: Omit<InjectionPoint, 'id' | 'timestamp'>) => void;
  removeInjectionPoint: (id: string) => void;
  updateInjectionPoint: (id: string, updates: Partial<InjectionPoint>) => void;
  undo: () => void;
  redo: () => void;
  clearAll: () => void;
}

const ChartingContext = createContext<ChartingContextValue | null>(null);

// Provider component
interface ChartingProviderProps {
  children: ReactNode;
}

export function ChartingProvider({ children }: ChartingProviderProps) {
  const [state, dispatch] = useReducer(chartingReducer, initialHistoryState);
  const { past, present, future } = state;

  // Actions
  const setViewMode = useCallback((mode: ViewMode) => {
    dispatch({ type: 'SET_VIEW_MODE', payload: mode });
  }, []);

  const setBodyPart = useCallback((part: BodyPart) => {
    dispatch({ type: 'SET_BODY_PART', payload: part });
  }, []);

  const setGender = useCallback((gender: Gender) => {
    dispatch({ type: 'SET_GENDER', payload: gender });
  }, []);

  const setActiveTool = useCallback((tool: ActiveTool) => {
    dispatch({ type: 'SET_ACTIVE_TOOL', payload: tool });
  }, []);

  const setProduct = useCallback((product: Product | null) => {
    dispatch({ type: 'SET_PRODUCT', payload: product });
  }, []);

  const setDosage = useCallback((dosage: number) => {
    dispatch({ type: 'SET_DOSAGE', payload: dosage });
  }, []);

  const addInjectionPoint = useCallback(
    (point: Omit<InjectionPoint, 'id' | 'timestamp'>) => {
      dispatch({ type: 'ADD_INJECTION_POINT', payload: point });
    },
    []
  );

  const removeInjectionPoint = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_INJECTION_POINT', payload: id });
  }, []);

  const updateInjectionPoint = useCallback(
    (id: string, updates: Partial<InjectionPoint>) => {
      dispatch({ type: 'UPDATE_INJECTION_POINT', payload: { id, updates } });
    },
    []
  );

  const undo = useCallback(() => {
    dispatch({ type: 'UNDO' });
  }, []);

  const redo = useCallback(() => {
    dispatch({ type: 'REDO' });
  }, []);

  const clearAll = useCallback(() => {
    dispatch({ type: 'CLEAR_ALL' });
  }, []);

  // Computed values
  const totalUnits = useMemo(() => {
    return present.injectionPoints.reduce((sum, point) => sum + point.dosage, 0);
  }, [present.injectionPoints]);

  const totalCost = useMemo(() => {
    return present.injectionPoints.reduce((sum, point) => {
      const product = present.selectedProduct;
      if (product && point.productId === product.id) {
        return sum + point.dosage * product.pricePerUnit;
      }
      return sum;
    }, 0);
  }, [present.injectionPoints, present.selectedProduct]);

  const canUndo = past.length > 0;
  const canRedo = future.length > 0;

  const value: ChartingContextValue = useMemo(
    () => ({
      // State
      viewMode: present.viewMode,
      bodyPart: present.bodyPart,
      gender: present.gender,
      activeTool: present.activeTool,
      selectedProduct: present.selectedProduct,
      dosage: present.dosage,
      injectionPoints: present.injectionPoints,

      // Computed
      totalUnits,
      totalCost,
      canUndo,
      canRedo,
      historyLength: past.length,

      // Actions
      setViewMode,
      setBodyPart,
      setGender,
      setActiveTool,
      setProduct,
      setDosage,
      addInjectionPoint,
      removeInjectionPoint,
      updateInjectionPoint,
      undo,
      redo,
      clearAll,
    }),
    [
      present,
      totalUnits,
      totalCost,
      canUndo,
      canRedo,
      past.length,
      setViewMode,
      setBodyPart,
      setGender,
      setActiveTool,
      setProduct,
      setDosage,
      addInjectionPoint,
      removeInjectionPoint,
      updateInjectionPoint,
      undo,
      redo,
      clearAll,
    ]
  );

  return (
    <ChartingContext.Provider value={value}>
      {children}
    </ChartingContext.Provider>
  );
}

// Hook to consume context
export function useCharting(): ChartingContextValue {
  const context = useContext(ChartingContext);
  if (!context) {
    throw new Error('useCharting must be used within a ChartingProvider');
  }
  return context;
}

export default ChartingContext;
