import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter } from 'react-router'
import { RouterProvider } from 'react-router/dom'
import './index.css'
import AuthLayout from './layouts/AuthLayout.tsx'
import { AuthProvider } from './utils/AuthContext.tsx'
import MainLayout from './layouts/MainLayout.tsx'
import Home from './pages/Home.tsx'
import Login from './pages/auth/Login.tsx'
import Callback from './pages/auth/Callback.tsx'
import ProtectedRoute from './layouts/ProtectedRoute.tsx'

const router = createBrowserRouter([
  {
    element: <ProtectedRoute><MainLayout /></ProtectedRoute>,
    children: [
      { index: true, Component: Home },
    ]
  },
  {
    path: '/auth',
    Component: AuthLayout,
    children: [
      { path: 'login', Component: Login },
      { path: 'callback', Component: Callback }
    ]
  }
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>,
)
