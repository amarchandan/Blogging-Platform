import React, { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { AuthContext } from '../context/AuthContext'

export default function Login(){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { setUser } = useContext(AuthContext)
  const navigate = useNavigate()

  const submit = async (e)=>{
    e.preventDefault()
    setLoading(true)
    try{
      const res = await api.post('/auth/login', { emailOrUsername: email, password })
      localStorage.setItem('token', res.data.data.token)
      setUser(res.data.data.user)
      navigate('/')
    }catch(err){
      alert(err.response?.data?.message || 'Login failed')
    }finally{ setLoading(false) }
  }

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Login</h2>
      <form onSubmit={submit}>
        <label className="block text-sm">Email or Username</label>
        <input value={email} onChange={e=>setEmail(e.target.value)} className="w-full p-2 border rounded mb-3" />
        <label className="block text-sm">Password</label>
        <input type="password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full p-2 border rounded mb-3" />
        <button className="bg-blue-600 text-white px-4 py-2 rounded" disabled={loading}>{loading ? 'Logging...' : 'Login'}</button>
      </form>
    </div>
  )
}