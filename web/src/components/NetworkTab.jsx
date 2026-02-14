import { useState, useEffect } from 'react'
import {
  FluentProvider,
  webLightTheme,
  Card,
  Text,
  Button,
  Body2,
  Caption1,
} from '@fluentui/react-components'
import {
  ArrowTrendingLines24Regular,
  Globe24Regular,
  ArrowDown24Regular,
  ArrowUp24Regular,
  PlugConnected24Regular,
  PlugDisconnected24Regular,
} from '@fluentui/react-icons'
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

const ACCENT = '#0078d4'
const GRAY = '#666666'
const LIGHT_GRAY = '#f3f3f3'
const BORDER = '#e5e5e5'

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
    const interval = setInterval(fetchNetworkInfo, 1567)
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
    return (
      <FluentProvider theme={webLightTheme}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
          <Text>Loading...</Text>
        </div>
      </FluentProvider>
    )
  }

  const TabButton = ({ id, label, icon: Icon, active, onClick }) => (
    <Button
      appearance={active ? 'primary' : 'subtle'}
      onClick={onClick}
      style={{ borderRadius: 6 }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <Icon style={{ fontSize: 16 }} />
        {label}
      </div>
    </Button>
  )

  return (
    <FluentProvider theme={webLightTheme}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <TabButton 
          id="stats" 
          label="Statistics" 
          icon={ArrowTrendingLines24Regular}
          active={selectedTab === 'stats'} 
          onClick={() => setSelectedTab('stats')} 
        />
        <TabButton 
          id="interfaces" 
          label="Interfaces" 
          icon={Globe24Regular}
          active={selectedTab === 'interfaces'} 
          onClick={() => setSelectedTab('interfaces')} 
        />
      </div>

      {selectedTab === 'stats' && (
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
              <ArrowTrendingLines24Regular style={{ color: GRAY, fontSize: 20 }} />
            </div>
            <Text style={{ fontWeight: 600, fontSize: 16, color: '#1a1a1a' }}>Network Traffic</Text>
          </div>

          {networkHistory.length > 1 && (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={networkHistory} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="time" stroke="#666" style={{ fontSize: '11px' }} />
                <YAxis stroke="#666" style={{ fontSize: '11px' }} tickFormatter={(v) => formatBytes(v)} />
                <Tooltip formatter={(value) => formatBytes(value)} contentStyle={{ backgroundColor: '#fff', border: '1px solid #e0e0e0', fontSize: '12px' }} />
                <Legend />
                <Line type="monotone" dataKey="rx" stroke={ACCENT} dot={false} name="Download" strokeWidth={2} />
                <Line type="monotone" dataKey="tx" stroke="#107c10" dot={false} name="Upload" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Card>
      )}

      {selectedTab === 'stats' && (
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
              <Globe24Regular style={{ color: GRAY, fontSize: 20 }} />
            </div>
            <Text style={{ fontWeight: 600, fontSize: 16, color: '#1a1a1a' }}>Interface Summary</Text>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
            {(networkInfo.interfaces || []).map((net, idx) => (
              <div key={idx} style={{ 
                padding: 16, 
                background: LIGHT_GRAY, 
                borderRadius: 8,
                border: `1px solid ${BORDER}`
              }}>
                <Text style={{ fontWeight: 600, display: 'block', marginBottom: 12, color: '#1a1a1a' }}>{net.iface || 'Unknown'}</Text>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <ArrowDown24Regular style={{ color: ACCENT, fontSize: 14 }} />
                    <div>
                      <Caption1 style={{ color: GRAY, display: 'block', fontSize: 10 }}>Download</Caption1>
                      <Body2 style={{ fontWeight: 600, color: ACCENT }}>{formatBytes(net.rx_bytes)}</Body2>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <ArrowUp24Regular style={{ color: '#107c10', fontSize: 14 }} />
                    <div>
                      <Caption1 style={{ color: GRAY, display: 'block', fontSize: 10 }}>Upload</Caption1>
                      <Body2 style={{ fontWeight: 600, color: '#107c10' }}>{formatBytes(net.tx_bytes)}</Body2>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {selectedTab === 'interfaces' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          {(networkInfo.physicalInterfaces || []).map((iface, idx) => (
            <Card key={idx} style={{ 
              padding: 20, 
              borderRadius: 8, 
              border: `1px solid ${BORDER}`,
              background: 'white'
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 16 }}>
                <div style={{ 
                  width: 44, 
                  height: 44, 
                  borderRadius: 8, 
                  background: iface.operstate === 'up' ? LIGHT_GRAY : LIGHT_GRAY,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {iface.operstate === 'up' ? (
                    <PlugConnected24Regular style={{ color: '#107c10', fontSize: 22 }} />
                  ) : (
                    <PlugDisconnected24Regular style={{ color: GRAY, fontSize: 22 }} />
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <Text style={{ fontWeight: 600, display: 'block', color: '#1a1a1a' }}>{iface.ifname || 'Unknown'}</Text>
                  <Caption1 style={{ color: iface.operstate === 'up' ? '#107c10' : GRAY }}>
                    {iface.operstate === 'up' ? 'Connected' : 'Disconnected'}
                  </Caption1>
                </div>
              </div>

              <div style={{ display: 'grid', gap: 10 }}>
                {iface.ip4 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: LIGHT_GRAY, borderRadius: 6 }}>
                    <Caption1 style={{ color: GRAY }}>IPv4</Caption1>
                    <Body2 style={{ fontFamily: 'monospace', fontSize: 12, color: '#1a1a1a' }}>{iface.ip4}</Body2>
                  </div>
                )}
                {iface.ip6 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: LIGHT_GRAY, borderRadius: 6 }}>
                    <Caption1 style={{ color: GRAY }}>IPv6</Caption1>
                    <Body2 style={{ fontFamily: 'monospace', fontSize: 10, color: '#1a1a1a' }}>{iface.ip6?.split(',')[0]}</Body2>
                  </div>
                )}
                {iface.mac && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: LIGHT_GRAY, borderRadius: 6 }}>
                    <Caption1 style={{ color: GRAY }}>MAC</Caption1>
                    <Body2 style={{ fontFamily: 'monospace', fontSize: 11, color: '#1a1a1a' }}>{iface.mac}</Body2>
                  </div>
                )}
                {iface.netmask && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: LIGHT_GRAY, borderRadius: 6 }}>
                    <Caption1 style={{ color: GRAY }}>Netmask</Caption1>
                    <Body2 style={{ color: '#1a1a1a' }}>{iface.netmask}</Body2>
                  </div>
                )}
                {iface.speed && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: LIGHT_GRAY, borderRadius: 6 }}>
                    <Caption1 style={{ color: GRAY }}>Speed</Caption1>
                    <Body2 style={{ color: '#1a1a1a' }}>{iface.speed} Mbps</Body2>
                  </div>
                )}
                {iface.type && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: LIGHT_GRAY, borderRadius: 6 }}>
                    <Caption1 style={{ color: GRAY }}>Type</Caption1>
                    <Body2 style={{ color: '#1a1a1a' }}>{iface.type}</Body2>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {selectedTab === 'interfaces' && (networkInfo.physicalInterfaces || []).length === 0 && (
        <Text>No network interfaces found</Text>
      )}
    </FluentProvider>
  )
}
