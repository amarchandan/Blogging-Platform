import React, { useEffect, useState, useContext } from 'react'
import { Link } from 'react-router-dom'
import { BarChart3, BookOpen, ChevronRight, MessageSquare, ShieldCheck, Users } from 'lucide-react'
import api from '../services/api'
import { AuthContext } from '../context/AuthContext'
import { toast } from 'react-toastify'

export default function AdminDashboard(){
  const { user } = useContext(AuthContext)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    if(!user || user.role !== 'ADMIN') return
    api.get('/admin/dashboard')
      .then(res=>setStats(res.data?.data || {}))
      .catch(err=>toast.error(err.response?.data?.message || 'Unable to load admin dashboard'))
      .finally(()=>setLoading(false))
  },[user])

  if(!user || user.role !== 'ADMIN') return <div className="max-w-xl mx-auto py-16 text-center">Access denied. Admin account required.</div>

  const cards = [
    { label: 'Total users', value: stats?.totalUsers || 0, icon: Users, tone: 'bg-blue-50 text-blue-600' },
    { label: 'Total blogs', value: stats?.totalBlogs || 0, icon: BookOpen, tone: 'bg-violet-50 text-violet-600' },
    { label: 'Published', value: stats?.published || 0, icon: BarChart3, tone: 'bg-emerald-50 text-emerald-600' },
    { label: 'Comments', value: stats?.totalComments || 0, icon: MessageSquare, tone: 'bg-amber-50 text-amber-600' },
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <section className="flex items-end justify-between gap-4">
        <div><p className="text-sm font-medium text-blue-600">Administration</p><h1 className="mt-1 text-3xl font-bold text-gray-900">Admin control center</h1><p className="mt-2 text-gray-500">Monitor the platform and manage community content.</p></div>
        <div className="hidden sm:flex items-center gap-2 text-sm text-emerald-600"><ShieldCheck size={18} /> Admin access active</div>
      </section>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(({ label, value, icon: Icon, tone })=><div key={label} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm"><div className={`w-9 h-9 rounded-lg flex items-center justify-center ${tone}`}><Icon size={18} /></div><p className="mt-4 text-sm text-gray-500">{label}</p><p className="mt-1 text-2xl font-bold text-gray-900">{loading ? '...' : value}</p></div>)}
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Link to="/admin/comments" className="group bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:border-blue-300 hover:shadow-md transition"><div className="flex items-center justify-between"><MessageSquare className="text-blue-600" /><ChevronRight className="text-gray-400 group-hover:text-blue-600" /></div><h2 className="mt-5 font-semibold text-gray-900">Comment moderation</h2><p className="mt-1 text-sm text-gray-500">Review and remove inappropriate comments.</p></Link>
        <Link to="/admin/users" className="group bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:border-violet-300 hover:shadow-md transition"><div className="flex items-center justify-between"><Users className="text-violet-600" /><ChevronRight className="text-gray-400 group-hover:text-violet-600" /></div><h2 className="mt-5 font-semibold text-gray-900">User management</h2><p className="mt-1 text-sm text-gray-500">{stats?.totalUsers || 0} registered users on the platform.</p><span className="mt-4 inline-block text-sm text-violet-600">View users</span></Link>
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm"><BookOpen className="text-emerald-600" /><h2 className="mt-5 font-semibold text-gray-900">Blog oversight</h2><p className="mt-1 text-sm text-gray-500">Admins can edit or delete any blog from its management view.</p><Link to="/dashboard" className="mt-4 inline-block text-sm text-blue-600">Open content dashboard</Link></div>
      </section>

    </div>
  )
}