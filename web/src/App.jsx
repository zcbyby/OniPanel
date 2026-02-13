import { useState, useEffect } from 'react'
import Login from './components/Login'
import OverviewTab from './components/OverviewTab'
import ProcessesTab from './components/ProcessesTab'
import DiskTab from './components/DiskTab'
import NetworkTab from './components/NetworkTab'
import Header from './components/Header'
import './App.css'

function App() {
  const [selectedTab, setSelectedTab] = useState('overview')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loginPath, setLoginPath] = useState('')

  useEffect(() => {
    fetch('/api/login-path')
      .then(res => res.json())
      .then(data => setLoginPath(data.loginPath))
      .catch(() => {})
  }, [])

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    if (token && userData) {
      setIsLoggedIn(true)
      setUser(JSON.parse(userData))
    }
    setLoading(false)
  }, [])

  const handleLoginSuccess = (userData) => {
    setUser(userData)
    setIsLoggedIn(true)
    window.location.href = '/'
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setIsLoggedIn(false)
    setUser(null)
  }

  if (loading || !loginPath) {
    return (
      <div className="win-page-container">
        <div className="win-loader"></div>
      </div>
    )
  }

  const currentPath = window.location.pathname
  
  if (!isLoggedIn && currentPath !== loginPath) {
    return (
      <div className="win-page-container">
        <div className="win-forbidden">
          <div className="win-forbidden-icon">
            <svg viewBox="0 24" width="0 24 56" height="56" fill="currentColor">
              <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
            </svg>
          </div>
          <h2>Access Restricted</h2>
          <p>Please sign in to access this page</p>
        </div>
      </div>
    )
  }

  if (!isLoggedIn) {
    return <Login onLoginSuccess={handleLoginSuccess} />
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'processes', label: 'Processes' },
    { id: 'disk', label: 'Storage' },
    { id: 'network', label: 'Network' },
  ]

  return (
    <div className="win-app">
      <Header onLogout={handleLogout} user={user} />
      
      <div className="win-nav">
        <div className="win-nav-bar">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`win-nav-item ${selectedTab === tab.id ? 'active' : ''}`}
              onClick={() => setSelectedTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="win-content">
        {selectedTab === 'overview' && <OverviewTab />}
        {selectedTab === 'processes' && <ProcessesTab />}
        {selectedTab === 'disk' && <DiskTab />}
        {selectedTab === 'network' && <NetworkTab />}
      </div>
    </div>
  )
}

export default App
