import React, { useEffect, useState, useContext } from 'react'
import api from '../services/api'
import { AuthContext } from '../context/AuthContext'

export default function AdminComments(){
  const { user } = useContext(AuthContext)
  const [items, setItems] = useState([])
  const [q, setQ] = useState('')
  const [backfillLoading, setBackfillLoading] = useState(false)
  const [fallbackUrl, setFallbackUrl] = useState('')

  useEffect(()=>{ if(!user) return; api.get('/admin/comments').then(r=>setItems(r.data.data.items)).catch(()=>{}) },[user])

  const remove = async (id)=>{
    if(!confirm('Delete comment?')) return
    try{ await api.delete(`/comments/${id}`); setItems(prev=>prev.filter(i=>i._id!==id)) }catch(err){ alert('Delete failed') }
  }

  const runBackfill = async () => {
    if(!confirm('Run backfill to set missing covers?')) return
    setBackfillLoading(true)
    try{
      const res = await api.post('/admin/backfill-covers', { fallback: fallbackUrl || null })
      alert(`Matched: ${res.data.data.matched}, Modified: ${res.data.data.modified}`)
    }catch(err){ alert('Backfill failed') }
    setBackfillLoading(false)
  }

  if(!user || user.role !== 'ADMIN') return <div>Access denied</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Comment Moderation</h2>
        <div className="flex items-center gap-2">
          <input placeholder="Fallback cover URL (optional)" value={fallbackUrl} onChange={e=>setFallbackUrl(e.target.value)} className="p-2 border rounded" />
          <button onClick={runBackfill} disabled={backfillLoading} className="px-3 py-2 bg-blue-600 text-white rounded">{backfillLoading ? 'Running...' : 'Backfill Covers'}</button>
        </div>
      </div>
      <div className="space-y-3">
        {items.map(c=> (
          <div key={c._id} className="p-3 bg-white rounded shadow">
            <div className="flex justify-between">
              <div>
                <div className="font-semibold">{c.user?.name || c.user?.username} on <a href={`/blog/${c.blog?.slug}`} className="text-blue-600">{c.blog?.title}</a></div>
                <div className="text-sm text-gray-700">{c.content}</div>
              </div>
              <div>
                <button onClick={()=>remove(c._id)} className="text-red-500">Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
