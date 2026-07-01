import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

// Note: localStorage is fine to get this running. If you want stronger
// security later, ask your backend friend about httpOnly cookies instead -
// that's a backend change, not something you need to redo here.
export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('bm_token'))
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('bm_user')
    return stored ? JSON.parse(stored) : null
  })

  function login(newToken, newUser) {
    localStorage.setItem('bm_token', newToken)
    localStorage.setItem('bm_user', JSON.stringify(newUser))
    setToken(newToken)
    setUser(newUser)
  }

  function logout() {
    localStorage.removeItem('bm_token')
    localStorage.removeItem('bm_user')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
