import { useState, useEffect } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import SystemInfoPanel from './SystemInfoPanel'
import { apiCallJSON } from '../utils/api'
import './OverviewTab.css'

export default function OverviewTab() {
  const [systemInfo, setSystemInfo] = useState(null)
  const [status, setStatus] = useState(null)
  const [chartData, setChartData] = useState([])
  const [extraData, setExtraData] = useState({ diskIO: { readRate: 0, writeRate: 0 }, netConn: { total: 0, established: 0, listen: 0 } })
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [infoData, statusData, diskIOData, netConnData] = await Promise.all([
          apiCallJSON('/api/system-info'),
          apiCallJSON('/api/system-status'),
          apiCallJSON('/api/disk-io').catch(() => ({ readRate: 0, writeRate: 0 })),
          apiCallJSON('/api/network-connections').catch(() => ({ total: 0, established: 0, listen: 0 })),
        ])
        
        setSystemInfo(infoData)
        setStatus(statusData)
        setExtraData({ diskIO: diskIOData, netConn: netConnData })
        setReady(true)

        setChartData(prev => {
          const newData = [
            ...prev,
            {
              time: new Date().toLocaleTimeString(),
              memory: Number((statusData.memory?.usagePercent || 0).toFixed(2)),
              cpu: Number((statusData.cpu?.load || 0).toFixed(2)),
            }
          ]
          return newData.slice(-20)
        })
      } catch (error) {
        console.error('Failed to fetch overview data:', error)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 2000)
    return () => clearInterval(interval)
  }, [])

  if (!ready || !systemInfo || !status) {
    return <div className="win-loading">Loading...</div>
  }

  const cpuLoad = status.cpu?.load || 0
  const memUsed = status.memory?.used || 0
  const memTotal = status.memory?.total || 1
  const memPercent = status.memory?.usagePercent || 0
  const loadOne = status.system?.loadAverage?.one || 0
  const loadFive = status.system?.loadAverage?.five || 0
  const loadFifteen = status.system?.loadAverage?.fifteen || 0

  return (
    <div className="win-overview">
      <SystemInfoPanel systemInfo={systemInfo} />

      <div className="win-grid-2">
        <div className="app-card">
          <div className="app-card-header">
            <div className="win-card-icon">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M15 9H9v6h6V9zm-2 4h-2v-2h2v2zm8-2V9h-2V7c0-1.1-.9-2-2-2h-2V3h-2v2h-2V3H9v2H7c-1.1 0-2 .9-2 2v2H3v2h2v2H3v2h2v2c0 1.1.9 2 2 2h2v2h2v-2h2v2h2v-2h2c1.1 0 2-.9 2-2v-2h2v-2h-2v-2h2zm-4 6H7V7h10v10z"/>
              </svg>
            </div>
            <h3 className="win-card-title">CPU Usage</h3>
          </div>
          <div className="app-card-body">
            <div className="win-metric">
              <div className="win-metric-header">
                <span>Total</span>
                <span className="win-metric-value">{cpuLoad.toFixed(2)}%</span>
              </div>
              <div className="win-progress">
                <div 
                  className="win-progress-bar" 
                  style={{
                    width: `${cpuLoad}%`,
                    backgroundColor: cpuLoad > 80 ? '#d13438' : '#107c10'
                  }}
                ></div>
              </div>
            </div>
            <div className="win-cores">
              <h4>Per Core:</h4>
              {(status.cpu?.loadPerCpu || []).map((load, idx) => (
                <div key={idx} className="win-core">
                  <div className="win-core-header">
                    <span>Core {idx}</span>
                    <span>{(load || 0).toFixed(1)}%</span>
                  </div>
                  <div className="win-progress win-progress-sm">
                    <div 
                      className="win-progress-bar" 
                      style={{
                        width: `${load || 0}%`,
                        backgroundColor: (load || 0) > 80 ? '#ffc107' : '#0078d4'
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="app-card">
          <div className="app-card-header">
            <div className="win-card-icon">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M15 9H9v6h6V9zm-2 4h-2v-2h2v2zm8-2V9h-2V7c0-1.1-.9-2-2-2h-2V3h-2v2h-2V3H9v2H7c-1.1 0-2 .9-2 2v2H3v2h2v2H3v2h2v2c0 1.1.9 2 2 2h2v2h2v-2h2v2h2v-2h2c1.1 0 2-.9 2-2v-2h2v-2h-2v-2h2zm-4 6H7V7h10v10z"/>
              </svg>
            </div>
            <h3 className="win-card-title">Memory</h3>
          </div>
          <div className="app-card-body">
            <div className="win-metric">
              <div className="win-metric-header">
                <span>Used</span>
                <span className="win-metric-value">
                  {(memUsed / 1024 / 1024 / 1024).toFixed(2)} GB / {(memTotal / 1024 / 1024 / 1024).toFixed(2)} GB
                </span>
              </div>
              <div className="win-progress">
                <div 
                  className="win-progress-bar" 
                  style={{
                    width: `${memPercent}%`,
                    backgroundColor: memPercent > 80 ? '#d13438' : '#107c10'
                  }}
                ></div>
              </div>
              <div className="win-usage-text">
                {memPercent.toFixed(2)}% used
              </div>
            </div>
          </div>
        </div>

        <div className="app-card">
          <div className="app-card-header">
            <div className="win-card-icon">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/>
              </svg>
            </div>
            <h3 className="win-card-title">Processes</h3>
          </div>
          <div className="app-card-body">
            <div className="win-stats-row">
              <div className="win-stat-box">
                <div className="win-stat-label">Total</div>
                <div className="win-stat-value">{status.processes?.total || 0}</div>
              </div>
              <div className="win-stat-box">
                <div className="win-stat-label">Running</div>
                <div className="win-stat-value" style={{ color: '#107c10' }}>{status.processes?.running || 0}</div>
              </div>
              <div className="win-stat-box">
                <div className="win-stat-label">Sleeping</div>
                <div className="win-stat-value" style={{ color: '#0078d4' }}>{status.processes?.sleeping || 0}</div>
              </div>
              {(status.processes?.zombie || 0) > 0 && (
                <div className="win-stat-box">
                  <div className="win-stat-label">Zombie</div>
                  <div className="win-stat-value" style={{ color: '#d13438' }}>{status.processes.zombie}</div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="app-card">
          <div className="app-card-header">
            <div className="win-card-icon">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
              </svg>
            </div>
            <h3 className="win-card-title">Load Average</h3>
          </div>
          <div className="app-card-body">
            <div className="win-load-row">
              <div className="win-load-item">
                <span className="win-load-label">1m</span>
                <span className="win-load-value">{loadOne.toFixed(2)}</span>
              </div>
              <div className="win-load-item">
                <span className="win-load-label">5m</span>
                <span className="win-load-value">{loadFive.toFixed(2)}</span>
              </div>
              <div className="win-load-item">
                <span className="win-load-label">15m</span>
                <span className="win-load-value">{loadFifteen.toFixed(2)}</span>
              </div>
            </div>
            <div className="win-uptime">
              <span>Uptime:</span>
              <span>{status.system?.uptimeFormatted || 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="win-grid-2">
        <div className="app-card">
          <div className="app-card-header">
            <div className="win-card-icon">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M20 6H12L10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-6 10H6v-2h8v2zm4-4H6v-2h12v2z"/>
              </svg>
            </div>
            <h3 className="win-card-title">Disk I/O</h3>
          </div>
          <div className="app-card-body">
            <div className="win-io-row">
              <div className="win-io-item">
                <div className="win-io-label">Read</div>
                <div className="win-io-value">{(extraData.diskIO?.readRate || 0).toFixed(2)} ops/s</div>
              </div>
              <div className="win-io-item">
                <div className="win-io-label">Write</div>
                <div className="win-io-value">{(extraData.diskIO?.writeRate || 0).toFixed(2)} ops/s</div>
              </div>
            </div>
          </div>
        </div>

        <div className="app-card">
          <div className="app-card-header">
            <div className="win-card-icon">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z"/>
              </svg>
            </div>
            <h3 className="win-card-title">Network Connections</h3>
          </div>
          <div className="app-card-body">
            <div className="win-conn-row">
              <div className="win-conn-item">
                <div className="win-conn-label">Total</div>
                <div className="win-conn-value">{extraData.netConn?.total || 0}</div>
              </div>
              <div className="win-conn-item">
                <div className="win-conn-label">Established</div>
                <div className="win-conn-value">{extraData.netConn?.established || 0}</div>
              </div>
              <div className="win-conn-item">
                <div className="win-conn-label">Listen</div>
                <div className="win-conn-value">{extraData.netConn?.listen || 0}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="app-card win-chart-card">
        <div className="app-card-header">
          <div className="win-card-icon">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z"/>
            </svg>
          </div>
          <h3 className="win-card-title">CPU & Memory Trend</h3>
        </div>
        <div className="app-card-body">
          {chartData.length > 0 && (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorCpuWin" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0078d4" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0078d4" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorMemoryWin" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#107c10" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#107c10" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="time" stroke="#666" style={{ fontSize: '11px' }} />
                <YAxis stroke="#666" style={{ fontSize: '11px' }} />
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e0e0e0', fontSize: '12px' }} />
                <Legend />
                <Area type="monotone" dataKey="cpu" stroke="#0078d4" fillOpacity={1} fill="url(#colorCpuWin)" name="CPU %" />
                <Area type="monotone" dataKey="memory" stroke="#107c10" fillOpacity={1} fill="url(#colorMemoryWin)" name="Memory %" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  )
}
