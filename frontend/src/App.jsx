import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import BlogPage from './pages/Blog'
import CreateBlog from './pages/CreateBlog'
import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/Navbar'
import Search from './pages/Search'
import Explore from './pages/Explore'
import Trending from './pages/Trending'
import Profile from './pages/Profile'
import Dashboard from './pages/Dashboard'
import AdminComments from './pages/AdminComments'
import AdminDashboard from './pages/AdminDashboard'
import AdminUsers from './pages/AdminUsers'

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100 transition-colors">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Home/>} />
          <Route path="/login" element={<Login/>} />
          <Route path="/register" element={<Register/>} />
          <Route path="/blog/:slug" element={<BlogPage/>} />
          <Route path="/create" element={<ProtectedRoute><CreateBlog/></ProtectedRoute>} />
          <Route path="/search" element={<Search/>} />
          <Route path="/explore" element={<Explore/>} />
          <Route path="/trending" element={<Trending/>} />
          <Route path="/profile/:username" element={<Profile/>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard/></ProtectedRoute>} />
          <Route path="/admin/comments" element={<ProtectedRoute><AdminComments/></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute><AdminDashboard/></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute><AdminUsers/></ProtectedRoute>} />
        </Routes>
      </main>
    </div>
  )
}
