import { useState, useEffect } from 'react'
import {
  FluentProvider,
  webLightTheme,
  Card,
  Text,
  Input,
  ProgressBar,
  Body2,
  Caption1,
} from '@fluentui/react-components'
import { Settings24Regular, Search24Regular } from '@fluentui/react-icons'
import { apiCallJSON } from '../utils/api'

const ACCENT = '#0078d4'
const GRAY = '#666666'
const LIGHT_GRAY = '#f3f3f3'
const BORDER = '#e5e5e5'

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
    return <span style={{ fontSize: 10, marginLeft: 4 }}>{sortOrder === 'desc' ? '↓' : '↑'}</span>
  }

  if (!ready) {
    return (
      <FluentProvider theme={webLightTheme}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
          <Text>Loading...</Text>
        </div>
      </FluentProvider>
    )
  }

  const HeaderButton = ({ column, children }) => (
    <button 
      onClick={() => handleSort(column)}
      style={{ 
        background: 'none', 
        border: 'none', 
        cursor: 'pointer', 
        fontWeight: 600,
        fontSize: 12,
        color: sortBy === column ? ACCENT : GRAY,
        fontFamily: 'inherit',
        padding: 0,
        display: 'flex',
        alignItems: 'center'
      }}
    >
      {children}
      <SortIndicator column={column} />
    </button>
  )

  return (
    <FluentProvider theme={webLightTheme}>
      <Card style={{ padding: 20, borderRadius: 8, border: `1px solid ${BORDER}`, background: 'white' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ 
              width: 40, 
              height: 40, 
              borderRadius: 8, 
              background: LIGHT_GRAY,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Settings24Regular style={{ color: GRAY, fontSize: 20 }} />
            </div>
            <div>
              <Text style={{ fontWeight: 600, fontSize: 16, display: 'block', color: '#1a1a1a' }}>Running Processes</Text>
              <Caption1 style={{ color: GRAY }}>{filteredProcesses.length} processes</Caption1>
            </div>
          </div>
          <div style={{ width: 280 }}>
            <Input
              type="search"
              placeholder="Search by name or PID..."
              value={searchText}
              onChange={(e, data) => setSearchText(data.value)}
              contentBefore={<Search24Regular style={{ color: GRAY }} />}
              style={{ width: '100%' }}
            />
          </div>
        </div>

        <div style={{ overflowX: 'auto', borderRadius: 8, border: `1px solid ${BORDER}` }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, background: 'white' }}>
            <thead>
              <tr style={{ background: LIGHT_GRAY }}>
                <th style={{ width: 80, textAlign: 'left', padding: '12px 12px', borderBottom: `1px solid ${BORDER}` }}>
                  <HeaderButton column="pid">PID</HeaderButton>
                </th>
                <th style={{ textAlign: 'left', padding: '12px 12px', borderBottom: `1px solid ${BORDER}` }}>
                  <HeaderButton column="name">Name</HeaderButton>
                </th>
                <th style={{ width: 140, textAlign: 'left', padding: '12px 12px', borderBottom: `1px solid ${BORDER}` }}>
                  <HeaderButton column="cpu">CPU %</HeaderButton>
                </th>
                <th style={{ width: 100, textAlign: 'left', padding: '12px 12px', borderBottom: `1px solid ${BORDER}` }}>
                  <HeaderButton column="mem">Memory</HeaderButton>
                </th>
                <th style={{ width: 120, textAlign: 'left', padding: '12px 12px', borderBottom: `1px solid ${BORDER}` }}>
                  <HeaderButton column="user">User</HeaderButton>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredProcesses.map((process) => (
                <tr key={process.pid} style={{ borderBottom: `1px solid ${BORDER}` }}>
                  <td style={{ padding: '10px 12px', fontFamily: 'monospace', fontSize: 12, color: '#1a1a1a' }}>{process.pid}</td>
                  <td style={{ padding: '10px 12px', fontWeight: 500, color: '#1a1a1a' }}>{process.name || 'Unknown'}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <ProgressBar 
                        value={Math.min(process.cpu || 0, 100) / 100}
                        color={(process.cpu || 0) > 80 ? '#c42b1c' : ACCENT} 
                        style={{ flex: 1, height: 6 }}
                      />
                      <span style={{ fontSize: 12, minWidth: 45, textAlign: 'right', fontFamily: 'monospace', color: '#1a1a1a' }}>
                        {((process.cpu || 0)).toFixed(1)}%
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '10px 12px', fontFamily: 'monospace', fontSize: 12, color: '#1a1a1a' }}>
                    {formatMemory(process.mem)}
                  </td>
                  <td style={{ padding: '10px 12px', fontSize: 12, color: GRAY }}>{process.user || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </FluentProvider>
  )
}
