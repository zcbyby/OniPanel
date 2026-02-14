import { useState, useEffect } from 'react'
import {
  FluentProvider,
  webLightTheme,
  Card,
  Text,
  ProgressBar,
  Body1,
  Body2,
  Caption1,
} from '@fluentui/react-components'
import {
  ArrowTrendingLines24Regular,
  Storage24Regular,
  Clock24Regular,
  Temperature24Regular,
  DataArea24Regular,
  Globe24Regular,
  People24Regular,
  DesktopSignal24Regular,
} from '@fluentui/react-icons'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import SystemInfoPanel from './SystemInfoPanel'
import { apiCallJSON } from '../utils/api'

const ACCENT = '#0078d4'
const GRAY = '#666666'
const LIGHT_GRAY = '#f3f3f3'
const BORDER = '#e5e5e5'

const MetricCard = ({ title, icon: Icon, children }) => {
  return (
    <Card style={{ 
      padding: 20, 
      marginBottom: 16,
      borderRadius: 8,
      border: `1px solid ${BORDER}`,
      background: 'white'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <div style={{ 
          width: 40, 
          height: 40, 
          borderRadius: 8, 
          background: LIGHT_GRAY,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Icon style={{ color: GRAY, fontSize: 20 }} />
        </div>
        <Text style={{ fontWeight: 600, fontSize: 16, color: '#1a1a1a' }}>{title}</Text>
      </div>
      {children}
    </Card>
  )
}

export default function OverviewTab() {
  const [systemInfo, setSystemInfo] = useState(null)
  const [status, setStatus] = useState(null)
  const [cpuInfo, setCpuInfo] = useState(null)
  const [chartData, setChartData] = useState([])
  const [extraData, setExtraData] = useState({ diskIO: { readRate: 0, writeRate: 0 }, netConn: { total: 0, established: 0, listen: 0 } })
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [infoData, statusData, cpuInfoData, diskIOData, netConnData] = await Promise.all([
          apiCallJSON('/api/system-info'),
          apiCallJSON('/api/system-status'),
          apiCallJSON('/api/cpu-info').catch(() => null),
          apiCallJSON('/api/disk-io').catch(() => ({ readRate: 0, writeRate: 0 })),
          apiCallJSON('/api/network-connections').catch(() => ({ total: 0, established: 0, listen: 0 })),
        ])
        
        setSystemInfo(infoData)
        setStatus(statusData)
        setCpuInfo(cpuInfoData)
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
          return newData.slice(-30)
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
    return (
      <FluentProvider theme={webLightTheme}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
          <Text>Loading...</Text>
        </div>
      </FluentProvider>
    )
  }

  const cpuLoad = status.cpu?.load || 0
  const memUsed = status.memory?.used || 0
  const memTotal = status.memory?.total || 1
  const memPercent = status.memory?.usagePercent || 0

  const getBarColor = (percent) => {
    if (percent > 80) return '#c42b1c'
    if (percent > 50) return '#ca5010'
    return ACCENT
  }

  return (
    <FluentProvider theme={webLightTheme}>
      <SystemInfoPanel systemInfo={systemInfo} />

      <MetricCard title="CPU" icon={DesktopSignal24Regular}>
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <Caption1 style={{ color: GRAY }}>Usage</Caption1>
            <Body2 style={{ fontWeight: 600, color: '#1a1a1a' }}>{cpuLoad.toFixed(1)}%</Body2>
          </div>
          <ProgressBar value={Math.min(cpuLoad, 100) / 100} color={getBarColor(cpuLoad)} style={{ height: 8 }} />
        </div>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {(status.cpu?.loadPerCpu || []).map((load, idx) => (
            <div key={idx} style={{ textAlign: 'center', minWidth: 28 }}>
              <div style={{ 
                width: 20, 
                height: 44, 
                background: LIGHT_GRAY, 
                borderRadius: 4, 
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{ 
                  position: 'absolute', 
                  bottom: 0, 
                  width: '100%', 
                  height: `${load}%`,
                  background: getBarColor(load),
                  borderRadius: 4,
                  transition: 'height 0.3s ease'
                }} />
              </div>
              <Caption1 style={{ fontSize: 10, display: 'block', marginTop: 4, color: GRAY }}>{idx}</Caption1>
            </div>
          ))}
        </div>
      </MetricCard>

      <MetricCard title="Memory" icon={Storage24Regular}>
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <Caption1 style={{ color: GRAY }}>Usage</Caption1>
            <Body2 style={{ fontWeight: 600, color: '#1a1a1a' }}>{memPercent.toFixed(1)}%</Body2>
          </div>
          <ProgressBar value={Math.min(memPercent, 100) / 100} color={getBarColor(memPercent)} style={{ height: 8 }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          <div>
            <Caption1 style={{ color: GRAY, display: 'block', marginBottom: 4 }}>Used</Caption1>
            <Body1 style={{ fontWeight: 600, color: '#1a1a1a' }}>{(memUsed / 1024 / 1024 / 1024).toFixed(2)} GB</Body1>
          </div>
          <div>
            <Caption1 style={{ color: GRAY, display: 'block', marginBottom: 4 }}>Total</Caption1>
            <Body1 style={{ fontWeight: 600, color: '#1a1a1a' }}>{(memTotal / 1024 / 1024 / 1024).toFixed(2)} GB</Body1>
          </div>
          <div>
            <Caption1 style={{ color: GRAY, display: 'block', marginBottom: 4 }}>Available</Caption1>
            <Body1 style={{ fontWeight: 600, color: '#1a1a1a' }}>{((status.memory?.available || 0) / 1024 / 1024 / 1024).toFixed(2)} GB</Body1>
          </div>
        </div>
      </MetricCard>

      <MetricCard title="Load Average" icon={ArrowTrendingLines24Regular}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          <div style={{ padding: 12, background: LIGHT_GRAY, borderRadius: 6, textAlign: 'center' }}>
            <Caption1 style={{ color: GRAY, display: 'block', marginBottom: 4 }}>1 min</Caption1>
            <Body1 style={{ fontWeight: 600, color: '#1a1a1a' }}>{(status.system?.loadAverage?.one || 0).toFixed(2)}</Body1>
          </div>
          <div style={{ padding: 12, background: LIGHT_GRAY, borderRadius: 6, textAlign: 'center' }}>
            <Caption1 style={{ color: GRAY, display: 'block', marginBottom: 4 }}>5 min</Caption1>
            <Body1 style={{ fontWeight: 600, color: '#1a1a1a' }}>{(status.system?.loadAverage?.five || 0).toFixed(2)}</Body1>
          </div>
          <div style={{ padding: 12, background: LIGHT_GRAY, borderRadius: 6, textAlign: 'center' }}>
            <Caption1 style={{ color: GRAY, display: 'block', marginBottom: 4 }}>15 min</Caption1>
            <Body1 style={{ fontWeight: 600, color: '#1a1a1a' }}>{(status.system?.loadAverage?.fifteen || 0).toFixed(2)}</Body1>
          </div>
          <div style={{ padding: 12, background: LIGHT_GRAY, borderRadius: 6, textAlign: 'center' }}>
            <Caption1 style={{ color: GRAY, display: 'block', marginBottom: 4 }}>Uptime</Caption1>
            <Body2 style={{ fontWeight: 600, fontSize: 12, color: '#1a1a1a' }}>{status.system?.uptimeFormatted || 'N/A'}</Body2>
          </div>
        </div>
      </MetricCard>

      <MetricCard title="Temperature" icon={Temperature24Regular}>
        {cpuInfo?.temps && (
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            {cpuInfo.temps.main > 0 && (
              <div style={{ 
                padding: 16, 
                background: LIGHT_GRAY, 
                borderRadius: 8, 
                textAlign: 'center',
                minWidth: 80
              }}>
                <Caption1 style={{ color: GRAY, display: 'block', marginBottom: 4 }}>CPU</Caption1>
                <Text style={{ 
                  fontSize: 28, 
                  fontWeight: 600,
                  color: cpuInfo.temps.main > 80 ? '#c42b1c' : cpuInfo.temps.main > 60 ? '#ca5010' : '#1a1a1a'
                }}>
                  {cpuInfo.temps.main.toFixed(1)}°C
                </Text>
              </div>
            )}
            {(cpuInfo.temps.cores || []).map((temp, idx) => (
              temp > 0 && (
                <div key={idx} style={{ 
                  padding: 16, 
                  background: LIGHT_GRAY, 
                  borderRadius: 8, 
                  textAlign: 'center',
                  minWidth: 80
                }}>
                  <Caption1 style={{ color: GRAY, display: 'block', marginBottom: 4 }}>Core {idx}</Caption1>
                  <Text style={{ 
                    fontSize: 28, 
                    fontWeight: 600,
                    color: temp > 80 ? '#c42b1c' : temp > 60 ? '#ca5010' : '#1a1a1a'
                  }}>
                    {temp.toFixed(1)}°C
                  </Text>
                </div>
              )
            ))}
          </div>
        )}
        {(!cpuInfo?.temps || (cpuInfo.temps.main === 0 && (cpuInfo.temps.cores || []).every(t => t === 0))) && (
          <Body2 style={{ color: GRAY }}>Temperature data not available</Body2>
        )}
      </MetricCard>

      <MetricCard title="Disk I/O" icon={DataArea24Regular}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
          <div style={{ padding: 16, background: LIGHT_GRAY, borderRadius: 8 }}>
            <Caption1 style={{ color: GRAY, display: 'block', marginBottom: 4 }}>Read</Caption1>
            <Body1 style={{ fontWeight: 600, fontSize: 20, color: '#1a1a1a' }}>
              {(extraData.diskIO?.readRate || 0).toFixed(0)}
              <Caption1 style={{ marginLeft: 4, color: GRAY }}>ops/s</Caption1>
            </Body1>
          </div>
          <div style={{ padding: 16, background: LIGHT_GRAY, borderRadius: 8 }}>
            <Caption1 style={{ color: GRAY, display: 'block', marginBottom: 4 }}>Write</Caption1>
            <Body1 style={{ fontWeight: 600, fontSize: 20, color: '#1a1a1a' }}>
              {(extraData.diskIO?.writeRate || 0).toFixed(0)}
              <Caption1 style={{ marginLeft: 4, color: GRAY }}>ops/s</Caption1>
            </Body1>
          </div>
        </div>
      </MetricCard>

      <MetricCard title="Network Connections" icon={Globe24Regular}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          <div style={{ padding: 16, background: LIGHT_GRAY, borderRadius: 8, textAlign: 'center' }}>
            <Caption1 style={{ color: GRAY, display: 'block', marginBottom: 4 }}>Total</Caption1>
            <Body1 style={{ fontWeight: 600, fontSize: 20, color: '#1a1a1a' }}>{extraData.netConn?.total || 0}</Body1>
          </div>
          <div style={{ padding: 16, background: LIGHT_GRAY, borderRadius: 8, textAlign: 'center' }}>
            <Caption1 style={{ color: GRAY, display: 'block', marginBottom: 4 }}>Established</Caption1>
            <Body1 style={{ fontWeight: 600, fontSize: 20, color: ACCENT }}>{extraData.netConn?.established || 0}</Body1>
          </div>
          <div style={{ padding: 16, background: LIGHT_GRAY, borderRadius: 8, textAlign: 'center' }}>
            <Caption1 style={{ color: GRAY, display: 'block', marginBottom: 4 }}>Listen</Caption1>
            <Body1 style={{ fontWeight: 600, fontSize: 20, color: ACCENT }}>{extraData.netConn?.listen || 0}</Body1>
          </div>
        </div>
      </MetricCard>

      <MetricCard title="Processes" icon={People24Regular}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          <div style={{ padding: 16, background: LIGHT_GRAY, borderRadius: 8, textAlign: 'center' }}>
            <Caption1 style={{ color: GRAY, display: 'block', marginBottom: 4 }}>Total</Caption1>
            <Body1 style={{ fontWeight: 600, fontSize: 20, color: '#1a1a1a' }}>{status.processes?.total || 0}</Body1>
          </div>
          <div style={{ padding: 16, background: LIGHT_GRAY, borderRadius: 8, textAlign: 'center' }}>
            <Caption1 style={{ color: GRAY, display: 'block', marginBottom: 4 }}>Running</Caption1>
            <Body1 style={{ fontWeight: 600, fontSize: 20, color: '#107c10' }}>{status.processes?.running || 0}</Body1>
          </div>
          <div style={{ padding: 16, background: LIGHT_GRAY, borderRadius: 8, textAlign: 'center' }}>
            <Caption1 style={{ color: GRAY, display: 'block', marginBottom: 4 }}>Sleeping</Caption1>
            <Body1 style={{ fontWeight: 600, fontSize: 20, color: ACCENT }}>{status.processes?.sleeping || 0}</Body1>
          </div>
          {(status.processes?.zombie || 0) > 0 && (
            <div style={{ padding: 16, background: LIGHT_GRAY, borderRadius: 8, textAlign: 'center' }}>
              <Caption1 style={{ color: GRAY, display: 'block', marginBottom: 4 }}>Zombie</Caption1>
              <Body1 style={{ fontWeight: 600, fontSize: 20, color: '#c42b1c' }}>{status.processes.zombie}</Body1>
            </div>
          )}
        </div>
      </MetricCard>

      <Card style={{ padding: 20, borderRadius: 8, border: `1px solid ${BORDER}`, background: 'white' }}>
        <Text style={{ fontWeight: 600, fontSize: 16, display: 'block', marginBottom: 16, color: '#1a1a1a' }}>CPU & Memory Trend</Text>
        {chartData.length > 0 && (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCpu11" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0078d4" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#0078d4" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorMemory11" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#107c10" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#107c10" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
              <XAxis dataKey="time" stroke="#666" style={{ fontSize: '10px' }} />
              <YAxis stroke="#666" style={{ fontSize: '10px' }} domain={[0, 100]} />
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e5e5', fontSize: '12px' }} />
              <Area type="monotone" dataKey="cpu" stroke="#0078d4" fillOpacity={1} fill="url(#colorCpu11)" name="CPU %" />
              <Area type="monotone" dataKey="memory" stroke="#107c10" fillOpacity={1} fill="url(#colorMemory11)" name="Memory %" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </Card>
    </FluentProvider>
  )
}
