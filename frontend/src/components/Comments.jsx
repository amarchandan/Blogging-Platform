import React, { useEffect, useState, useContext } from 'react'
import api from '../services/api'
import { AuthContext } from '../context/AuthContext'

function buildTree(list){
  if(!Array.isArray(list)) return []
  const map = {};
  list.forEach(i=> map[i._id]= { ...(i && typeof i.toObject === 'function' ? i.toObject() : i), children: [] })
  const roots = [];
  list.forEach(i=>{
    const parent = i.parentComment
    if(parent) { if(map[parent]) map[parent].children.push(map[i._id]) }
    else roots.push(map[i._id])
  })
  return roots
}

export default function Comments({ blogId }){
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [text, setText] = useState('')
  const { user } = useContext(AuthContext)

  useEffect(()=>{
    if(!blogId) return
    setLoading(true)
    setError(false)
    api.get(`/comments/blog/${blogId}`).then(r=>{
      const nextItems = Array.isArray(r.data?.data) ? r.data.data : []
      setItems(nextItems)
      setLoading(false)
    }).catch(()=>{
      setItems([])
      setError(true)
      setLoading(false)
    })
  },[blogId])

  const submit = async (e, parentId=null)=>{
    e.preventDefault(); if(!text.trim()) return
    try{
      const res = await api.post(`/comments/blog/${blogId}`, { content: text, parentComment: parentId })
      if(res.data?.data) setItems(prev=>[...(Array.isArray(prev) ? prev : []), res.data.data])
      setText('')
    }catch(err){ alert(err.response?.data?.message || 'Unable to post') }
  }

  const replySubmit = async (parentId, replyText, clear)=>{
    if(!replyText || !replyText.trim()) return
    try{
      const res = await api.post(`/comments/blog/${blogId}`, { content: replyText, parentComment: parentId })
      if(res.data?.data) setItems(prev=>[...(Array.isArray(prev) ? prev : []), res.data.data])
      clear()
    }catch(err){ alert('Unable to reply') }
  }

  const remove = async (id)=>{
    if(!confirm('Delete comment?')) return
    try{ await api.delete(`/comments/${id}`); setItems(prev=>prev.filter(i=>i._id!==id)) }catch(err){ alert('Delete failed') }
  }

  const update = async (id, newContent, onDone)=>{
    try{ const res = await api.put(`/comments/${id}`, { content: newContent }); setItems(prev=>prev.map(i=> i._id===id ? res.data.data : i)); onDone() }catch(err){ alert('Update failed') }
  }

  const tree = buildTree(items || [])

  const CommentNode = ({ c }) => {
    const [showReply, setShowReply] = useState(false)
    const [replyText, setReplyText] = useState('')
    const [editing, setEditing] = useState(false)
    const [draft, setDraft] = useState(c.content)

    return (
      <div className="pl-0">
        <div className="p-3 bg-white rounded shadow">
          <div className="flex items-start gap-3">
            <img src={c.user?.avatar || '/avatar.png'} alt="a" className="w-10 h-10 rounded-full" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-semibold">{c.user?.name || c.user?.username}</span>
                  <span className="text-xs text-gray-500 ml-2">{new Date(c.createdAt).toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  {user && String(user._id) === String(c.user?._id) && (
                    <>
                      <button onClick={()=>setEditing(s=>!s)} className="text-sm text-gray-600">Edit</button>
                      <button onClick={()=>remove(c._id)} className="text-red-500 text-sm">Delete</button>
                    </>
                  )}
                  <button onClick={()=>setShowReply(s=>!s)} className="text-sm text-gray-600">Reply</button>
                </div>
              </div>
              {editing ? (
                <div className="mt-2">
                  <textarea className="w-full p-2 border rounded" value={draft} onChange={e=>setDraft(e.target.value)} rows={3}></textarea>
                  <div className="flex gap-2 justify-end mt-2">
                    <button onClick={()=>update(c._id, draft, ()=>setEditing(false))} className="px-2 py-1 bg-blue-600 text-white rounded">Save</button>
                    <button onClick={()=>{ setEditing(false); setDraft(c.content) }} className="px-2 py-1 border rounded">Cancel</button>
                  </div>
                </div>
              ) : (
                <p className="mt-2 text-sm text-gray-800">{c.content}</p>
              )}
              {showReply && (
                <div className="mt-2">
                  <textarea className="w-full p-2 border rounded" value={replyText} onChange={e=>setReplyText(e.target.value)} rows={2}></textarea>
                  <div className="flex gap-2 justify-end mt-2">
                    <button onClick={()=>replySubmit(c._id, replyText, ()=>{ setReplyText(''); setShowReply(false) })} className="px-2 py-1 bg-blue-600 text-white rounded">Reply</button>
                    <button onClick={()=>{ setShowReply(false); setReplyText('') }} className="px-2 py-1 border rounded">Cancel</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        {c.children && c.children.length > 0 && (
          <div className="pl-6 mt-3 space-y-3">
            {c.children.map(child => <CommentNode key={child._id} c={child} />)}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="mt-8">
      <h4 className="font-semibold mb-3">Comments ({Array.isArray(items) ? items.length : 0})</h4>
      {loading ? <div>Loading...</div> : error ? <div className="text-sm text-gray-500">Comments are temporarily unavailable.</div> : (
        <div className="space-y-4">
          {tree.map(c=> <CommentNode key={c._id} c={c} />)}
        </div>
      )}

      <div className="mt-4">
        {user ? (
          <form onSubmit={(e)=>submit(e,null)} className="space-y-2">
            <textarea value={text} onChange={e=>setText(e.target.value)} className="w-full p-2 border rounded" rows={4} placeholder="Write a comment..."></textarea>
            <div className="flex justify-end">
              <button type="submit" className="px-3 py-2 bg-blue-600 text-white rounded">Post Comment</button>
            </div>
          </form>
        ) : (
          <div className="text-sm text-gray-600">Please login to post comments.</div>
        )}
      </div>
    </div>
  )
}
