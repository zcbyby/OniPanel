const express = require('express');
const cors = require('cors');
const path = require('path');
const si = require('systeminformation');
const os = require('os');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

const defaultLoginPath = '/' + crypto.randomBytes(8).toString('hex');
const LOGIN_PATH = process.env.LOGIN_PATH || defaultLoginPath;
const LOGIN_PATH_FILE = path.join(__dirname, '.login-path');

let currentLoginPath = LOGIN_PATH;
if (fs.existsSync(LOGIN_PATH_FILE)) {
  currentLoginPath = fs.readFileSync(LOGIN_PATH_FILE, 'utf8').trim();
} else {
  fs.writeFileSync(LOGIN_PATH_FILE, currentLoginPath);
}

console.log(`\n🔐 登录路径: http://localhost:${PORT}${currentLoginPath}\n`);

// Middleware
app.use(cors());
app.use(express.json());

// 默认用户（在生产环境中应该使用数据库）
const DEFAULT_USER = {
  username: 'admin',
  password: '$2a$10$9WNbUVeJDP1ld.KeJKo7Keyj2ppOYkpkJfMzGafn/RYIf9pRi5s1m', // bcrypt('admin')
};

// JWT 认证中间件
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: '未授权，请登录' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token 无效或已过期' });
    }
    req.user = user;
    next();
  });
};

// 存储进程列表缓存以减少系统调用
let processCache = [];
let lastProcessUpdate = 0;
const PROCESS_CACHE_TIME = 2000; // 2秒缓存

// 网络速率缓存
let lastNetStats = null;
let lastNetStatsTime = 0;
const NET_STATS_CACHE_TIME = 1000; // 1秒缓存

// 获取登录路径（前端使用）
app.get('/api/login-path', (req, res) => {
  res.json({ loginPath: currentLoginPath });
});

// 重置登录路径（需要认证）
app.post('/api/reset-login-path', authenticateToken, (req, res) => {
  const newPath = '/' + crypto.randomBytes(8).toString('hex');
  fs.writeFileSync(LOGIN_PATH_FILE, newPath);
  console.log(`\n🔐 登录路径已重置: http://localhost:${PORT}${newPath}\n`);
  res.json({ loginPath: newPath, message: '请使用新路径登录' });
});

// 登录端点
app.post(currentLoginPath, async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: '用户名和密码不能为空' });
    }

    // 验证用户名和密码
    const isValidPassword = await bcrypt.compare(password, DEFAULT_USER.password);

    if (username !== DEFAULT_USER.username || !isValidPassword) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }

    // 生成 JWT token，有效期 24 小时
    const token = jwt.sign(
      { username: DEFAULT_USER.username },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: { username: DEFAULT_USER.username },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: '登录失败' });
  }
});

