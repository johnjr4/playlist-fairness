import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter } from 'react-router'
import { RouterProvider } from 'react-router/dom'
import './index.css'
import AuthLayout from './layouts/AuthLayout.tsx'
import { AuthProvider } from './layouts/AuthProvider.tsx'
import MainLayout from './layouts/MainLayout.tsx'
import HomePage from './pages/HomePage.tsx'
import LoginPage from './pages/auth/LoginPage.tsx'
import CallbackPage from './pages/auth/CallbackPage.tsx'
import ProtectedRoute from './layouts/ProtectedRoute.tsx'
import LandingPage from './pages/LandingPage.tsx'
import PlaylistPage from './pages/PlaylistPage.tsx'

const router = createBrowserRouter([
  {
    index: true,
    Component: LandingPage,
  },
  {
    path: '/user',
    element: <ProtectedRoute><MainLayout /></ProtectedRoute>,
    children: [
      { index: true, Component: HomePage },
      { path: ':spotifyUri', Component: PlaylistPage },
    ]
  },
  {
    path: '/auth',
    Component: AuthLayout,
    children: [
      { path: 'login', Component: LoginPage },
      { path: 'callback', Component: CallbackPage }
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
