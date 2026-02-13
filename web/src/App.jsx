import { useState } from 'react'
import OverviewTab from './components/OverviewTab'
import ProcessesTab from './components/ProcessesTab'
import DiskTab from './components/DiskTab'
import NetworkTab from './components/NetworkTab'
import Header from './components/Header'
import './App.css'

function App() {
  const [selectedTab, setSelectedTab] = useState('overview')

  const tabs = [
    { id: 'overview', label: '📊 总览' },
    { id: 'processes', label: '⚙️ 进程' },
    { id: 'disk', label: '💾 存储' },
    { id: 'network', label: '🌐 网络' },
  ]

  return (
    <div className="win-app">
      <Header />
      
      <div className="win-tab-container">
        <div className="win-tab-header">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`win-tab ${selectedTab === tab.id ? 'selected' : ''}`}
              onClick={() => setSelectedTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="win-content">
        {selectedTab === 'overview' && <OverviewTab />}
        {selectedTab === 'processes' && <ProcessesTab />}
        {selectedTab === 'disk' && <DiskTab />}
        {selectedTab === 'network' && <NetworkTab />}
      </div>
    </div>
  )
}

export default App
