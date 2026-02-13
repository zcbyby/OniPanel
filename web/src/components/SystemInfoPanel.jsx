import './SystemInfoPanel.css'

export default function SystemInfoPanel({ systemInfo }) {
  if (!systemInfo) return null

  const formatBytes = (bytes) => {
    if (!bytes || bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <div className="win-system-info">
      <div className="app-card">
        <div className="app-card-header">
          <div className="win-card-icon">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M20 18c1.1 0 1.99-.9 1.99-2L22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2H0v2h24v-2h-4zM4 6h16v10H4V6z"/>
            </svg>
          </div>
          <h3 className="win-card-title">System Information</h3>
        </div>
        <div className="app-card-body">
          <div className="win-info-grid">
            <div className="win-info-row">
              <span className="win-info-label">OS</span>
              <span className="win-info-value">{systemInfo.os?.distro || systemInfo.os?.platform || 'N/A'}</span>
            </div>
            <div className="win-info-row">
              <span className="win-info-label">Kernel</span>
              <span className="win-info-value">{systemInfo.os?.kernel || 'N/A'}</span>
            </div>
            <div className="win-info-row">
              <span className="win-info-label">CPU</span>
              <span className="win-info-value">{systemInfo.cpu?.brand || 'N/A'}</span>
            </div>
            <div className="win-info-row">
              <span className="win-info-label">Cores</span>
              <span className="win-info-value">{systemInfo.cpu?.cores || 0} / {systemInfo.cpu?.physicalCores || 0} Physical</span>
            </div>
            <div className="win-info-row">
              <span className="win-info-label">Speed</span>
              <span className="win-info-value">{(systemInfo.cpu?.speed || 0).toFixed(2)} GHz</span>
            </div>
            <div className="win-info-row">
              <span className="win-info-label">Memory</span>
              <span className="win-info-value">{formatBytes(systemInfo.memory?.total)}</span>
            </div>
            <div className="win-info-row">
              <span className="win-info-label">Arch</span>
              <span className="win-info-value">{systemInfo.os?.arch || 'N/A'}</span>
            </div>
            <div className="win-info-row">
              <span className="win-info-label">Version</span>
              <span className="win-info-value">{systemInfo.os?.release || 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
