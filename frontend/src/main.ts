import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useAuthStore } from '@/stores/auth'
import { usePropertyStore } from '@/stores/property'

async function bootstrap() {
  const app = createApp(App)
  const pinia = createPinia()
  app.use(pinia)
  app.use(router)

  const authStore = useAuthStore()
  await authStore.initializeAuth()

  if (authStore.isAuthenticated) {
    const propertyStore = usePropertyStore()
    try {
      await propertyStore.fetchRegistrations()
    } catch {
      // dashboards may retry; API may be offline during local UI-only dev
    }
  }

  app.mount('#app')
}

bootstrap()
