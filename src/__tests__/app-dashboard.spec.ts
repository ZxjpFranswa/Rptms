import { describe, it, expect, beforeEach } from 'vitest'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { flushPromises } from '@vue/test-utils'
import App from '@/App.vue'
import router from '@/router'
import { useAuthStore } from '@/stores/auth'

describe('dashboard route', () => {
  beforeEach(() => {
    localStorage.clear()
    document.body.innerHTML = ''
  })

  it('renders clerk dashboard content after login navigation', async () => {
    const el = document.createElement('div')
    document.body.appendChild(el)

    const app = createApp(App)
    app.use(createPinia())
    app.use(router)

    await router.push('/login')
    await router.isReady()
    app.mount(el)
    await flushPromises()

    const auth = useAuthStore()
    auth.login('test-token', {
      id: '1',
      username: 'clerk',
      fullName: 'Test Clerk',
      email: 'c@test.ph',
      role: 'assessment_clerk',
      accountStatus: 'active',
    })

    await router.push('/clerk/dashboard')
    await router.isReady()
    await flushPromises()
    // Async route components
    await new Promise((r) => setTimeout(r, 300))
    await flushPromises()

    expect(el.innerHTML.length).toBeGreaterThan(0)
    expect(el.textContent).toContain('RPRAMS')
    expect(el.textContent).toContain('Received Transactions')
    app.unmount()
  })
})
