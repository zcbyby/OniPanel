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
  AreaChart,
  Area,
} from 'recharts'
import SystemInfoPanel from './SystemInfoPanel'
import './OverviewTab.css'

export default function OverviewTab() {
  const [systemInfo, setSystemInfo] = useState(null)
  const [status, setStatus] = useState(null)
  const [chartData, setChartData] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [infoRes, statusRes] = await Promise.all([
          fetch('/api/system-info'),
          fetch('/api/system-status'),
        ])
        const infoData = await infoRes.json()
        const statusData = await statusRes.json()
        
        setSystemInfo(infoData)
        setStatus(statusData)

        setChartData(prev => {
          const newData = [
            ...prev,
            {
              time: new Date(statusData.timestamp).toLocaleTimeString(),
              memory: Number(statusData.memory.usagePercent.toFixed(2)),
              cpu: Number(statusData.cpu.load.toFixed(2)),
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

  if (!systemInfo || !status) {
    return <div className="loading">加载中...</div>
  }

  return (
    <div className="overview-container">
      <SystemInfoPanel systemInfo={systemInfo} />

      <div className="status-cards">
        {/* CPU 卡片 */}
        <div className="win-card">
          <div className="win-card-header">
            <span className="card-icon">⚡</span>
            <h3>CPU 使用率</h3>
          </div>
          <div className="win-card-content">
            <div className="metric">
              <div className="metric-label">
                <span>总体</span>
                <span className="metric-value">{status.cpu.load.toFixed(2)}%</span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{
                    width: `${status.cpu.load}%`,
                    backgroundColor: status.cpu.load > 80 ? '#d13438' : '#107c10'
                  }}
                ></div>
              </div>
            </div>
            <div className="cpu-cores">
              <h4>核心使用率：</h4>
              {status.cpu.loadPerCpu.map((load, idx) => (
                <div key={idx} className="core-item">
                  <div className="core-label">
                    <span>Core {idx}</span>
                    <span>{load.toFixed(2)}%</span>
                  </div>
                  <div className="progress-bar small">
                    <div 
                      className="progress-fill" 
                      style={{
                        width: `${load}%`,
                        backgroundColor: load > 80 ? '#ffc107' : '#0078d4'
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 内存卡片 */}
        <div className="win-card">
          <div className="win-card-header">
            <span className="card-icon">💾</span>
            <h3>内存使用</h3>
          </div>
          <div className="win-card-content">
            <div className="metric">
              <div className="metric-label">
                <span>已用内存</span>
                <span className="metric-value">
                  {(status.memory.used / 1024 / 1024 / 1024).toFixed(2)} GB / {(status.memory.total / 1024 / 1024 / 1024).toFixed(2)} GB
                </span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{
                    width: `${status.memory.usagePercent}%`,
                    backgroundColor: status.memory.usagePercent > 80 ? '#d13438' : '#107c10'
                  }}
                ></div>
              </div>
              <div className="usage-percent">
                {status.memory.usagePercent.toFixed(2)}% 使用率
              </div>
            </div>
          </div>
        </div>

        {/* 进程卡片 */}
        <div className="win-card">
          <div className="win-card-header">
            <span className="card-icon">✓</span>
            <h3>进程统计</h3>
          </div>
          <div className="win-card-content">
            <div className="process-stats">
              <div className="stat-item">
                <div className="stat-label">总数</div>
                <div className="stat-value">{status.processes.total}</div>
              </div>
              <div className="stat-item">
                <div className="stat-label">运行中</div>
                <div className="stat-value" style={{ color: '#107c10' }}>{status.processes.running}</div>
              </div>
              <div className="stat-item">
                <div className="stat-label">休眠</div>
                <div className="stat-value" style={{ color: '#0078d4' }}>{status.processes.sleeping}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 趋势图表 */}
      <div className="win-card chart-card">
        <div className="win-card-header">
          <span className="card-icon">📈</span>
          <h3>CPU &amp; 内存趋势</h3>
        </div>
        <div className="win-card-content">
          {chartData.length > 0 && (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0078d4" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0078d4" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorMemory" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#107c10" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#107c10" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="time" stroke="#666" style={{ fontSize: '12px' }} />
                <YAxis stroke="#666" style={{ fontSize: '12px' }} />
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e0e0e0' }} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="cpu"
                  stroke="#0078d4"
                  fillOpacity={1}
                  fill="url(#colorCpu)"
                  name="CPU 使用率 (%)"
                />
                <Area
                  type="monotone"
                  dataKey="memory"
                  stroke="#107c10"
                  fillOpacity={1}
                  fill="url(#colorMemory)"
                  name="内存使用率 (%)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  )
}