// API 路由
app.get('/api/system-info', authenticateToken, async (req, res) => {
  try {
    const [cpuInfo, memInfo, osInfo, cpuSpeed] = await Promise.all([
      si.cpu(),
      si.mem(),

      si.osInfo(),
      si.cpuCurrentSpeed(),
    ]);

    res.json({
      cpu: {
        manufacturer: cpuInfo.manufacturer,
        brand: cpuInfo.brand,
        cores: cpuInfo.cores,
        physicalCores: cpuInfo.physicalCores,
        speed: cpuInfo.speed,
        currentSpeed: cpuSpeed.avg,
      },
      memory: {
        total: memInfo.total,
        used: memInfo.used,
        available: memInfo.available,
        free: memInfo.free,
      },
      os: {
        platform: osInfo.platform,
        distro: osInfo.distro,
        release: osInfo.release,
        kernel: osInfo.kernel,
        arch: osInfo.arch,
        hostname: os.hostname(),
        uptime: os.uptime(),
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 获取 CPU 使用率
app.get('/api/cpu-load', authenticateToken, async (req, res) => {
  try {
    const cpuLoad = await si.currentLoad();
    res.json({
      load: cpuLoad.currentLoad,
      loadPerCpu: cpuLoad.cpus.map(cpu => cpu.load),
      temps: cpuLoad,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 获取网络信息
app.get('/api/network', authenticateToken, async (req, res) => {
  try {
    const [networkStats, networkInterfaces] = await Promise.all([
      si.networkStats(),
      si.networkInterfaces(),
    ]);

    res.json({
      interfaces: networkStats.map(net => ({
        iface: net.iface,
        rx_bytes: net.rx_bytes,
        rx_dropped: net.rx_dropped,
        rx_errors: net.rx_errors,
        tx_bytes: net.tx_bytes,
        tx_dropped: net.tx_dropped,
        tx_errors: net.tx_errors,
      })),
      physicalInterfaces: networkInterfaces,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 获取磁盘信息
app.get('/api/disk', authenticateToken, async (req, res) => {
  try {
    const diskInfo = await si.fsSize();
    res.json({
      disks: diskInfo.map(disk => ({
        fs: disk.fs,
        type: disk.type,
        size: disk.size,
        used: disk.used,
        available: disk.available,
        use: disk.use,
        mount: disk.mount,
        rw: disk.rw,
      })),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 获取进程列表
app.get('/api/processes', authenticateToken, async (req, res) => {
  try {
    const now = Date.now();
    
    // 使用缓存避免频繁调用
    if (now - lastProcessUpdate > PROCESS_CACHE_TIME || processCache.length === 0) {
      const processes = await si.processes();
      processCache = (processes.list || [])
        .sort((a, b) => (b.mem || 0) - (a.mem || 0))
        .slice(0, 100)
        .map(p => ({
          pid: p.pid,
          name: p.name,
          cpu: p.cpu || 0,
          mem: p.mem || 0,
          user: p.user || 'unknown',
          command: p.command || p.name,
        }));
      lastProcessUpdate = now;
    }

    res.json({
      processes: processCache,
      timestamp: now,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 获取完整的系统状态
app.get('/api/system-status', authenticateToken, async (req, res) => {
  try {
    const [cpuLoad, memInfo, processes, loadAvg] = await Promise.all([
      si.currentLoad(),
      si.mem(),
      si.processes(),
      os.loadavg(),
    ]);

    const uptimeSeconds = os.uptime();
    const days = Math.floor(uptimeSeconds / 86400);
    const hours = Math.floor((uptimeSeconds % 86400) / 3600);
    const minutes = Math.floor((uptimeSeconds % 3600) / 60);

    res.json({
      cpu: {
        load: cpuLoad.currentLoad,
        loadPerCpu: cpuLoad.cpus.map(cpu => cpu.load),
        temp: cpuLoad.avgTemp || 0,
      },
      memory: {
        total: memInfo.total,
        used: memInfo.used,
        available: memInfo.available,
        usagePercent: (memInfo.used / memInfo.total) * 100,
        free: memInfo.free,
        cached: memInfo.cached || 0,
        buffers: memInfo.buffers || 0,
        swap: {
          total: memInfo.swaptotal || 0,
          used: memInfo.swapused || 0,
          free: (memInfo.swaptotal || 0) - (memInfo.swapused || 0),
        }
      },
      processes: {
        total: processes.all,
        running: processes.running,
        sleeping: processes.sleeping,
        zombie: processes.ghost || 0,
      },
      system: {
        uptime: uptimeSeconds,
        uptimeFormatted: `${days}d ${hours}h ${minutes}m`,
        loadAverage: {
          one: loadAvg[0],
          five: loadAvg[1],
          fifteen: loadAvg[2],
        },
      },
      timestamp: Date.now(),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 获取网络速率 (实时上传/下载速度)
app.get('/api/network-speed', authenticateToken, async (req, res) => {
  try {
    const now = Date.now();
    const currentStats = await si.networkStats();
    let speed = { rx: 0, tx: 0 };

    if (lastNetStats && now - lastNetStatsTime > 0) {
      const timeDiffMs = now - lastNetStatsTime;
      const timeDiffS = timeDiffMs / 1000;

      let totalRx = 0, totalTx = 0;
      for (let i = 0; i < currentStats.length; i++) {
        const current = currentStats[i];
        const last = lastNetStats.find(s => s.iface === current.iface);
        if (last) {
          totalRx += Math.max(0, current.rx_bytes - last.rx_bytes);
          totalTx += Math.max(0, current.tx_bytes - last.tx_bytes);
        }
      }

      speed = {
        rx: Math.round(totalRx / timeDiffS),
        tx: Math.round(totalTx / timeDiffS),
      };
    }

    lastNetStats = currentStats;
    lastNetStatsTime = now;

    res.json(speed);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 获取系统连接统计
app.get('/api/network-connections', authenticateToken, async (req, res) => {
  try {
    const connections = await si.networkConnections();
    
    const stats = {
      total: connections.length,
      established: 0,
      listen: 0,
      closeWait: 0,
      timeWait: 0,
    };

    connections.forEach(conn => {
      const state = conn.state?.toLowerCase() || '';
      if (state.includes('established')) stats.established++;
      else if (state.includes('listen')) stats.listen++;
      else if (state.includes('close_wait')) stats.closeWait++;
      else if (state.includes('time_wait')) stats.timeWait++;
    });

    res.json(stats);
  } catch (error) {
    res.status(500).json({ 
      total: 0,
      established: 0,
      listen: 0,
      closeWait: 0,
      timeWait: 0,
    });
  }
});

// 获取磁盘 I/O 信息
app.get('/api/disk-io', authenticateToken, async (req, res) => {
  try {
    const diskIO = await si.disksIO();
    res.json({
      read: diskIO.rIO || 0,
      write: diskIO.wIO || 0,
      readBytes: diskIO.rBytes || 0,
      writeBytes: diskIO.wBytes || 0,
    });
  } catch (error) {
    res.status(500).json({ 
      read: 0,
      write: 0,
      readBytes: 0,
      writeBytes: 0,
    });
  }
});

// 获取完整仪表板数据 (合并多个数据源)
app.get('/api/dashboard', authenticateToken, async (req, res) => {
  try {
    const [
      cpuLoad,
      memInfo,
      processes,
      networkStats,
      diskInfo,
      osInfo,
      diskIO,
    ] = await Promise.all([
      si.currentLoad(),
      si.mem(),
      si.processes(),
      si.networkStats(),
      si.fsSize(),
      si.osInfo(),
      si.disksIO().catch(() => ({ rIO: 0, wIO: 0, rBytes: 0, wBytes: 0 })),
    ]);

    const uptimeSeconds = os.uptime();
    const days = Math.floor(uptimeSeconds / 86400);
    const hours = Math.floor((uptimeSeconds % 86400) / 3600);
    const minutes = Math.floor((uptimeSeconds % 3600) / 60);
    const loadAvg = os.loadavg();

    // 计算网络总流量
    const totalRx = networkStats.reduce((sum, net) => sum + (net.rx_bytes || 0), 0);
    const totalTx = networkStats.reduce((sum, net) => sum + (net.tx_bytes || 0), 0);

    // 计算磁盘总容量和使用
    const diskTotal = diskInfo.reduce((sum, disk) => sum + disk.size, 0);
    const diskUsed = diskInfo.reduce((sum, disk) => sum + disk.used, 0);

    res.json({
      system: {
        hostname: os.hostname(),
        platform: osInfo.platform,
        distro: osInfo.distro,
        kernel: osInfo.kernel,
        arch: osInfo.arch,
        uptime: uptimeSeconds,
        uptimeFormatted: `${days}d ${hours}h ${minutes}m`,
      },
      cpu: {
        usage: cpuLoad.currentLoad,
        usagePerCore: cpuLoad.cpus.map(cpu => cpu.load),
        temp: cpuLoad.avgTemp || 0,
        cores: cpuLoad.cpus.length,
      },
      memory: {
        total: memInfo.total,
        used: memInfo.used,
        free: memInfo.free,
        available: memInfo.available,
        usage: (memInfo.used / memInfo.total) * 100,
        cached: memInfo.cached || 0,
        buffers: memInfo.buffers || 0,
        swapTotal: memInfo.swaptotal || 0,
        swapUsed: memInfo.swapused || 0,
        swapFree: (memInfo.swaptotal || 0) - (memInfo.swapused || 0),
      },
      network: {
        totalRx,
        totalTx,
        connections: {
          total: 0,
          established: 0,
        }
      },
      disk: {
        total: diskTotal,
        used: diskUsed,
        free: diskTotal - diskUsed,
        usage: (diskUsed / diskTotal) * 100,
        devices: diskInfo.length,
        io: {
          readRate: diskIO.rIO || 0,
          writeRate: diskIO.wIO || 0,
        }
      },
      processes: {
        total: processes.all,
        running: processes.running,
        sleeping: processes.sleeping,
        zombie: processes.ghost || 0,
      },
      load: {
        one: loadAvg[0],
        five: loadAvg[1],
        fifteen: loadAvg[2],
      },
      timestamp: Date.now(),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 静态文件服务 (生产环境)
const webBuildPath = path.join(__dirname, '../web/dist');
app.use(express.static(webBuildPath));

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// SPA fallback - 在最后添加
app.get('*', (req, res) => {
  res.sendFile(path.join(webBuildPath, 'index.html'), (err) => {
    if (err) {
      res.status(404).json({ error: 'Not found' });
    }
  });
});

app.listen(PORT, () => {
  console.log(`✨ Server running on http://localhost:${PORT}`);
});
