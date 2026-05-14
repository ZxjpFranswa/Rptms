import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

const STORAGE_KEY = 'rprams-theme'

export const useThemeStore = defineStore('theme', () => {
  const dark = ref(localStorage.getItem(STORAGE_KEY) === 'dark')

  const apply = () => {
    if (dark.value) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem(STORAGE_KEY, dark.value ? 'dark' : 'light')
  }

  watch(
    dark,
    () => {
      apply()
    },
    { immediate: true },
  )

  const toggle = () => {
    dark.value = !dark.value
  }

  return { dark, toggle, apply }
})
