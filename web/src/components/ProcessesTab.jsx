import { useState, useEffect } from 'react'
import { apiCallJSON } from '../utils/api'
import './ProcessesTab.css'

export default function ProcessesTab() {
  const [processes, setProcesses] = useState([])
  const [filteredProcesses, setFilteredProcesses] = useState([])
  const [searchText, setSearchText] = useState('')
  const [sortBy, setSortBy] = useState('mem')
  const [sortOrder, setSortOrder] = useState('desc')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const fetchProcesses = async () => {
      try {
        const data = await apiCallJSON('/api/processes')
        setProcesses(data.processes || [])
        setReady(true)
      } catch (error) {
        console.error('Failed to fetch processes:', error)
      }
    }
    fetchProcesses()
    const interval = setInterval(fetchProcesses, 1567)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    let filtered = (processes || []).filter(p =>
      (p.name || '').toLowerCase().includes(searchText.toLowerCase()) ||
      String(p.pid || '').includes(searchText)
    )

    filtered.sort((a, b) => {
      let aVal = a[sortBy] || 0
      let bVal = b[sortBy] || 0
      return sortOrder === 'desc' ? bVal - aVal : aVal - bVal
    })

    setFilteredProcesses(filtered)
  }, [processes, searchText, sortBy, sortOrder])

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')
    } else {
      setSortBy(column)
      setSortOrder('desc')
    }
  }

  const formatMemory = (bytes) => {
    if (!bytes || bytes < 1024) return (bytes || 0) + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    if (bytes < 1024 * 1024 * 1024) return (bytes / 1024 / 1024).toFixed(1) + ' MB'
    return (bytes / 1024 / 1024 / 1024).toFixed(2) + ' GB'
  }

  const SortIndicator = ({ column }) => {
    if (sortBy !== column) return null
    return <span className="win-sort-indicator">{sortOrder === 'desc' ? ' ▼' : ' ▲'}</span>
  }

  if (!ready) {
    return <div className="win-loading">Loading...</div>
  }

  return (
    <div className="win-processes">
      <div className="app-card">
        <div className="app-card-header">
          <div className="win-card-icon">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/>
            </svg>
          </div>
          <h3 className="win-card-title">Processes ({filteredProcesses.length})</h3>
        </div>

        <div className="win-toolbar">
          <input
            type="search"
            placeholder="Search by name or PID..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="app-input-text"
            style={{ padding: '8px 12px' }}
          />
        </div>

        <div className="win-table-wrapper">
          <table className="win-table">
            <thead>
              <tr>
                <th style={{ width: '80px' }}>
                  <button className="win-sort-btn" onClick={() => handleSort('pid')}>
                    PID <SortIndicator column="pid" />
                  </button>
                </th>
                <th style={{ flex: 1 }}>
                  <button className="win-sort-btn" onClick={() => handleSort('name')}>
                    Name <SortIndicator column="name" />
                  </button>
                </th>
                <th style={{ width: '100px' }}>
                  <button className="win-sort-btn" onClick={() => handleSort('cpu')}>
                    CPU % <SortIndicator column="cpu" />
                  </button>
                </th>
                <th style={{ width: '100px' }}>
                  <button className="win-sort-btn" onClick={() => handleSort('mem')}>
                    Memory <SortIndicator column="mem" />
                  </button>
                </th>
                <th style={{ width: '100px' }}>
                  <button className="win-sort-btn" onClick={() => handleSort('user')}>
                    User <SortIndicator column="user" />
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredProcesses.map((process) => (
                <tr key={process.pid} className="win-tr">
                  <td className="win-td pid">{process.pid}</td>
                  <td className="win-td name">{process.name || 'Unknown'}</td>
                  <td className="win-td">
                    <div className="win-metric-bar">
                      <div
                        className="win-metric-fill"
                        style={{
                          width: `${Math.min(process.cpu || 0, 100)}%`,
                          backgroundColor: (process.cpu || 0) > 80 ? '#d13438' : '#0078d4'
                        }}
                      ></div>
                    </div>
                    <span className="win-metric-text">{((process.cpu || 0)).toFixed(1)}%</span>
                  </td>
                  <td className="win-td mem">{formatMemory(process.mem)}</td>
                  <td className="win-td user">{process.user || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredProcesses.length === 0 && (
          <div className="win-empty">
            <p>No processes found</p>
          </div>
        )}
      </div>
    </div>
  )
}
