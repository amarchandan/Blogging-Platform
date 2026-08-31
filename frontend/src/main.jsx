import React from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import App from './App'
import './styles/index.css'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <ThemeProvider>
        {/* use RouterProvider so we can opt into React Router future flags */}
        <RouterProvider router={createBrowserRouter([{ path: '/*', element: <App /> }])} future={{ v7_startTransition: true, v7_relativeSplatPath: true }} />
        <ToastContainer position="top-right" />
      </ThemeProvider>
    </AuthProvider>
  </React.StrictMode>
)
