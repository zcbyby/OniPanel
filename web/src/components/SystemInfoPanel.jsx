import {
  FluentProvider,
  webLightTheme,
  Card,
  Text,
  Caption1,
} from '@fluentui/react-components'
import {
  Desktop24Regular,
  Server24Regular,
  Memory16Regular,
} from '@fluentui/react-icons'

export default function SystemInfoPanel({ systemInfo }) {
  if (!systemInfo) return null

  const formatBytes = (bytes) => {
    if (!bytes || bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  const infoItems = [
    { label: 'OS', value: systemInfo.os?.distro || systemInfo.os?.platform || 'N/A', icon: Desktop24Regular },
    { label: 'Kernel', value: systemInfo.os?.kernel || 'N/A', icon: null },
    { label: 'CPU', value: (systemInfo.cpu?.brand || 'N/A').substring(0, 40), icon: Server24Regular },
    { label: 'Cores', value: `${systemInfo.cpu?.cores || 0} / ${systemInfo.cpu?.physicalCores || 0}`, icon: null },
    { label: 'Freq', value: `${(systemInfo.cpu?.currentSpeed || 0).toFixed(2)} GHz`, icon: null },
    { label: 'Memory', value: formatBytes(systemInfo.memory?.total), icon: Memory16Regular },
    { label: 'Arch', value: systemInfo.os?.arch || 'N/A', icon: null },
    { label: 'Host', value: systemInfo.os?.hostname || 'N/A', icon: null },
  ]

  return (
    <FluentProvider theme={webLightTheme}>
      <Card style={{ 
        padding: 16, 
        marginBottom: 16, 
        borderRadius: 8,
        boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
        background: 'linear-gradient(135deg, #0078d4 0%, #005a9e 100%)'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {infoItems.map((item, idx) => {
            const Icon = item.icon
            return (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {Icon && <Icon style={{ color: 'rgba(255,255,255,0.7)', fontSize: 16 }} />}
                <div>
                  <Caption1 style={{ color: 'rgba(255,255,255,0.7)', display: 'block', marginBottom: 2 }}>{item.label}</Caption1>
                  <Text style={{ fontSize: 13, fontWeight: 500, display: 'block', color: 'white' }}>{item.value}</Text>
                </div>
              </div>
            )
          })}
        </div>
      </Card>
    </FluentProvider>
  )
}
