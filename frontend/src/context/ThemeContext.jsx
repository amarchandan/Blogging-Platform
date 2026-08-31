import React, { createContext, useLayoutEffect, useState } from 'react'

export const ThemeContext = createContext(null)

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light')
  useLayoutEffect(()=>{
    document.documentElement.classList.remove('light', 'dark')
    document.documentElement.classList.add(theme === 'dark' ? 'dark' : 'light')
    document.documentElement.style.colorScheme = theme
    localStorage.setItem('theme', theme)
  }, [theme])
  const toggle = ()=> setTheme((t)=> t === 'dark' ? 'light' : 'dark')
  return <ThemeContext.Provider value={{ theme, toggle }}>{children}</ThemeContext.Provider>
}
