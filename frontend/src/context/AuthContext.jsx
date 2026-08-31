import React, { createContext, useEffect, useState } from 'react'
import api from '../services/api'

export const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    const token = localStorage.getItem('token')
    if (!token) { setLoading(false); return }
    api.get('/auth/me').then(res=>{ setUser(res.data.data); setLoading(false) }).catch((err)=>{
      if (err.response?.status === 401) {
        // token genuinely invalid/expired - safe to log out
        localStorage.removeItem('token')
        setUser(null)
      }
      // otherwise (network error, cold-start timeout, temporary server error):
      // keep the token, don't force-logout a valid session over a transient failure
      setLoading(false)
    })
  },[])

  const logout = ()=>{ localStorage.removeItem('token'); setUser(null); window.location.href = '/' }

  return (
    <AuthContext.Provider value={{ user, setUser, loading, logout }}>
      {children}
    </AuthContext.Provider>
  )
}