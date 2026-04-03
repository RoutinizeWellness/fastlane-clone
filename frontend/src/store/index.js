import { create } from 'zustand'

const getUser = () => {
  try { return JSON.parse(localStorage.getItem('fl_user') || 'null') } catch { return null }
}

const getBrandFromStorage = () => {
  try { return JSON.parse(localStorage.getItem('fl_brand') || 'null') } catch { return null }
}

const defaultBrand = {
  website: '',
  brandName: '',
  industry: '',
  description: '',
  targetAudience: '',
  tone: '',
  benefits: '',
  productName: '',
  tagline: '',
}

export const useStore = create((set, get) => ({
  user: getUser(),
  token: localStorage.getItem('fl_token') || null,
  brand: getBrandFromStorage() || { ...defaultBrand },
  onboardingComplete: localStorage.getItem('fl_onboarding_complete') === 'true',
  remixResult: null,
  brandStyle: null,

  login: (user, token) => {
    localStorage.setItem('fl_token', token)
    localStorage.setItem('fl_user', JSON.stringify(user))
    set({ user, token })
  },

  logout: () => {
    localStorage.removeItem('fl_token')
    localStorage.removeItem('fl_user')
    localStorage.removeItem('fl_onboarding_complete')
    set({ user: null, token: null, onboardingComplete: false })
  },

  setBrand: (brand) => {
    const merged = { ...defaultBrand, ...brand }
    localStorage.setItem('fl_brand', JSON.stringify(merged))
    set({ brand: merged })
  },

  updateBrandField: (key, value) => {
    const current = get().brand || { ...defaultBrand }
    const updated = { ...current, [key]: value }
    localStorage.setItem('fl_brand', JSON.stringify(updated))
    set({ brand: updated })
  },

  setOnboardingComplete: (val) => {
    localStorage.setItem('fl_onboarding_complete', val ? 'true' : 'false')
    set({ onboardingComplete: val })
  },

  setRemixResult: (result) => set({ remixResult: result }),
  clearRemixResult: () => set({ remixResult: null }),

  setBrandStyle: (style) => set({ brandStyle: style }),
}))
