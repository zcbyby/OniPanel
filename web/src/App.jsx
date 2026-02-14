import { useState, useEffect } from 'react'
import {
  FluentProvider,
  webLightTheme,
  Avatar,
  Divider,
  Button,
  Text,
  Subtitle1,
  Subtitle2,
  Body1,
  Caption1,
} from '@fluentui/react-components'
import {
  ChartMultiple24Regular,
  Settings24Regular,
  Storage24Regular,
  Globe24Regular,
  SignOut24Regular,
  DesktopSignal24Regular,
} from '@fluentui/react-icons'
import Login from './components/Login'
import OverviewTab from './components/OverviewTab'
import ProcessesTab from './components/ProcessesTab'
import DiskTab from './components/DiskTab'
import NetworkTab from './components/NetworkTab'
import './App.css'

const navItems = [
  { id: 'overview', label: 'Overview', icon: ChartMultiple24Regular },
  { id: 'processes', label: 'Processes', icon: Settings24Regular },
  { id: 'disk', label: 'Storage', icon: Storage24Regular },
  { id: 'network', label: 'Network', icon: Globe24Regular },
]

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
      <FluentProvider theme={webLightTheme}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
          <Text>Loading...</Text>
        </div>
      </FluentProvider>
    )
  }

  const currentPath = window.location.pathname
  
  if (!isLoggedIn && currentPath !== loginPath) {
    return (
      <FluentProvider theme={webLightTheme}>
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '100vh',
          background: '#0078d4',
        }}>
          <div style={{ 
            width: 48, 
            height: 48, 
            borderRadius: 8, 
            background: 'rgba(255,255,255,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 24
          }}>
            <DesktopSignal24Regular style={{ color: 'white', fontSize: 24 }} />
          </div>
          <Subtitle1 style={{ color: 'white', fontWeight: 600 }}>Access Restricted</Subtitle1>
          <Caption1 style={{ color: 'rgba(255,255,255,0.7)', marginTop: 8 }}>Please sign in to access this page</Caption1>
        </div>
      </FluentProvider>
    )
  }

  if (!isLoggedIn) {
    return <Login onLoginSuccess={handleLoginSuccess} />
  }

  const getContent = () => {
    switch (selectedTab) {
      case 'overview': return <OverviewTab />
      case 'processes': return <ProcessesTab />
      case 'disk': return <DiskTab />
      case 'network': return <NetworkTab />
      default: return <OverviewTab />
    }
  }

  const getTitle = () => {
    const titles = {
      overview: 'Overview',
      processes: 'Processes',
      disk: 'Storage',
      network: 'Network',
    }
    return titles[selectedTab] || 'Settings'
  }

  const NavIcon = ({ icon: Icon, active }) => (
    <Icon style={{ fontSize: 20, color: active ? '#0078d4' : '#606060' }} />
  )

  return (
    <FluentProvider theme={webLightTheme}>
      <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#f5f5f5' }}>
        <div style={{ 
          width: 280, 
          background: 'white',
          borderRight: '1px solid #e5e5e5',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '2px 0 8px rgba(0,0,0,0.04)'
        }}>
          <div style={{ padding: '20px 20px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ 
                width: 36, 
                height: 36, 
                borderRadius: 8, 
                background: 'linear-gradient(135deg, #0078d4, #005a9e)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <DesktopSignal24Regular style={{ color: 'white', fontSize: 20 }} />
              </div>
              <div>
                <Text style={{ fontSize: 18, fontWeight: 600, display: 'block', lineHeight: 1.2 }}>OniPanel</Text>
                <Caption1 style={{ color: '#666', display: 'block' }}>Server Monitoring</Caption1>
              </div>
            </div>
          </div>

          <nav style={{ flex: 1, padding: '0 8px' }}>
            {navItems.map(item => {
              const isActive = selectedTab === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => setSelectedTab(item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    width: '100%',
                    padding: '10px 12px',
                    border: 'none',
                    background: isActive ? 'rgba(0,120,212,0.08)' : 'transparent',
                    borderRadius: 6,
                    cursor: 'pointer',
                    textAlign: 'left',
                    marginBottom: 2,
                    color: isActive ? '#0078d4' : '#424242',
                    fontWeight: isActive ? 600 : 400,
                    fontSize: 14,
                    fontFamily: 'inherit',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <NavIcon icon={item.icon} active={isActive} />
                  {item.label}
                </button>
              )
            })}
          </nav>

          <Divider style={{ margin: '8px 16px' }} />

          <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <Avatar name={user?.username || 'Admin'} size={36} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <Body1 style={{ fontWeight: 500, lineHeight: 1.3 }}>{user?.username || 'Admin'}</Body1>
              <Caption1 style={{ color: '#666', display: 'block', marginTop: 2 }}>Administrator</Caption1>
            </div>
            <Button 
              appearance="subtle" 
              onClick={handleLogout}
              title="Sign out"
              style={{ minWidth: 32 }}
            >
              <SignOut24Regular />
            </Button>
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ 
            padding: '20px 32px', 
            borderBottom: '1px solid #e5e5e5',
            background: 'white',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
          }}>
            <Subtitle1 style={{ fontWeight: 600, fontSize: 24 }}>{getTitle()}</Subtitle1>
          </div>

          <div style={{ 
            flex: 1, 
            overflowY: 'auto', 
            padding: 24,
            background: '#f5f5f5'
          }}>
            {getContent()}
          </div>
        </div>
      </div>
    </FluentProvider>
  )
}

export default App
