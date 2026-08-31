import React, { useContext, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { ThemeContext } from '../context/ThemeContext'
import SignupModal from './SignupModal'
import { Menu, Search, X } from 'lucide-react'

export default function Navbar(){
  const { user, logout } = useContext(AuthContext)
  const { theme, toggle } = useContext(ThemeContext)
  const [q, setQ] = useState('')
  const [showSignup, setShowSignup] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()

  const submit = (e)=>{ e.preventDefault(); if(!q) return; navigate(`/search?q=${encodeURIComponent(q)}`) }

  return (
    <header className="bg-white dark:bg-gray-900 shadow">
      <div className="container mx-auto px-4 py-3 flex items-center gap-3">
        <Link to="/" className="text-xl font-bold">Blog Platform</Link>
        <form onSubmit={submit} className="order-3 lg:order-none basis-full lg:basis-auto flex items-center flex-1 max-w-md lg:mx-4 p-1 bg-white rounded-xl border border-gray-200 shadow-sm w-full lg:w-auto">
          <label className="relative flex-1">
            <Search size={19} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input aria-label="Search blogs" placeholder="Search" value={q} onChange={e=>setQ(e.target.value)} className="w-full h-12 pl-10 pr-3 bg-transparent text-gray-800 placeholder:text-gray-400 outline-none" />
          </label>
          <button type="submit" aria-label="Submit search" title="Search" className="w-12 h-12 flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
            <Search size={20} />
          </button>
        </form>
        <button type="button" onClick={()=>setMenuOpen(open=>!open)} className="ml-auto lg:hidden p-2 rounded-lg border border-gray-200 text-gray-700 dark:text-gray-200" aria-label={menuOpen ? 'Close menu' : 'Open menu'}>
          {menuOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
        <nav className="hidden lg:flex items-center gap-3 lg:gap-4 flex-nowrap">
          <Link to="/explore" className="text-sm text-gray-700 dark:text-gray-200">Explore</Link>
          <Link to="/trending" className="text-sm text-gray-700 dark:text-gray-200">Trending</Link>
          {user ? (
            <>
              <Link to="/create" className="text-sm text-blue-600">Create</Link>
              <Link to={`/profile/${user.username}`} className="text-sm">{user.name}</Link>
              <Link to="/dashboard" className="text-sm text-gray-700">Dashboard</Link>
              {user.role === 'ADMIN' && <Link to="/admin" className="text-sm font-medium text-emerald-600">Admin</Link>}
              <button onClick={logout} className="text-sm text-red-500">Logout</button>
            </>
          ) : (
            <>
              <button onClick={()=>setShowSignup(true)} className="text-sm px-3 py-1 bg-blue-600 text-white rounded">Create Account</button>
              <Link to="/login" className="text-sm text-blue-600">Login</Link>
            </>
          )}
          <label className="theme-switch" title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'} onClick={(event)=>{ event.preventDefault(); toggle() }}>
            <input type="checkbox" className="theme-switch__checkbox" checked={theme === 'dark'} readOnly aria-label="Toggle dark mode" />
            <span className="theme-switch__container" aria-hidden="true">
              <span className="theme-switch__clouds" />
              <span className="theme-switch__stars">✦ ✧</span>
              <span className="theme-switch__circle-container"><span className="theme-switch__sun-moon"><span className="theme-switch__moon-spots" /></span></span>
            </span>
          </label>
        </nav>
      </div>
      {menuOpen && <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={()=>setMenuOpen(false)} />}
      <aside className={`fixed right-0 top-0 z-50 h-full w-80 max-w-[88vw] bg-white dark:bg-gray-900 shadow-2xl transition-transform duration-300 lg:hidden ${menuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-5 py-4">
          <span className="font-semibold text-gray-900 dark:text-gray-100">Menu</span>
          <button type="button" onClick={()=>setMenuOpen(false)} className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800" aria-label="Close menu"><X size={21} /></button>
        </div>
        <div className="flex flex-col gap-1 p-5">
          <Link onClick={()=>setMenuOpen(false)} to="/explore" className="rounded-lg px-3 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800">Explore</Link>
          <Link onClick={()=>setMenuOpen(false)} to="/trending" className="rounded-lg px-3 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800">Trending</Link>
          {user ? <>
            <Link onClick={()=>setMenuOpen(false)} to="/create" className="rounded-lg px-3 py-3 text-blue-600 hover:bg-blue-50 dark:hover:bg-gray-800">Create</Link>
            <Link onClick={()=>setMenuOpen(false)} to={`/profile/${user.username}`} className="rounded-lg px-3 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800">{user.name || user.username}</Link>
            <Link onClick={()=>setMenuOpen(false)} to="/dashboard" className="rounded-lg px-3 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800">Dashboard</Link>
            {user.role === 'ADMIN' && <Link onClick={()=>setMenuOpen(false)} to="/admin" className="rounded-lg px-3 py-3 font-medium text-emerald-600 hover:bg-emerald-50 dark:hover:bg-gray-800">Admin</Link>}
            <button onClick={()=>{ setMenuOpen(false); logout() }} className="mt-2 rounded-lg px-3 py-3 text-left text-red-500 hover:bg-red-50 dark:hover:bg-gray-800">Logout</button>
          </> : <>
            <button onClick={()=>{ setMenuOpen(false); setShowSignup(true) }} className="mt-2 rounded-lg bg-blue-600 px-3 py-3 text-left text-white">Create Account</button>
            <Link onClick={()=>setMenuOpen(false)} to="/login" className="rounded-lg px-3 py-3 text-blue-600 hover:bg-blue-50 dark:hover:bg-gray-800">Login</Link>
          </>}
          <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4 flex items-center justify-between px-3"><span className="text-sm text-gray-500 dark:text-gray-400">Appearance</span><label className="theme-switch" title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'} onClick={(event)=>{ event.preventDefault(); toggle() }}><input type="checkbox" className="theme-switch__checkbox" checked={theme === 'dark'} readOnly aria-label="Toggle dark mode" /><span className="theme-switch__container" aria-hidden="true"><span className="theme-switch__clouds" /><span className="theme-switch__stars">✦ ✧</span><span className="theme-switch__circle-container"><span className="theme-switch__sun-moon"><span className="theme-switch__moon-spots" /></span></span></span></label></div>
        </div>
      </aside>
      <SignupModal open={showSignup} onClose={()=>setShowSignup(false)} />
    </header>
  )
}
