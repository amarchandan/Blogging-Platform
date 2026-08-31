import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'

export default function Home(){
  const [blogs, setBlogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    let mounted = true
    api.get('/blogs').then(res=>{ if(mounted){ setBlogs(Array.isArray(res.data?.data) ? res.data.data : []); setLoading(false)} }).catch((err)=>{ console.error('Failed to load blogs', err); setLoading(false) })
    return ()=> mounted = false
  },[])

  if(loading) return <div>Loading...</div>
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Latest Blogs</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(blogs || []).map(b=> (
          <Link key={b._id} to={`/blog/${b.slug}`} className="block bg-white p-4 rounded shadow hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer">
            {b.coverImage && <img src={b.coverImage} alt="cover" className="w-full h-40 object-cover rounded" />}
            <h3 className="mt-3 font-semibold">{b.title}</h3>
            <p className="text-sm text-gray-600">{b.excerpt}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
