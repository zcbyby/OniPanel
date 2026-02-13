import { useEffect, useState } from 'react'
import './Header.css'

export default function Header({ onLogout, user }) {
  const [uptime, setUptime] = useState('Loading...')
  const [hostname, setHostname] = useState('Loading...')
  const [stats, setStats] = useState({
    cpu: 0,
    memory: 0,
    rxSpeed: 0,
    txSpeed: 0,
    load: [0, 0, 0],
  })
  const [ready, setReady] = useState(false)

  const getToken = () => localStorage.getItem('token')

  const fetchWithAuth = (url) => {
    const token = getToken()
    return fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` },
    })
  }

  const formatSpeed = (bytes) => {
    if (bytes < 1024) return bytes + ' B/s'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB/s'
    return (bytes / 1024 / 1024).toFixed(1) + ' MB/s'
  }

  useEffect(() => {
    const fetchSystemInfo = async () => {
      try {
        const response = await fetchWithAuth('/api/system-info')
        if (response.status === 401) {
          setError('Session expired')
          return
        }
        const data = await response.json()
        setHostname(data.os.hostname || 'Unknown')
        const seconds = Math.floor(data.os.uptime)
        const days = Math.floor(seconds / 86400)
        const hours = Math.floor((seconds % 86400) / 3600)
        const minutes = Math.floor((seconds % 3600) / 60)
        setUptime(`${days}d ${hours}h ${minutes}m`)
      } catch (error) {
        console.error('Failed to fetch system info:', error)
      }
    }

    fetchSystemInfo()
    const interval = setInterval(fetchSystemInfo, 60000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [statusRes, speedRes] = await Promise.all([
          fetchWithAuth('/api/system-status'),
          fetchWithAuth('/api/network-speed'),
        ])
        
        if (statusRes.status === 401 || speedRes.status === 401) {
          return
        }
        
        const statusData = await statusRes.json()
        const speedData = await speedRes.json()
        setStats({
          cpu: statusData.cpu?.load || 0,
          memory: statusData.memory?.usagePercent || 0,
          rxSpeed: speedData?.rx || 0,
          txSpeed: speedData?.tx || 0,
          load: statusData.system?.loadAverage ? 
            [statusData.system.loadAverage.one || 0, 
             statusData.system.loadAverage.five || 0, 
             statusData.system.loadAverage.fifteen || 0] : [0, 0, 0],
        })
        setReady(true)
      } catch (error) {
        console.error('Failed to fetch stats:', error)
      }
    }
    fetchStats()
    const interval = setInterval(fetchStats, 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <header className="win-header">
      <div className="win-header-left">
        <div className="win-logo">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
          </svg>
        </div>
        <h1 className="win-title">OKPanel</h1>
      </div>

      <div className="win-header-stats">
        {!ready ? (
          <div className="win-stat"><span className="win-stat-label">Loading...</span></div>
        ) : (
          <>
            <div className="win-stat">
              <span className="win-stat-label">CPU</span>
              <span className="win-stat-value">{(stats.cpu || 0).toFixed(1)}%</span>
            </div>
            <div className="win-stat-divider"></div>
            <div className="win-stat">
              <span className="win-stat-label">Memory</span>
              <span className="win-stat-value">{(stats.memory || 0).toFixed(1)}%</span>
            </div>
            <div className="win-stat-divider"></div>
            <div className="win-stat">
              <span className="win-stat-label">Download</span>
              <span className="win-stat-value">{formatSpeed(stats.rxSpeed)}</span>
            </div>
            <div className="win-stat-divider"></div>
            <div className="win-stat">
              <span className="win-stat-label">Upload</span>
              <span className="win-stat-value">{formatSpeed(stats.txSpeed)}</span>
            </div>
            <div className="win-stat-divider"></div>
            <div className="win-stat">
              <span className="win-stat-label">Load</span>
              <span className="win-stat-value">{(stats.load[0] || 0).toFixed(2)}</span>
            </div>
          </>
        )}
      </div>

      <div className="win-header-right">
        <div className="win-info-item">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" opacity="0.6">
            <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
          </svg>
          <span>{uptime}</span>
        </div>
        <div className="win-stat-divider"></div>
        <div className="win-info-item">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" opacity="0.6">
            <path d="M20 18c1.1 0 1.99-.9 1.99-2L22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2H0v2h24v-2h-4zM4 6h16v10H4V6z"/>
          </svg>
          <span>{hostname}</span>
        </div>
        <div className="win-stat-divider"></div>
        <button className="win-logout-btn" onClick={onLogout} title="Sign out">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
          </svg>
          <span>Sign out</span>
        </button>
      </div>
    </header>
  )
}
