import { ref, computed } from 'vue'

export type Theme = 'light' | 'dark'

const THEME_KEY = 'rptms_theme'

// Module-level singleton state so all components share the same reactive theme
const currentTheme = ref<Theme>(
  (localStorage.getItem(THEME_KEY) as Theme) || 'light'
)

function applyTheme(theme: Theme) {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  if (theme === 'dark') {
    root.classList.add('dark')
    root.style.colorScheme = 'dark'
  } else {
    root.classList.remove('dark')
    root.style.colorScheme = 'light'
  }
}

// Initial application
applyTheme(currentTheme.value)

export function useTheme() {
  const isDark = computed(() => currentTheme.value === 'dark')

  const setTheme = (theme: Theme) => {
    currentTheme.value = theme
    localStorage.setItem(THEME_KEY, theme)
    applyTheme(theme)
  }

  const toggleTheme = () => {
    setTheme(currentTheme.value === 'dark' ? 'light' : 'dark')
  }

  return {
    theme: currentTheme,
    isDark,
    setTheme,
    toggleTheme,
  }
}
