import React, {createContext, useContext, useState} from 'react';
import {colors} from '../constants/colors';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({children}) => {
  const [isDarkMode, setIsDarkMode] = useState(true); // Default to dark mode

  const theme = {
    colors: colors,
    isDarkMode,
    toggleTheme: () => setIsDarkMode(!isDarkMode),
  };

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};
