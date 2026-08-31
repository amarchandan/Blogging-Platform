import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Link } from 'react-router-dom'
import api from '../services/api'

function useQuery(){ return new URLSearchParams(useLocation().search) }

export default function Search(){
  const q = useQuery().get('q') || ''
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    if(!q) { setResults([]); setLoading(false); return }
    setLoading(true)
    api.get(`/blogs/search?q=${encodeURIComponent(q)}`).then(res=>{ setResults(res.data.data); setLoading(false) }).catch(()=>setLoading(false))
  },[q])

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Search results for "{q}"</h2>
      {loading ? <div>Loading...</div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map(b=> (
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
