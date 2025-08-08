import React, { createContext, useContext, useReducer, useMemo, ReactNode } from 'react';
import { LogState, LogAction, Log, LogFilters } from '@/types';

const initialState: LogState = {
  logs: [],
  filteredLogs: [],
  filters: {
    level: [],
    searchTerm: '',
  },
};

const logReducer = (state: LogState, action: LogAction): LogState => {
  switch (action.type) {
    case 'ADD_LOG':
      return {
        ...state,
        logs: [action.payload, ...state.logs].slice(0, 10000), // Keep only last 10k logs
      };
    case 'SET_FILTER':
      return {
        ...state,
        filters: { ...state.filters, ...action.payload },
      };
    default:
      return state;
  }
};

interface LogContextType {
  state: LogState;
  dispatch: React.Dispatch<LogAction>;
}

const LogContext = createContext<LogContextType | undefined>(undefined);

export const useLog = () => {
  const context = useContext(LogContext);
  if (context === undefined) {
    throw new Error('useLog must be used within a LogProvider');
  }
  return context;
};

interface LogProviderProps {
  children: ReactNode;
}

export const LogProvider: React.FC<LogProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(logReducer, initialState);

  // Memoized filtered logs for performance
  const filteredLogs = useMemo(() => {
    const { logs, filters } = state;
    
    return logs.filter((log) => {
      // Filter by level
      const levelMatch = filters.level.length === 0 || filters.level.includes(log.level);
      
      // Filter by search term
      const searchMatch = !filters.searchTerm || 
        log.message.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        log.level.toLowerCase().includes(filters.searchTerm.toLowerCase());
      
      return levelMatch && searchMatch;
    });
  }, [state.logs, state.filters]);

  const stateWithFilteredLogs = useMemo(() => ({
    ...state,
    filteredLogs,
  }), [state, filteredLogs]);

  return (
    <LogContext.Provider value={{ state: stateWithFilteredLogs, dispatch }}>
      {children}
    </LogContext.Provider>
  );
};