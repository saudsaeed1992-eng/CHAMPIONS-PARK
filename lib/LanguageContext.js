'use client'

// lib/LanguageContext.js
// Champions Park — Global Language Context
// Provides t() translation function + RTL/LTR direction to entire app

import { createContext, useContext, useState, useEffect } from 'react'
import translations from './translations'

const LanguageContext = createContext({
  language: 'en',
  setLanguage: () => {},
  t: (key) => key,
  dir: 'ltr',
  isRTL: false,
})

export function LanguageProvider({ children, initialLanguage = 'en' }) {
  const [language, setLanguageState] = useState(initialLanguage)

  // t() — translate a key into current language string
  const t = (key) => {
    const lang = translations[language] || translations['en']
    return lang[key] || translations['en'][key] || key
  }

  const dir = translations[language]?.dir || 'ltr'
  const isRTL = dir === 'rtl'

  // Update <html> dir and lang attributes whenever language changes
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.dir = dir
      document.documentElement.lang = language
    }
  }, [language, dir])

  const setLanguage = (lang) => {
    if (translations[lang]) {
      setLanguageState(lang)
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('cp_language', lang)
      }
    }
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, dir, isRTL }}>
      {children}
    </LanguageContext.Provider>
  )
}

// Hook — use anywhere in the app
export function useLanguage() {
  return useContext(LanguageContext)
}

export default LanguageContext
