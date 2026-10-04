import { ref, computed, onMounted, onUnmounted } from 'vue'

// Singleton state — shared across all components
const isCollapsed = ref(false)
const isMobileOpen = ref(false)
const isMobile = ref(false)

const MOBILE_BREAKPOINT = 1024 // px — same as Tailwind's `lg`

function checkMobile() {
  isMobile.value = window.innerWidth < MOBILE_BREAKPOINT
  // Auto-collapse on mobile
  if (isMobile.value) {
    isMobileOpen.value = false
  }
}

export function useSidebar() {
  onMounted(() => {
    checkMobile()
    window.addEventListener('resize', checkMobile)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', checkMobile)
  })

  /** Toggle the desktop collapsed state */
  const toggle = () => {
    if (isMobile.value) {
      isMobileOpen.value = !isMobileOpen.value
    } else {
      isCollapsed.value = !isCollapsed.value
    }
  }

  /** Close the mobile drawer (e.g. on nav click or backdrop click) */
  const closeMobile = () => {
    isMobileOpen.value = false
  }

  /** True when the sidebar is fully hidden on desktop */
  const isDesktopCollapsed = computed(() => !isMobile.value && isCollapsed.value)

  return { isCollapsed, isMobileOpen, isMobile, isDesktopCollapsed, toggle, closeMobile }
}
