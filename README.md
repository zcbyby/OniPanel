# OKPanel - 服务器状态监控面板

一个基于 Node.js + React + Windows UI 的实时 Linux 服务器监控仪表板。采用 Windows 11 风格的原生 UI 设计，可实时展示 Linux 服务器的各种运行信息。

## 功能特性

### 🎨 Windows 11 原生设计
- 采用 Windows 11 配色方案（Fluent Design 风格）
- 原生 HTML 组件 + windows-ui-fabric CSS 框架
- 轻量级，无重型 UI 组件库依赖
- 响应式设计，适配各种屏幕尺寸

### 📊 总览标签页
- **系统信息** - 显示 OS、内核版本、处理器、核心数、内存等基本信息
- **CPU 监控** - 实时 CPU 使用率、分核心使用率展示
- **内存监控** - 内存使用情况图表化展示
- **进程统计** - 运行中、休眠进程数统计
- **趋势图表** - CPU 和内存使用趋势（面积图）

### ⚙️ 进程标签页
- **进程列表** - 显示详细的进程信息（PID、名称、CPU、内存、用户）
- **搜索功能** - 支持按进程名称或 PID 搜索
- **排序功能** - 支持按 CPU、内存等指标排序
- **实时更新** - 每 3 秒更新一次进程列表

### 💾 存储标签页
- **磁盘信息** - 显示各磁盘的挂载点、容量、使用情况
- **使用率进度条** - 直观展示每个磁盘的使用百分比
- **状态提示** - 红、黄、绿三色提示使用状态

### 🌐 网络标签页
- **网络流量图表** - 实时显示网络发送和接收流量
- **接口统计** - 各网络接口的流量统计
- **接口详情** - 显示 IP 地址、MAC 地址、网掩码等网络信息

## 项目结构

```
okpanel/
├── server/                          # Node.js Express 后端
│   └── index.js                    # 服务器和 API 路由（7个端点）
├── web/                             # React 前端应用
│   ├── src/
│   │   ├── components/             # React 组件库
│   │   │   ├── Header.jsx          # 顶部标题栏
│   │   │   ├── OverviewTab.jsx     # 概览标签页
│   │   │   ├── ProcessesTab.jsx    # 进程管理标签页
│   │   │   ├── DiskTab.jsx         # 存储状态标签页
│   │   │   ├── NetworkTab.jsx      # 网络信息标签页
│   │   │   ├── SystemInfoPanel.jsx # 系统信息面板
│   │   │   └── *.css               # 组件样式
│   │   ├── App.jsx                 # 主应用入口
│   │   ├── main.jsx                # React 入口
│   │   └── index.css               # 全局样式
│   ├── index.html
│   └── dist/                        # 生产构建输出
├── vite.config.js                  # Vite 构建配置
├── package.json                    # 统一的项目配置
├── .gitignore
└── README.md
```

## 安装和运行

### 前提条件
- Node.js >= 14.0
- npm 或 yarn

### 步骤

1. **进入项目目录并安装依赖**
```bash
cd okpanel
npm install
```

2. **开发模式**

同时运行后端服务器和前端开发服务器：

```bash
npm run dev
```

这会自动启动：
- 后端服务器运行在 `http://localhost:3000`
- 前端开发服务器运行在 `http://localhost:5173`

3. **生产模式**

构建并运行：

```bash
npm run build
npm start
```

访问 `http://localhost:3000` 查看应用

## 可用的 npm Scripts

- `npm run dev` - 同时启动后端和前端开发服务器
- `npm run dev:server` - 仅启动后端开发服务器
- `npm run dev:web` - 仅启动前端开发服务器
- `npm run build` - 构建前端（生产模式）
- `npm run preview` - 预览生产构建
- `npm start` - 启动生产服务器

## API 端点

后端提供以下 RESTful API 端点：

| 端点 | 方法 | 描述 |
|------|------|------|
| `/api/health` | GET | 健康检查 |
| `/api/system-info` | GET | 系统基本信息 |
| `/api/cpu-load` | GET | CPU 使用率详情 |
| `/api/system-status` | GET | 综合系统状态 |
| `/api/disk` | GET | 磁盘信息 |
| `/api/network` | GET | 网络信息 |
| `/api/processes` | GET | 进程列表 |

## 技术栈

### 后端
- **Express.js** ^4.18.2 - Web 框架
- **systeminformation** ^5.16.10 - 系统信息收集库
- **cors** ^2.8.5 - 跨域资源共享
- **nodemon** ^3.0.2 - 开发热重载

### 前端
- **React** ^18.2.0 - 用户界面框架
- **React DOM** ^18.2.0 - React 真实 DOM 渲染
- **Vite** ^5.0.8 - 快速构建工具和开发服务器
- **windows-ui-fabric** - Windows 11 原生 UI 样式框架
- **Recharts** ^2.10.3 - 响应式图表库
- **Express Static** - 前端生产构建服务

