import React, { createContext, useContext, useReducer, ReactNode } from 'react';

// Types
export interface FormData {
  id: string;
  rep: string;
  relevancy: string;
  companyName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  whatsapp: string;
  partnerDetails: string[];
  targetRegions: string[];
  lob: string;
  tier: string;
  grades: string;
  volume: string;
  addAssociates: boolean;
  notes: string;
  businessCardUrl?: string;
  submittedAt: Date;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: { username: string } | null;
}

export interface AppState {
  submissions: FormData[];
  auth: AuthState;
  loading: boolean;
  error: string | null;
}

// Actions
type AppAction =
  | { type: 'ADD_SUBMISSION'; payload: FormData }
  | { type: 'SET_SUBMISSIONS'; payload: FormData[] }
  | { type: 'LOGIN'; payload: { username: string } }
  | { type: 'LOGOUT' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

// Initial state
const initialState: AppState = {
  submissions: [],
  auth: {
    isAuthenticated: false,
    user: null,
  },
  loading: false,
  error: null,
};

// Reducer
const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'ADD_SUBMISSION':
      return {
        ...state,
        submissions: [...state.submissions, action.payload],
      };
    case 'SET_SUBMISSIONS':
      return {
        ...state,
        submissions: action.payload,
      };
    case 'LOGIN':
      return {
        ...state,
        auth: {
          isAuthenticated: true,
          user: action.payload,
        },
      };
    case 'LOGOUT':
      return {
        ...state,
        auth: {
          isAuthenticated: false,
          user: null,
        },
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
      };
    default:
      return state;
  }
};

// Context
const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

// Provider
export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load auth state from localStorage on mount
  React.useEffect(() => {
    const savedAuth = localStorage.getItem('authState');
    if (savedAuth) {
      const authData = JSON.parse(savedAuth);
      if (authData.isAuthenticated) {
        dispatch({ type: 'LOGIN', payload: authData.user });
      }
    }

    // Load submissions from localStorage
    const savedSubmissions = localStorage.getItem('submissions');
    if (savedSubmissions) {
      const submissions = JSON.parse(savedSubmissions);
      dispatch({ type: 'SET_SUBMISSIONS', payload: submissions });
    }
  }, []);

  // Save auth state to localStorage
  React.useEffect(() => {
    localStorage.setItem('authState', JSON.stringify(state.auth));
  }, [state.auth]);

  // Save submissions to localStorage
  React.useEffect(() => {
    localStorage.setItem('submissions', JSON.stringify(state.submissions));
  }, [state.submissions]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

// Hook
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};