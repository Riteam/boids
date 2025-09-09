export type Theme = 'light' | 'dark'

let currentTheme: Theme = 'light'

export function getTheme(): Theme {
  return currentTheme
}

export function setTheme(theme: Theme): void {
  currentTheme = theme
}
