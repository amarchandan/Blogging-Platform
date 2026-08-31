import React, { useEffect, useState } from 'react'
import api from '../services/api'
import Comments from '../components/Comments'
import { useParams } from 'react-router-dom'

export default function BlogPage(){
  const { slug } = useParams()
  const [blog, setBlog] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    let mounted = true
    api.get(`/blogs/${slug}`).then(res=>{ if(mounted) { setBlog(res.data.data); setLoading(false) } }).catch(()=>setLoading(false))
    return ()=> mounted=false
  },[slug])

  if(loading) return <div>Loading...</div>
  if(!blog) return <div>Not found</div>
  return (
    <article className="max-w-3xl mx-auto bg-white p-6 rounded shadow">
      <h1 className="text-3xl font-bold">{blog.title}</h1>
      <p className="text-sm text-gray-500">By {blog.author?.name} • {new Date(blog.publishedAt || blog.createdAt).toLocaleDateString()}</p>
      {blog.coverImage && <img src={blog.coverImage} alt="cover" className="w-full h-64 object-cover my-4 rounded" />}
      <div dangerouslySetInnerHTML={{ __html: blog.content }} />
      <Comments blogId={blog._id} />
    </article>
  )
}
