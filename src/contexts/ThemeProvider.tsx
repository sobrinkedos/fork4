import React, { createContext, useContext } from 'react';
import { colors } from '../styles/colors';

interface ThemeContextData {
  colors: typeof colors;
}

const ThemeContext = createContext<ThemeContextData>({ colors });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeContext.Provider value={{ colors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);