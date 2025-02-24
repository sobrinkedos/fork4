import React, { createContext, useContext } from 'react';
import { colors } from '../styles/colors';
import { DefaultTheme, ThemeProvider as StyledThemeProvider } from 'styled-components/native';

interface ThemeContextData extends DefaultTheme {
  colors: typeof colors;
}

declare module 'styled-components' {
  export interface DefaultTheme {
    colors: typeof colors;
  }
}

const theme: DefaultTheme = {
  colors
};

const ThemeContext = createContext<ThemeContextData>(theme);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeContext.Provider value={theme}>
      <StyledThemeProvider theme={theme}>
        {children}
      </StyledThemeProvider>
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);