import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useStore } from './store'
import Layout from './components/Layout'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Onboarding from './pages/Onboarding'
import Home from './pages/Home'
import Content from './pages/Content'
import Blitz from './pages/Blitz'
import Library from './pages/Library'
import Calendar from './pages/Calendar'
import Analytics from './pages/Analytics'
import Engagement from './pages/Engagement'
import Brand from './pages/Brand'
import Settings from './pages/Settings'

function PrivateRoute({ children }) {
  const { token } = useStore()
  return token ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/onboarding" element={<PrivateRoute><Onboarding /></PrivateRoute>} />
        <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route index element={<Navigate to="/home" replace />} />
          <Route path="home" element={<Home />} />
          <Route path="content" element={<Content />} />
          <Route path="blitz" element={<Blitz />} />
          <Route path="library" element={<Library />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="engagement" element={<Engagement />} />
          <Route path="brand" element={<Brand />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
