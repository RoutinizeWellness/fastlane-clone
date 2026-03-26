import { create } from 'zustand'

const getUser = () => {
  try { return JSON.parse(localStorage.getItem('fl_user') || 'null') } catch { return null }
}

export const useStore = create((set, get) => ({
  user: getUser(),
  token: localStorage.getItem('fl_token') || null,
  brand: null,

  login: (user, token) => {
    localStorage.setItem('fl_token', token)
    localStorage.setItem('fl_user', JSON.stringify(user))
    set({ user, token })
  },

  logout: () => {
    localStorage.removeItem('fl_token')
    localStorage.removeItem('fl_user')
    set({ user: null, token: null })
  },

  setBrand: (brand) => set({ brand }),
}))