## 浏览器兼容性

- Chrome >= 90
- Firefox >= 88
- Safari >= 14
- Edge >= 90

## 特性亮点

### 🏗️ 架构设计
- **全栈一体化** - 后端 + 前端统一 package.json 配置
- **开发友好** - Vite 热模块替换 (HMR)，无刷新开发体验
- **无数据库** - 完全基于 Linux 系统调用，无需额外依赖
- **轻量级** - 移除 Fluent UI 重型组件库，采用原生 HTML + CSS
- **实时更新** - WebAPI 轮询机制，自动刷新系统指标

### 🎯 用户体验
- Windows 11 风格的熟悉界面
- 直观的进度条和指标显示
- 可交互的数据表和排序功能
- 平滑的动画和过渡效果
- 自适应的响应式设计

## 性能说明

- **构建大小** - 生产构建 ~555 KB (gzip 压缩后 ~157 KB)
- **构建时间** - 约 3-4 秒
- **CPU 监控** - 实时更新，每 2-3 秒刷新
- **内存监控** - 实时更新，每 2-3 秒刷新
- **进程列表** - 每 3 秒刷新，显示前 100 个进程（按内存排序）
- **磁盘监控** - 每 5 秒刷新
- **网络监控** - 每 3 秒刷新，流量趋势保持最近 20 条记录

## 故障排除

### npm install 失败
由于本项目已移除 @fluentui/react-components 重型依赖，安装应该很流畅。如遇问题：

```bash
# 清理并重新安装
rm -rf node_modules package-lock.json
npm install
```

### 端口被占用
如果默认端口 3000 被占用，可以设置环境变量：
```bash
PORT=8080 npm start
```

### API 连接失败
确保后端正常运行。在开发模式下使用 `npm run dev`，Vite 会自动代理 `/api` 路由到后端。

检查 vite.config.js 中的代理配置：
```javascript
server: {
  proxy: {
    '/api': 'http://localhost:3000'
  }
}
```

### 权限问题
某些系统信息需要足够的权限才能访问，如需获取完整信息，可能需要以 root 权限运行：
```bash
sudo npm start
```

## 部署

### 本地部署

#### 生产模式
1. 构建前端：
```bash
npm run build
```

2. 启动服务器：
```bash
npm start
```

3. 访问应用：
打开浏览器访问 `http://localhost:3000`

### Docker 部署

创建 `Dockerfile`：

```dockerfile
FROM node:18-alpine

WORKDIR /app

# 复制依赖配置
COPY package.json package-lock.json ./

# 安装依赖
RUN npm ci

# 复制源代码
COPY server/ ./server/
COPY web/ ./web/
COPY vite.config.js .

# 建立生产构建
RUN npm run build

# 暴露端口
EXPOSE 3000

# 启动应用
CMD ["npm", "start"]
```

#### 构建 Docker 镜像
```bash
docker build -t okpanel:latest .
```

#### 运行容器
```bash
docker run -d -p 3000:3000 --name okpanel okpanel:latest
```

#### 查看日志
```bash
docker logs okpanel
```

### 云部署（示例：Heroku/Railway）

1. 提交代码到 Git 仓库
2. 连接仓库到部署平台
3. 设置环境变量（如需要）
4. 部署会自动执行 `npm install` 和 `npm start`

## 许可证

MIT

## 更新日志

### v1.1.0 (2026-02-13)
- 🎨 完全迁移到 Windows UI 设计（移除 Fluent UI）
- ⚡ 优化构建大小：598 KB → 555 KB
- 🚀 加快构建速度：6.5s → 3.1s
- 🧹 移除所有重型 UI 组件库依赖
- 📱 改进响应式设计

### v1.0.0 (2026-02-01)
- ✅ 初始版本发布
- 📊 完整的系统监控功能
- 🎯 5 个主要标签页
- 📈 实时图表和统计

## 常见问题 (FAQ)

**Q: 为什么从 Fluent UI 迁移到 windows-ui-fabric？**
A: 为了降低依赖复杂性和构建大小，采用轻量级 CSS 框架而非重型组件库。

**Q: 支持实时通知吗？**
A: 当前采用定时轮询机制（2-5秒），暂不支持 WebSocket。

**Q: 可以在其他 Linux 发行版上运行吗？**
A: 是的，兼容所有 Linux 发行版。systeminformation 库自动适配。

**Q: 能在 Windows 上运行后端吗？**
A: 可以在 WSL2 或 Git Bash 上运行，但某些系统信息可能不准确。

## 贡献

欢迎提交 Issue 和 Pull Request！

请确保：
- 代码遵循项目风格
- 添加必要的测试
- 更新相关文档
