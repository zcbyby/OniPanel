import './SystemInfoPanel.css'

export default function SystemInfoPanel({ systemInfo }) {
  if (!systemInfo) return null

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <div className="system-info-panel">
      <div className="system-info-header">
        <span className="info-icon">🖥️</span>
        <h3>系统信息</h3>
      </div>
      <div className="system-info-body">
        <div className="system-info-grid">
          <div className="info-row">
            <span className="label">操作系统</span>
            <span className="value">{systemInfo.os.distro || systemInfo.os.platform}</span>
          </div>
          <div className="info-row">
            <span className="label">内核版本</span>
            <span className="value">{systemInfo.os.kernel}</span>
          </div>
          <div className="info-row">
            <span className="label">处理器</span>
            <span className="value">
              {systemInfo.cpu.brand}
            </span>
          </div>
          <div className="info-row">
            <span className="label">核心数</span>
            <span className="value">
              {systemInfo.cpu.cores} / {systemInfo.cpu.physicalCores} 物理核心
            </span>
          </div>
          <div className="info-row">
            <span className="label">CPU频率</span>
            <span className="value">{systemInfo.cpu.speed.toFixed(2)} GHz</span>
          </div>
          <div className="info-row">
            <span className="label">总内存</span>
            <span className="value">{formatBytes(systemInfo.memory.total)}</span>
          </div>
          <div className="info-row">
            <span className="label">架构</span>
            <span className="value">{systemInfo.os.arch}</span>
          </div>
          <div className="info-row">
            <span className="label">系统版本</span>
            <span className="value">{systemInfo.os.release}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
