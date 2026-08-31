import React, { useEffect, useState, useContext } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Eye, Mail, Search, Trash2, Users } from 'lucide-react'
import api from '../services/api'
import { AuthContext } from '../context/AuthContext'
import { toast } from 'react-toastify'
import { mediaUrl } from '../utils/media'

export default function AdminUsers(){
  const { user } = useContext(AuthContext)
  const [users, setUsers] = useState([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    if(!user || user.role !== 'ADMIN') return
    api.get('/admin/users')
      .then(res=>setUsers(Array.isArray(res.data?.data) ? res.data.data : []))
      .catch(err=>toast.error(err.response?.data?.message || 'Unable to load users'))
      .finally(()=>setLoading(false))
  },[user])

  const remove = async (item)=>{
    if(!window.confirm(`Delete ${item.name || item.username}? Their blogs and comments will also be deleted.`)) return
    try{
      await api.delete(`/admin/users/${item._id}`)
      setUsers(prev=>prev.filter(current=>current._id !== item._id))
      toast.success('User deleted')
    }catch(err){ toast.error(err.response?.data?.message || 'Unable to delete user') }
  }

  if(!user || user.role !== 'ADMIN') return <div className="max-w-xl mx-auto py-16 text-center">Access denied. Admin account required.</div>

  const visibleUsers = users.filter(item=>`${item.name || ''} ${item.username || ''} ${item.email || ''}`.toLowerCase().includes(query.toLowerCase()))

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div><Link to="/admin" className="inline-flex items-center gap-2 text-sm text-blue-600 mb-3"><ArrowLeft size={15} /> Admin dashboard</Link><p className="text-sm font-medium text-violet-600">User management</p><h1 className="mt-1 text-3xl font-bold text-gray-900">All users</h1><p className="mt-2 text-gray-500">Review accounts, activity, posts and total reach.</p></div>
        <div className="flex items-center gap-2 text-sm text-gray-500"><Users size={17} /> {users.length} users</div>
      </div>

      <section className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"><div><h2 className="text-xl font-semibold text-gray-900">User directory</h2><p className="mt-1 text-sm text-gray-500">Deleting a user also removes their authored content.</p></div><label className="relative"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search name or email" className="w-full sm:w-64 pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm" /></label></div>
        {loading ? <div className="p-10 text-center text-gray-500">Loading users...</div> : visibleUsers.length === 0 ? <div className="p-10 text-center text-gray-500">No users found.</div> : <div className="divide-y divide-gray-100">
          {visibleUsers.map(item=><div key={item._id} className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-gray-50">
            <div className="flex items-center gap-3 min-w-0"><img src={mediaUrl(item.avatar) || '/avatar.png'} alt="" className="w-12 h-12 rounded-full object-cover" /><div className="min-w-0"><p className="font-semibold text-gray-900 truncate">{item.name || 'Unnamed user'}</p><p className="text-sm text-gray-500 truncate">@{item.username}</p><div className="mt-1 flex items-center gap-1 text-sm text-gray-600"><Mail size={14} className="text-gray-400" />{item.email}</div></div></div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm lg:min-w-[390px]"><div className="bg-gray-50 rounded-lg px-4 py-3"><p className="text-gray-500">Posts</p><p className="mt-1 font-semibold text-gray-900">{item.postCount || 0}</p></div><div className="bg-gray-50 rounded-lg px-4 py-3"><p className="text-gray-500 flex items-center gap-1"><Eye size={14} /> Views</p><p className="mt-1 font-semibold text-gray-900">{(item.totalViews || 0).toLocaleString()}</p></div><button disabled={item._id === user._id || item.role === 'ADMIN'} onClick={()=>remove(item)} className="inline-flex items-center justify-center gap-1.5 px-3 py-2 border border-red-200 text-red-600 rounded-lg font-medium hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed"><Trash2 size={15} /> Delete</button></div>
          </div>)}
        </div>}
      </section>
    </div>
  )
}
