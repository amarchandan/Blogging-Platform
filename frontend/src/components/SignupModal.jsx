import React, { useState, useContext } from 'react'
import api from '../services/api'
import { AuthContext } from '../context/AuthContext'
import { toast } from 'react-toastify'

export default function SignupModal({ open, onClose }){
  const { setUser } = useContext(AuthContext)
  const [form, setForm] = useState({ name:'', username:'', email:'', password:'' })
  const [loading, setLoading] = useState(false)

  if(!open) return null

  const submit = async (e)=>{
    e.preventDefault()
    setLoading(true)
    try{
      const res = await api.post('/auth/register', form)
      const token = res.data.token || res.data.data?.token
      if(token) localStorage.setItem('token', token)
      // try to fetch profile
      const me = await api.get('/auth/me').then(r=>r.data.data).catch(()=>null)
      if(setUser) setUser(me)
      toast.success('Account created')
      onClose()
    }catch(err){ toast.error(err.response?.data?.message || 'Signup failed') }
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Create an account</h3>
          <button onClick={onClose} className="text-gray-600">Close</button>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <input required placeholder="Name" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} className="w-full p-2 border rounded" />
          <input required placeholder="Username" value={form.username} onChange={e=>setForm({...form, username:e.target.value})} className="w-full p-2 border rounded" />
          <input required placeholder="Email" type="email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} className="w-full p-2 border rounded" />
          <input required placeholder="Password" type="password" value={form.password} onChange={e=>setForm({...form, password:e.target.value})} className="w-full p-2 border rounded" />
          <div className="flex justify-end">
            <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded">{loading ? 'Creating...' : 'Create account'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
