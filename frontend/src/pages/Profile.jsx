import React, { useEffect, useState, useContext } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import api from '../services/api'
import { AuthContext } from '../context/AuthContext'
import { mediaUrl } from '../utils/media'

export default function Profile(){
  const { username } = useParams()
  const [data, setData] = useState(null)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [form, setForm] = useState({ name: '', username: '', avatar: '' })
  const { user } = useContext(AuthContext)
  const { setUser } = useContext(AuthContext)
  const navigate = useNavigate()

  useEffect(()=>{ api.get(`/users/${username}`).then(r=>{ const value = r.data.data; setData(value); setForm({ name: value.user.name || '', username: value.user.username || '', avatar: value.user.avatar || '' }) }).catch(()=>{}) },[username])

  if(!data) return <div>Loading...</div>

  const isMe = user && user.username === username

  const saveProfile = async (e)=>{
    e.preventDefault()
    setSaving(true)
    try{
      const res = await api.put('/users/profile', form)
      const updated = res.data.data
      setUser(updated)
      setData(prev=>({ ...prev, user: { ...prev.user, ...updated } }))
      setEditing(false)
      toast.success('Profile updated')
      if(updated.username !== username) navigate(`/profile/${updated.username}`, { replace: true })
    }catch(err){ toast.error(err.response?.data?.message || 'Unable to update profile') }
    setSaving(false)
  }

  const uploadAvatar = async (e)=>{
    const file = e.target.files?.[0]
    if(!file) return
    setAvatarUploading(true)
    try{
      const fd = new FormData()
      fd.append('image', file)
      const res = await api.post('/uploads', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      const url = res.data.data?.url
      if(url) setForm(prev=>({ ...prev, avatar: url }))
      else toast.error('Avatar upload failed')
    }catch(err){ toast.error(err.response?.data?.message || 'Avatar upload failed') }
    setAvatarUploading(false)
  }

  return (
    <div>
      <div className="flex items-center space-x-4">
        <img src={mediaUrl(editing ? form.avatar : data.user.avatar) || '/avatar.png'} className="w-24 h-24 rounded-full object-cover" alt="avatar" />
        <div>
          <h1 className="text-2xl font-semibold">{data.user.name || data.user.username}</h1>
          <p className="text-sm text-gray-600">@{data.user.username}</p>
        </div>
        {isMe && !editing && <button onClick={()=>setEditing(true)} className="px-3 py-2 border rounded text-gray-800 dark:text-gray-100 dark:border-gray-600">Edit profile</button>}
      </div>

      {isMe && editing && (
        <form onSubmit={saveProfile} className="mt-6 max-w-xl bg-white p-4 rounded shadow space-y-3">
          <input required value={form.name} onChange={e=>setForm(prev=>({ ...prev, name: e.target.value }))} placeholder="Name" className="w-full p-2 border rounded" />
          <input required value={form.username} onChange={e=>setForm(prev=>({ ...prev, username: e.target.value }))} placeholder="Username" className="w-full p-2 border rounded" />
          <div>
            <label className="block text-sm font-medium mb-1">Avatar</label>
            <input type="file" accept="image/*" onChange={uploadAvatar} />
            {avatarUploading && <div className="text-sm text-gray-600 mt-1">Uploading avatar...</div>}
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={saving || avatarUploading} className="px-4 py-2 bg-blue-600 text-white rounded">{saving ? 'Saving...' : 'Save changes'}</button>
            <button type="button" onClick={()=>{ setEditing(false); setForm({ name: data.user.name || '', username: data.user.username || '', avatar: data.user.avatar || '' }) }} className="px-4 py-2 border rounded">Cancel</button>
          </div>
        </form>
      )}

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <h3 className="font-semibold">Recent Posts</h3>
          <div className="mt-3 space-y-4">
            {data.blogs.map(b=> (
              <article key={b._id} className="p-4 bg-white rounded shadow">
                <a href={`/blog/${b.slug}`} className="font-semibold">{b.title}</a>
                <p className="text-sm text-gray-600">{b.excerpt}</p>
              </article>
            ))}
          </div>
        </div>
        <aside>
          <div className="bg-white p-4 rounded shadow">
            <h4 className="font-semibold">Stats</h4>
            <ul className="mt-2 text-sm text-gray-700">
              <li>Total: {data.stats.totalBlogs}</li>
              <li>Published: {data.stats.published}</li>
              <li>Drafts: {data.stats.drafts}</li>
              <li>Views: {data.stats.totalViews}</li>
              <li>Avg Rating: {data.stats.avgRating?.toFixed?.(2) || 'N/A'}</li>
            </ul>
            {isMe && <a href="/dashboard" className="mt-3 inline-block text-blue-600">Go to dashboard</a>}
          </div>
        </aside>
      </div>
    </div>
  )
}
