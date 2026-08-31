import React, { useEffect, useRef, useState, useContext } from 'react'
import api from '../services/api'
import { toast } from 'react-toastify'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { Eraser, Image as ImageIcon, Link2 } from 'lucide-react'

export default function CreateBlog(){
  const { user } = useContext(AuthContext)
  const [title, setTitle] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [content, setContent] = useState('')
  const [coverFile, setCoverFile] = useState(null)
  const [coverPreview, setCoverPreview] = useState(null)
  const [coverUrl, setCoverUrl] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [existingBlog, setExistingBlog] = useState(null)
  const [loadingBlog, setLoadingBlog] = useState(false)
  const [imageDialogOpen, setImageDialogOpen] = useState(false)
  const [imageUrlInput, setImageUrlInput] = useState('')
  const editorRef = useRef(null)
  const savedRangeRef = useRef(null)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const editSlug = searchParams.get('edit')

  useEffect(()=>{
    if(!editSlug) return
    let mounted = true
    setLoadingBlog(true)
    api.get(`/blogs/${editSlug}`).then(res=>{
      if(!mounted) return
      const blog = res.data.data
      setExistingBlog(blog)
      setTitle(blog.title || '')
      setExcerpt(blog.excerpt || '')
      setContent(blog.content || '')
      setCoverUrl(blog.coverImage || null)
      setCoverPreview(blog.coverImage || null)
      setLoadingBlog(false)
    }).catch(err=>{
      if(mounted){ toast.error(err.response?.data?.message || 'Unable to load blog'); setLoadingBlog(false) }
    })
    return ()=>{ mounted = false }
  },[editSlug])

  useEffect(()=>{
    if(existingBlog && editorRef.current) editorRef.current.innerHTML = existingBlog.content || ''
  },[existingBlog])

  const submit = async (e)=>{
    e.preventDefault();
    if (uploading) { toast.error('Please wait for image upload to finish'); return }
    setLoading(true)
    try{
      const payload = { title, excerpt, content, status: existingBlog?.status || 'PUBLISHED', coverImage: coverUrl || null }
      const res = existingBlog
        ? await api.put(`/blogs/${existingBlog._id}`, payload)
        : await api.post('/blogs', payload)
      toast.success(existingBlog ? 'Blog updated' : 'Published')
      navigate(`/blog/${res.data.data.slug}`)
    }catch(err){ toast.error(err.response?.data?.message || 'Error'); setLoading(false) }
  }

  const handleFileChange = async (e) => {
    const f = e.target.files && e.target.files[0]
    if(!f) return
    setCoverFile(f)
    setCoverPreview(URL.createObjectURL(f))
    // upload immediately
    try{
      setUploading(true)
      const fd = new FormData()
      fd.append('image', f)
      const res = await api.post('/uploads', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      const url = res.data.data?.url
      if(url){ setCoverUrl(url); toast.success('Image uploaded') }
      else toast.error('Upload failed')
    }catch(err){ toast.error('Upload failed') }
    setUploading(false)
  }

  const removeCover = ()=>{
    setCoverFile(null)
    setCoverPreview(null)
    setCoverUrl(null)
  }

  const insertImage = async (url)=>{
    if(!url || !editorRef.current) return
    editorRef.current.focus()
    const selection = window.getSelection()
    selection.removeAllRanges()
    if(savedRangeRef.current) selection.addRange(savedRangeRef.current)
    const image = document.createElement('img')
    image.src = url
    image.alt = 'Article image'
    image.className = 'article-inline-image'
    const range = selection.rangeCount ? selection.getRangeAt(0) : document.createRange()
    range.deleteContents()
    range.insertNode(image)
    range.setStartAfter(image)
    range.collapse(true)
    selection.removeAllRanges()
    selection.addRange(range)
    setContent(editorRef.current.innerHTML)
  }

  const handleEditorImage = ()=> setImageDialogOpen(true)

  const runCommand = (command, value = null)=>{
    editorRef.current?.focus()
    const selection = window.getSelection()
    if(savedRangeRef.current && selection){
      selection.removeAllRanges()
      selection.addRange(savedRangeRef.current)
    }
    document.execCommand(command, false, value)
    if(editorRef.current) setContent(editorRef.current.innerHTML)
  }

  const applyHeading = (event)=>{
    const value = event.target.value
    runCommand('formatBlock', value)
    event.target.value = ''
  }

  const addLink = ()=>{
    const selection = window.getSelection()
    if(selection?.rangeCount) savedRangeRef.current = selection.getRangeAt(0).cloneRange()
    const url = window.prompt('Paste link URL')
    if(!url) return
    const normalized = /^https?:\/\//i.test(url.trim()) ? url.trim() : `https://${url.trim()}`
    runCommand('createLink', normalized)
  }

  const uploadInlineImage = ()=>{
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = async (event)=>{
      const file = event.target.files?.[0]
      if(!file) return
      try{
        setUploading(true)
        const fd = new FormData()
        fd.append('image', file)
        const res = await api.post('/uploads', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
        const url = res.data.data?.url
        if(url){ await insertImage(url); setImageDialogOpen(false); toast.success('Image inserted') }
        else toast.error('Image upload failed')
      }catch(err){ toast.error(err.response?.data?.message || 'Image upload failed') }
      finally{ setUploading(false) }
    }
    input.click()
  }

  const insertImageUrl = ()=>{
    const url = imageUrlInput.trim()
    if(!url) return toast.error('Enter an image URL')
    if(!/^https?:\/\//i.test(url)) return toast.error('Use a valid http or https image URL')
    insertImage(url)
    setImageUrlInput('')
    setImageDialogOpen(false)
  }

  if(loadingBlog) return <div className="max-w-3xl mx-auto">Loading blog...</div>

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-semibold mb-4">{existingBlog ? 'Edit Blog' : 'Create Blog'}</h2>
      <form onSubmit={submit}>
        <input placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)} className="w-full p-2 border rounded mb-3" />
        <input placeholder="Short excerpt" value={excerpt} onChange={e=>setExcerpt(e.target.value)} className="w-full p-2 border rounded mb-3" />
        <div className="blog-editor mb-5">
          <div className="blog-editor-toolbar">
            <select defaultValue="" onChange={applyHeading} title="Heading" aria-label="Text style"><option value="" disabled>Style</option><option value="p">Paragraph</option><option value="h2">Heading 2</option><option value="h3">Heading 3</option><option value="h4">Heading 4</option></select>
            <button type="button" onMouseDown={e=>e.preventDefault()} onClick={()=>runCommand('bold')} title="Bold"><strong>B</strong></button>
            <button type="button" onMouseDown={e=>e.preventDefault()} onClick={()=>runCommand('italic')} title="Italic"><em>I</em></button>
            <button type="button" onMouseDown={e=>e.preventDefault()} onClick={()=>runCommand('underline')} title="Underline"><u>U</u></button>
            <button type="button" onMouseDown={e=>e.preventDefault()} onClick={()=>runCommand('strikeThrough')} title="Strikethrough"><s>S</s></button>
            <button type="button" onMouseDown={e=>e.preventDefault()} onClick={()=>runCommand('insertUnorderedList')} title="Bullet list">•</button>
            <button type="button" onMouseDown={e=>e.preventDefault()} onClick={()=>runCommand('insertOrderedList')} title="Numbered list">1.</button>
            <button type="button" onMouseDown={e=>e.preventDefault()} onClick={()=>runCommand('formatBlock','blockquote')} title="Quote">“</button>
            <button type="button" onMouseDown={e=>e.preventDefault()} onClick={()=>runCommand('justifyLeft')} title="Align left">L</button>
            <button type="button" onMouseDown={e=>e.preventDefault()} onClick={()=>runCommand('justifyCenter')} title="Align center">C</button>
            <button type="button" onMouseDown={e=>e.preventDefault()} onClick={addLink} title="Add link"><Link2 size={16} /></button>
            <button type="button" onMouseDown={e=>e.preventDefault()} onClick={handleEditorImage} title="Add image"><ImageIcon size={16} /></button>
            <button type="button" onMouseDown={e=>e.preventDefault()} onClick={()=>runCommand('removeFormat')} title="Clear formatting"><Eraser size={16} /></button>
          </div>
          <div ref={editorRef} contentEditable suppressContentEditableWarning className="blog-editor-content" data-placeholder="Write your story... Use Image to add images inside the article." onInput={e=>setContent(e.currentTarget.innerHTML)} onKeyUp={()=>{ const selection = window.getSelection(); if(selection?.rangeCount) savedRangeRef.current = selection.getRangeAt(0).cloneRange() }} onMouseUp={()=>{ const selection = window.getSelection(); if(selection?.rangeCount) savedRangeRef.current = selection.getRangeAt(0).cloneRange() }} />
        </div>
        {imageDialogOpen && (
          <div className="mb-5 rounded-lg border border-blue-200 bg-blue-50 p-4">
            <div className="flex items-center justify-between gap-3">
              <div><h3 className="font-semibold text-gray-900">Add image to your story</h3><p className="mt-1 text-sm text-gray-600">Choose how you want to add this image.</p></div>
              <button type="button" onClick={()=>setImageDialogOpen(false)} className="text-sm text-gray-500">Cancel</button>
            </div>
            <div className="mt-3 flex flex-col sm:flex-row gap-3">
              <button type="button" onClick={uploadInlineImage} className="px-3 py-2 bg-blue-600 text-white rounded">Upload from device</button>
              <div className="flex flex-1 gap-2"><input value={imageUrlInput} onChange={e=>setImageUrlInput(e.target.value)} placeholder="Paste image URL" className="min-w-0 flex-1 p-2 border rounded" /><button type="button" onClick={insertImageUrl} className="px-3 py-2 border border-blue-600 text-blue-700 rounded">Insert URL</button></div>
            </div>
          </div>
        )}
        <div className="mb-3">
          <label className="block mb-2 font-medium">Cover image (optional)</label>
          <input type="file" accept="image/*" onChange={handleFileChange} />
          {uploading && <div className="text-sm text-gray-600 mt-2">Uploading...</div>}
          {(coverUrl || coverPreview) && (
            <div className="mt-3">
              <img src={coverUrl || coverPreview} alt="cover preview" className="w-48 h-32 object-cover rounded" />
              {coverUrl && <div className="text-sm text-green-600 mt-2">Uploaded</div>}
              <button type="button" onClick={removeCover} className="block mt-2 text-sm text-red-600">Remove image</button>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button className="bg-blue-600 text-white px-4 py-2 rounded" disabled={loading}>{loading ? (existingBlog ? 'Saving...' : 'Publishing...') : (existingBlog ? 'Save changes' : 'Publish')}</button>
          {existingBlog && <button type="button" onClick={()=>navigate(`/blog/${existingBlog.slug}`)} className="px-4 py-2 border rounded">Cancel</button>}
        </div>
      </form>
    </div>
  )
}
