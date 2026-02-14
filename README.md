# OniPanel - 服务器状态监控面板

基于 Node.js + React 的 Linux 服务器实时监控仪表板。

## 快速开始

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 生产部署
npm run build
npm start
```

访问shell中给出的地址，默认账户：`admin / admin`

## 配置

### 修改密码

```bash
# 生成新密码哈希
node -e "const bcrypt = require('bcrypt'); console.log(bcrypt.hashSync('你的新密码', 10))"
```

然后在 `server/index.js` 中替换密码哈希，或设置环境变量 `ADMIN_PASSWORD`。

## 技术栈

- **后端**: Express.js + systeminformation
- **前端**: React + Vite + Fluent UI + Recharts

## API 端点

| 端点 | 描述 |
|------|------|
| `/api/system-info` | 系统基本信息 |
| `/api/system-status` | CPU、内存、进程、负载 |
| `/api/disk` | 磁盘信息 |
| `/api/network` | 网络接口 |
| `/api/processes` | 进程列表 |

## 许可证

MIT
