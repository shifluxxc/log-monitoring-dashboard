// src/context/TraceContext.tsx
import React, { createContext, useReducer, useContext, ReactNode } from 'react';
import { Trace, TraceState, TraceAction } from '../types/trace';

// Initial State
const initialState: TraceState = {
  traces: [],
  selectedTrace: null,
  isLoading: false,
  error: null,
};

// Reducer
const traceReducer = (state: TraceState, action: TraceAction): TraceState => {
  switch (action.type) {
    case 'FETCH_TRACES_START':
      return { ...state, isLoading: true, error: null };
    case 'FETCH_TRACES_SUCCESS':
      return { ...state, isLoading: false, traces: action.payload, error: null };
    case 'FETCH_TRACES_ERROR':
      return { ...state, isLoading: false, error: action.payload };
    case 'FETCH_TRACE_START':
      return { ...state, isLoading: true, error: null };
    case 'FETCH_TRACE_SUCCESS':
      return { ...state, isLoading: false, selectedTrace: action.payload, error: null };
    case 'FETCH_TRACE_ERROR':
      return { ...state, isLoading: false, error: action.payload };
    case 'CLEAR_SELECTED_TRACE':
      return { ...state, selectedTrace: null };
    default:
      return state;
  }
};

// Context
const TraceContext = createContext<{ 
  state: TraceState; 
  dispatch: React.Dispatch<TraceAction> 
}>({ 
  state: initialState, 
  dispatch: () => null 
});

// Provider
export const TraceProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(traceReducer, initialState);
  return (
    <TraceContext.Provider value={{ state, dispatch }}>
      {children}
    </TraceContext.Provider>
  );
};

// Custom Hook
export const useTraces = () => {
  const context = useContext(TraceContext);
  if (!context) {
    throw new Error('useTraces must be used within a TraceProvider');
  }
  return context;
};