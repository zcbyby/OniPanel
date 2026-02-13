import { useState, useEffect } from 'react'
import { apiCallJSON } from '../utils/api'
import './DiskTab.css'

export default function DiskTab() {
  const [diskInfo, setDiskInfo] = useState(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const fetchDiskInfo = async () => {
      try {
        const data = await apiCallJSON('/api/disk')
        setDiskInfo(data)
        setReady(true)
      } catch (error) {
        console.error('Failed to fetch disk info:', error)
      }
    }
    fetchDiskInfo()
    const interval = setInterval(fetchDiskInfo, 5000)
    return () => clearInterval(interval)
  }, [])

  const formatBytes = (bytes) => {
    if (!bytes || bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  if (!ready || !diskInfo) {
    return <div className="win-loading">Loading...</div>
  }

  return (
    <div className="win-disk">
      <div className="win-grid-3">
        {(diskInfo.disks || []).map((disk, idx) => {
          const size = disk.size || 1
          const used = disk.used || 0
          const usagePercent = (used / size) * 100
          const statusColor = usagePercent > 90 ? '#d13438' : usagePercent > 70 ? '#ffc107' : '#107c10'

          return (
            <div key={idx} className="app-card">
              <div className="app-card-header">
                <div className="win-card-icon">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                    <path d="M20 6H12L10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-6 10H6v-2h8v2zm4-4H6v-2h12v2z"/>
                  </svg>
                </div>
                <h3 className="win-card-title">{disk.mount || 'Unknown'}</h3>
              </div>
              <div className="app-card-body">
                <div className="win-disk-fs">{disk.fs || 'N/A'}</div>
                
                <div className="win-metric">
                  <div className="win-metric-header">
                    <span>Used</span>
                    <span className="win-metric-value">{formatBytes(used)} / {formatBytes(size)}</span>
                  </div>
                  <div className="win-progress">
                    <div 
                      className="win-progress-bar" 
                      style={{
                        width: `${usagePercent}%`,
                        backgroundColor: statusColor
                      }}
                    ></div>
                  </div>
                  <div className="win-usage-text">
                    {usagePercent.toFixed(1)}% used - {formatBytes(disk.available)} free
                  </div>
                </div>

                <div className="win-disk-details">
                  <div className="win-detail-row">
                    <span className="win-detail-label">Type</span>
                    <span className="win-detail-value">{disk.type || 'N/A'}</span>
                  </div>
                  <div className="win-detail-row">
                    <span className="win-detail-label">Read/Write</span>
                    <span className="win-detail-value" style={{ color: disk.rw ? '#107c10' : '#999' }}>
                      {disk.rw ? 'Read/Write' : 'Read-only'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {(diskInfo.disks || []).length === 0 && (
        <div className="win-empty">
          <p>No disk information found</p>
        </div>
      )}
    </div>
  )
}
