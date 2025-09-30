import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, Navigate } from 'react-router'
import { RouterProvider } from 'react-router/dom'
import './index.css'
import AuthLayout from './layouts/AuthLayout.tsx'
import { AuthProvider } from './layouts/AuthProvider.tsx'
import MainLayout from './layouts/MainLayout.tsx'
import HomePage from './pages/HomePage.tsx'
import CallbackPage from './pages/auth/CallbackPage.tsx'
import ProtectedRoute from './layouts/ProtectedRoute.tsx'
import LandingPage from './pages/LandingPage.tsx'
import PlaylistPage from './pages/PlaylistPage.tsx'
import ProfilePage from './pages/ProfilePage.tsx'

const router = createBrowserRouter([
  {
    index: true,
    Component: LandingPage,
  },
  {
    path: '/u', // u for user (arbitrary)
    element: <ProtectedRoute><MainLayout /></ProtectedRoute>,
    children: [
      { index: true, element: <Navigate to='playlists' replace /> },
      {
        path: 'playlists', children: [
          { index: true, Component: HomePage },
          { path: ':playlistId', Component: PlaylistPage },
        ]
      },
      { path: 'profile', Component: ProfilePage },
    ]
  },
  {
    path: '/auth',
    Component: AuthLayout,
    children: [
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
