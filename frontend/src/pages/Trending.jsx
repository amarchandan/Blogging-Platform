import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'

export default function Trending(){
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  useEffect(()=>{
    let mounted = true
    api.get('/blogs/trending').then(res=>{ if(mounted) setItems(Array.isArray(res.data?.data) ? res.data.data : []); setLoading(false) }).catch((err)=>{ console.error('Trending load failed', err); setLoading(false) })
    return ()=> mounted = false
  },[])
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Trending Now</h2>
      {loading ? <div>Loading...</div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(items || []).map(b=> (
            <Link key={b._id} to={`/blog/${b.slug}`} className="block bg-white p-4 rounded shadow hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer">
            {b.coverImage && <img src={b.coverImage} alt="cover" className="w-full h-40 object-cover rounded" />}
            <h3 className="mt-3 font-semibold">{b.title}</h3>
            <p className="text-sm text-gray-600">{b.excerpt}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
