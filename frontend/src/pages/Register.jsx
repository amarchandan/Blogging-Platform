import React, { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { AuthContext } from '../context/AuthContext'

export default function Register(){
  const [form, setForm] = useState({name:'', username:'', email:'', password:''})
  const [loading, setLoading] = useState(false)
  const { setUser } = useContext(AuthContext)
  const navigate = useNavigate()

  const submit = async (e)=>{
    e.preventDefault(); setLoading(true)
    try{
      const res = await api.post('/auth/register', form)
      localStorage.setItem('token', res.data.data.token)
      setUser(res.data.data.user)
      navigate('/')
    }catch(err){ alert(err.response?.data?.message || 'Register failed') }
    setLoading(false)
  }

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Register</h2>
      <form onSubmit={submit}>
        <input placeholder="Name" value={form.name} onChange={e=>setForm({...form, name: e.target.value})} className="w-full p-2 border rounded mb-2" />
        <input placeholder="Username" value={form.username} onChange={e=>setForm({...form, username: e.target.value})} className="w-full p-2 border rounded mb-2" />
        <input placeholder="Email" value={form.email} onChange={e=>setForm({...form, email: e.target.value})} className="w-full p-2 border rounded mb-2" />
        <input type="password" placeholder="Password" value={form.password} onChange={e=>setForm({...form, password: e.target.value})} className="w-full p-2 border rounded mb-3" />
        <button className="bg-green-600 text-white px-4 py-2 rounded" disabled={loading}>{loading ? 'Creating...' : 'Create Account'}</button>
      </form>
    </div>
  )
}