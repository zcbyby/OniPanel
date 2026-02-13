import { useState, useEffect } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { apiCallJSON } from '../utils/api'
import './NetworkTab.css'

export default function NetworkTab() {
  const [networkInfo, setNetworkInfo] = useState(null)
  const [selectedTab, setSelectedTab] = useState('stats')
  const [networkHistory, setNetworkHistory] = useState([])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const fetchNetworkInfo = async () => {
      try {
        const data = await apiCallJSON('/api/network')
        setNetworkInfo(data)
        setReady(true)

        setNetworkHistory(prev => {
          const totalRx = (data.interfaces || []).reduce((sum, net) => sum + (net.rx_bytes || 0), 0)
          const totalTx = (data.interfaces || []).reduce((sum, net) => sum + (net.tx_bytes || 0), 0)
          
          const newEntry = {
            time: new Date().toLocaleTimeString(),
            rx: totalRx,
            tx: totalTx,
          }
          
          const newHistory = [...prev, newEntry]
          return newHistory.slice(-20)
        })
      } catch (error) {
        console.error('Failed to fetch network info:', error)
      }
    }

    fetchNetworkInfo()
    const interval = setInterval(fetchNetworkInfo, 3000)
    return () => clearInterval(interval)
  }, [])

  const formatBytes = (bytes) => {
    if (!bytes || bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  if (!ready || !networkInfo) {
    return <div className="win-loading">Loading...</div>
  }

  return (
    <div className="win-network">
      <div className="win-tabs">
        <button 
          className={`win-tab-btn ${selectedTab === 'stats' ? 'active' : ''}`}
          onClick={() => setSelectedTab('stats')}
        >
          Statistics
        </button>
        <button 
          className={`win-tab-btn ${selectedTab === 'interfaces' ? 'active' : ''}`}
          onClick={() => setSelectedTab('interfaces')}
        >
          Interfaces
        </button>
      </div>

      {selectedTab === 'stats' && (
        <div className="win-stats-content">
          {networkHistory.length > 1 && (
            <div className="app-card">
              <div className="app-card-header">
                <div className="win-card-icon">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                    <path d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z"/>
                  </svg>
                </div>
                <h3 className="win-card-title">Network Traffic</h3>
              </div>
              <div className="app-card-body">
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={networkHistory} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis dataKey="time" stroke="#666" style={{ fontSize: '11px' }} />
                    <YAxis stroke="#666" style={{ fontSize: '11px' }} />
                    <Tooltip formatter={(value) => formatBytes(value)} contentStyle={{ backgroundColor: '#fff', border: '1px solid #e0e0e0', fontSize: '12px' }} />
                    <Legend />
                    <Line type="monotone" dataKey="rx" stroke="#0078d4" dot={false} name="Download" />
                    <Line type="monotone" dataKey="tx" stroke="#107c10" dot={false} name="Upload" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          <div className="app-card">
            <div className="app-card-header">
              <div className="win-card-icon">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z"/>
                </svg>
              </div>
              <h3 className="win-card-title">Summary</h3>
            </div>
            <div className="app-card-body">
              <div className="win-summary-grid">
                {(networkInfo.interfaces || []).map((net, idx) => (
                  <div key={idx} className="win-summary-item">
                    <div className="win-iface-name">{net.iface || 'Unknown'}</div>
                    <div className="win-iface-metrics">
                      <div className="win-iface-metric">
                        <span className="win-metric-label">Down</span>
                        <span className="win-metric-val">{formatBytes(net.rx_bytes)}</span>
                      </div>
                      <div className="win-iface-metric">
                        <span className="win-metric-label">Up</span>
                        <span className="win-metric-val">{formatBytes(net.tx_bytes)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedTab === 'interfaces' && (
        <div className="win-grid-3">
          {(networkInfo.physicalInterfaces || []).map((iface, idx) => (
            <div key={idx} className="app-card">
              <div className="app-card-header">
                <div className="win-card-icon">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                    <path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z"/>
                  </svg>
                </div>
                <h3 className="win-card-title">{iface.ifname || 'Unknown'}</h3>
              </div>
              <div className="app-card-body">
                <div className="win-iface-details">
                  <div className="win-detail-row">
                    <span className="win-detail-label">Status</span>
                    <span className={`win-detail-value ${iface.iface === 'up' ? 'status-up' : 'status-down'}`}>
                      {iface.iface === 'up' ? 'Up' : 'Down'}
                    </span>
                  </div>
                  {iface.ip4 && (
                    <div className="win-detail-row">
                      <span className="win-detail-label">IPv4</span>
                      <span className="win-detail-value">{iface.ip4}</span>
                    </div>
                  )}
                  {iface.ip6 && (
                    <div className="win-detail-row">
                      <span className="win-detail-label">IPv6</span>
                      <span className="win-detail-value" style={{ fontSize: '11px' }}>{iface.ip6}</span>
                    </div>
                  )}
                  {iface.mac && (
                    <div className="win-detail-row">
                      <span className="win-detail-label">MAC</span>
                      <span className="win-detail-value" style={{ fontSize: '11px' }}>{iface.mac}</span>
                    </div>
                  )}
                  {iface.netmask && (
                    <div className="win-detail-row">
                      <span className="win-detail-label">Netmask</span>
                      <span className="win-detail-value">{iface.netmask}</span>
                    </div>
                  )}
                  {iface.speed && (
                    <div className="win-detail-row">
                      <span className="win-detail-label">Speed</span>
                      <span className="win-detail-value">{iface.speed} Mbps</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedTab === 'interfaces' && (networkInfo.physicalInterfaces || []).length === 0 && (
        <div className="win-empty">
          <p>No network interfaces found</p>
        </div>
      )}
    </div>
  )
}
