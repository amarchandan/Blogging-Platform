import React, { useEffect, useState, useContext } from 'react'
import { Link } from 'react-router-dom'
import { BarChart3, BookOpen, Eye, FileEdit, Heart, MessageCircle, Plus, Search, Settings, Trash2, TrendingUp } from 'lucide-react'
import api from '../services/api'
import { AuthContext } from '../context/AuthContext'
import { toast } from 'react-toastify'

const statusStyles = {
  PUBLISHED: 'bg-emerald-50 text-emerald-700',
  DRAFT: 'bg-amber-50 text-amber-700',
}

function StatCard({ icon: Icon, label, value, tone }){
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${tone}`}><Icon size={18} /></div>
      <p className="mt-4 text-sm text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
    </div>
  )
}

export default function Dashboard(){
  const { user } = useContext(AuthContext)
  const [myBlogs, setMyBlogs] = useState([])
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('ALL')
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    if(!user) return
    setLoading(true)
    api.get('/blogs/mine')
      .then(r=>setMyBlogs(Array.isArray(r.data?.data) ? r.data.data : []))
      .catch(err=>toast.error(err.response?.data?.message || 'Unable to load posts'))
      .finally(()=>setLoading(false))
  },[user])

  const remove = async (id)=>{
    if(!window.confirm('Delete this post permanently?')) return
    try{
      await api.delete(`/blogs/${id}`)
      setMyBlogs(prev=>prev.filter(blog=>blog._id !== id))
      toast.success('Post deleted')
    }catch(err){ toast.error(err.response?.data?.message || 'Delete failed') }
  }

  if(!user) return <div className="max-w-xl mx-auto py-16 text-center">Please login to view your dashboard.</div>

  const visibleBlogs = myBlogs.filter(blog=>{
    const matchesFilter = filter === 'ALL' || blog.status === filter
    const text = `${blog.title || ''} ${blog.excerpt || ''}`.toLowerCase()
    return matchesFilter && text.includes(query.toLowerCase())
  })
  const totalViews = myBlogs.reduce((total, blog)=>total + (blog.views || 0), 0)
  const totalLikes = myBlogs.reduce((total, blog)=>total + (blog.likes?.length || 0), 0)
  const totalComments = myBlogs.reduce((total, blog)=>total + (blog.commentsCount || 0), 0)
  const published = myBlogs.filter(blog=>blog.status === 'PUBLISHED').length
  const drafts = myBlogs.filter(blog=>blog.status === 'DRAFT').length
  const topPosts = [...myBlogs].sort((a, b)=>(b.views || 0) - (a.views || 0)).slice(0, 5)
  const maxViews = Math.max(...topPosts.map(blog=>blog.views || 0), 1)
  const recentPosts = [...myBlogs].sort((a, b)=>new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)).slice(0, 3)

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-blue-600">Creator workspace</p>
          <h1 className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">Welcome back, {user.name || user.username}</h1>
          <p className="mt-2 text-gray-500 dark:text-gray-300">Manage your stories, track engagement, and keep publishing.</p>
        </div>
        <Link to="/create" className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"><Plus size={18} /> New post</Link>
      </section>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={BookOpen} label="Total posts" value={myBlogs.length} tone="bg-blue-50 text-blue-600" />
        <StatCard icon={Eye} label="Total views" value={totalViews} tone="bg-violet-50 text-violet-600" />
        <StatCard icon={Heart} label="Total likes" value={totalLikes} tone="bg-rose-50 text-rose-600" />
        <StatCard icon={MessageCircle} label="Comments" value={totalComments} tone="bg-amber-50 text-amber-600" />
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2 bg-blue-600 rounded-xl p-6 text-white shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div><p className="text-blue-100 text-sm">Content reach</p><h2 className="mt-1 text-2xl font-bold">{totalViews.toLocaleString()} total views</h2><p className="mt-1 text-sm text-blue-100">Your top posts by lifetime views</p></div>
            <div className="p-2 rounded-lg bg-white/15"><TrendingUp size={20} /></div>
          </div>
          <div className="mt-7 h-32 flex items-end gap-3 border-b border-white/20">
            {topPosts.length ? topPosts.map(blog=> <div key={blog._id} className="flex-1 h-full flex flex-col justify-end items-center gap-2 group" title={`${blog.title}: ${blog.views || 0} views`}><div className="w-full max-w-10 rounded-t-md bg-white/85 group-hover:bg-white transition-colors" style={{ height: `${Math.max(8, ((blog.views || 0) / maxViews) * 100)}%` }} /><span className="text-[10px] text-blue-100 truncate max-w-full">{(blog.title || 'Post').slice(0, 8)}</span></div>) : <p className="pb-8 text-sm text-blue-100">Publish a post to start seeing reach data.</p>}
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between"><div><p className="text-sm text-gray-500">Publishing health</p><h2 className="mt-1 text-2xl font-bold text-gray-900">{published} live</h2></div><div className="p-2 rounded-lg bg-emerald-50 text-emerald-600"><BarChart3 size={20} /></div></div>
          <div className="mt-6 space-y-4"><div><div className="flex justify-between text-sm mb-1"><span className="text-gray-600">Published</span><span className="font-medium">{published}</span></div><div className="h-2 bg-gray-100 rounded-full"><div className="h-2 bg-emerald-500 rounded-full" style={{ width: `${myBlogs.length ? (published / myBlogs.length) * 100 : 0}%` }} /></div></div><div><div className="flex justify-between text-sm mb-1"><span className="text-gray-600">Drafts</span><span className="font-medium">{drafts}</span></div><div className="h-2 bg-gray-100 rounded-full"><div className="h-2 bg-amber-400 rounded-full" style={{ width: `${myBlogs.length ? (drafts / myBlogs.length) * 100 : 0}%` }} /></div></div></div>
          <Link to={`/profile/${user.username}`} className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-blue-600"><Settings size={15} /> Manage profile</Link>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between"><h2 className="font-semibold text-gray-900">Latest activity</h2><Link to="/create" className="text-sm text-blue-600">New post</Link></div>
          <div className="mt-4 space-y-4">{recentPosts.length ? recentPosts.map(blog=> <div key={blog._id} className="flex gap-3"><div className="mt-1 w-2 h-2 rounded-full bg-blue-500 shrink-0" /><div className="min-w-0"><Link to={`/blog/${blog.slug}`} className="text-sm font-medium text-gray-800 line-clamp-1">{blog.title}</Link><p className="text-xs text-gray-500 mt-1">Updated {new Date(blog.updatedAt || blog.createdAt).toLocaleDateString()}</p></div></div>) : <p className="text-sm text-gray-500">No activity yet.</p>}</div>
        </div>
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-5 shadow-sm"><div className="flex items-center justify-between"><h2 className="font-semibold text-gray-900">Top performing posts</h2><span className="text-xs text-gray-500">By views</span></div><div className="mt-4 space-y-4">{topPosts.length ? topPosts.slice(0, 3).map(blog=> <div key={blog._id}><div className="flex justify-between gap-4 text-sm"><Link to={`/blog/${blog.slug}`} className="font-medium text-gray-800 truncate hover:text-blue-600">{blog.title}</Link><span className="text-gray-500 shrink-0">{blog.views || 0} views</span></div><div className="mt-2 h-2 bg-gray-100 rounded-full"><div className="h-2 bg-blue-500 rounded-full" style={{ width: `${Math.max(4, ((blog.views || 0) / maxViews) * 100)}%` }} /></div></div>) : <p className="text-sm text-gray-500">Publish posts to see performance.</p>}</div></div>
      </section>

      <section className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div><h2 className="text-xl font-semibold text-gray-900">Your posts</h2><p className="text-sm text-gray-500 mt-1">{published} published · {drafts} drafts</p></div>
          <div className="flex flex-col sm:flex-row gap-3">
            <label className="relative"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search posts" className="w-full sm:w-56 pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></label>
            <select value={filter} onChange={e=>setFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"><option value="ALL">All posts</option><option value="PUBLISHED">Published</option><option value="DRAFT">Drafts</option></select>
          </div>
        </div>

        {loading ? <div className="p-8 text-center text-gray-500">Loading your posts...</div> : visibleBlogs.length === 0 ? (
          <div className="p-12 text-center"><BarChart3 size={32} className="mx-auto text-gray-300" /><h3 className="mt-3 font-semibold text-gray-900">{myBlogs.length ? 'No matching posts' : 'Your publishing list is empty'}</h3><p className="mt-1 text-sm text-gray-500">{myBlogs.length ? 'Try another search or filter.' : 'Start with your first story today.'}</p>{!myBlogs.length && <Link to="/create" className="inline-flex items-center gap-2 mt-4 text-sm font-medium text-blue-600"><Plus size={16} /> Create your first post</Link>}</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {visibleBlogs.map(blog=> (
              <article key={blog._id} className="p-5 flex flex-col md:flex-row gap-4 md:items-center justify-between hover:bg-gray-50">
                <div className="flex gap-4 min-w-0">
                  {blog.coverImage ? <img src={blog.coverImage} alt="" className="w-20 h-16 rounded-lg object-cover shrink-0" /> : <div className="w-20 h-16 rounded-lg bg-gray-100 flex items-center justify-center shrink-0"><BookOpen size={20} className="text-gray-400" /></div>}
                  <div className="min-w-0"><Link to={`/blog/${blog.slug}`} className="font-semibold text-gray-900 hover:text-blue-600 line-clamp-1">{blog.title}</Link><p className="mt-1 text-sm text-gray-500 line-clamp-1">{blog.excerpt || 'No excerpt added'}</p><div className="mt-2 flex items-center gap-3 text-xs text-gray-500"><span className={`px-2 py-1 rounded-full font-medium ${statusStyles[blog.status] || 'bg-gray-100 text-gray-600'}`}>{blog.status}</span><span>{blog.views || 0} views</span><span>{new Date(blog.updatedAt || blog.createdAt).toLocaleDateString()}</span></div></div>
                </div>
                <div className="flex items-center gap-2 shrink-0"><Link to={`/create?edit=${encodeURIComponent(blog.slug)}`} className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-white"><FileEdit size={15} /> Edit</Link><button onClick={()=>remove(blog._id)} className="inline-flex items-center gap-1.5 px-3 py-2 border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50"><Trash2 size={15} /> Delete</button></div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}