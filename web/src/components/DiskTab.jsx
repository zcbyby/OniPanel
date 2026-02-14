import { useState, useEffect } from 'react'
import {
  FluentProvider,
  webLightTheme,
  Card,
  Text,
  ProgressBar,
  Body2,
  Caption1,
} from '@fluentui/react-components'
import { Storage24Regular, LockClosed16Regular, LockOpen16Regular } from '@fluentui/react-icons'
import { apiCallJSON } from '../utils/api'

const ACCENT = '#0078d4'
const GRAY = '#666666'
const LIGHT_GRAY = '#f3f3f3'
const BORDER = '#e5e5e5'

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
    return (
      <FluentProvider theme={webLightTheme}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
          <Text>Loading...</Text>
        </div>
      </FluentProvider>
    )
  }

  return (
    <FluentProvider theme={webLightTheme}>
      <Card style={{ padding: 20, marginBottom: 16, borderRadius: 8, border: `1px solid ${BORDER}`, background: 'white' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{ 
            width: 40, 
            height: 40, 
            borderRadius: 8, 
            background: LIGHT_GRAY,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Storage24Regular style={{ color: GRAY, fontSize: 20 }} />
          </div>
          <div>
            <Text style={{ fontWeight: 600, fontSize: 16, display: 'block', color: '#1a1a1a' }}>Storage Drives</Text>
            <Caption1 style={{ color: GRAY }}>{diskInfo.disks?.length || 0} drives</Caption1>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
          {(diskInfo.disks || []).map((disk, idx) => {
            const size = disk.size || 1
            const used = disk.used || 0
            const usagePercent = (used / size) * 100
            const statusColor = usagePercent > 90 ? '#c42b1c' : usagePercent > 70 ? '#ca5010' : ACCENT

            return (
              <Card key={idx} style={{ 
                padding: 20, 
                borderRadius: 8, 
                border: `1px solid ${BORDER}`,
                background: 'white',
                boxShadow: 'none'
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 16 }}>
                  <div style={{ 
                    width: 44, 
                    height: 44, 
                    borderRadius: 8, 
                    background: LIGHT_GRAY,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <Storage24Regular style={{ color: GRAY, fontSize: 22 }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <Text style={{ fontWeight: 600, display: 'block', fontSize: 15, color: '#1a1a1a' }}>{disk.mount || 'Unknown'}</Text>
                    <Caption1 style={{ color: GRAY }}>{disk.fs || 'N/A'} - {disk.type || 'N/A'}</Caption1>
                  </div>
                  <div style={{ 
                    padding: '4px 8px', 
                    borderRadius: 4, 
                    background: disk.rw ? LIGHT_GRAY : LIGHT_GRAY,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4
                  }}>
                    {disk.rw ? (
                      <LockOpen16Regular style={{ fontSize: 12, color: '#107c10' }} />
                    ) : (
                      <LockClosed16Regular style={{ fontSize: 12, color: GRAY }} />
                    )}
                    <Caption1 style={{ color: disk.rw ? '#107c10' : GRAY, fontSize: 11 }}>
                      {disk.rw ? 'RW' : 'RO'}
                    </Caption1>
                  </div>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Caption1 style={{ color: GRAY }}>{formatBytes(used)} used</Caption1>
                    <Body2 style={{ fontWeight: 600, color: '#1a1a1a' }}>{usagePercent.toFixed(1)}%</Body2>
                  </div>
                  <ProgressBar value={Math.min(usagePercent, 100) / 100} color={statusColor} style={{ height: 8 }} />
                </div>

                <div style={{ 
                  padding: 12, 
                  background: LIGHT_GRAY, 
                  borderRadius: 6,
                  display: 'flex',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <Caption1 style={{ color: GRAY, display: 'block', marginBottom: 4 }}>Available</Caption1>
                    <Body2 style={{ fontWeight: 500, color: '#1a1a1a' }}>{formatBytes(disk.available)}</Body2>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <Caption1 style={{ color: GRAY, display: 'block', marginBottom: 4 }}>Total</Caption1>
                    <Body2 style={{ fontWeight: 500, color: '#1a1a1a' }}>{formatBytes(size)}</Body2>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>

        {(diskInfo.disks || []).length === 0 && (
          <Text>No disk information found</Text>
        )}
      </Card>
    </FluentProvider>
  )
}
