export function mediaUrl(value){
  if(!value) return ''
  if(/^https?:\/\//i.test(value)) return value
  if(value.startsWith('/uploads/')) {
    const apiOrigin = import.meta.env.VITE_API_ORIGIN || 'http://localhost:5000'
    return `${apiOrigin}${value}`
  }
  return value
}
