const express = require('express')
const fs = require('fs')
const path = require('path')

const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())
app.use(express.static(path.join(__dirname, 'public')))

// 数据存储文件
const DATA_FILE = path.join(__dirname, 'data.json')

// 初始化数据
function loadData() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8')
    return JSON.parse(raw)
  } catch (e) {
    return {
      timeline: [
        {
          id: '1',
          icon: '💕',
          color: 'pink',
          date: '2026-02-15',
          dateDisplay: '2026.02.15',
          title: '我们在一起啦',
          desc: '在这个充满爱的日子，我们的故事开始了'
        }
      ],
      memories: [
        {
          id: Date.now() - 3000,
          emoji: '💕',
          bgClass: 'pink-bg',
          text: '我们在一起的第一天！好开心~',
          date: '2026-02-15',
          time: '20:00'
        },
        {
          id: Date.now() - 2000,
          emoji: '🌸',
          bgClass: 'orange-bg',
          text: '第一次约会，一起吃了火锅，你笑得好甜',
          date: '2026-02-20',
          time: '18:30'
        }
      ],
      orders: []
    }
  }
}

function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8')
}

let data = loadData()

// ==================== 时间线 API ====================

app.get('/api/timeline', (req, res) => {
  const sorted = [...data.timeline].sort((a, b) => new Date(a.date) - new Date(b.date))
  res.json(sorted)
})

app.post('/api/timeline', (req, res) => {
  const { icon, color, date, dateDisplay, title, desc } = req.body
  if (!title || !date) {
    return res.status(400).json({ error: '标题和日期不能为空' })
  }
  const newItem = {
    id: Date.now().toString(),
    icon: icon || '💕',
    color: color || 'pink',
    date,
    dateDisplay: dateDisplay || date,
    title,
    desc: desc || '一个美好的故事'
  }
  data.timeline.push(newItem)
  saveData(data)
  res.json(newItem)
})

app.delete('/api/timeline/:id', (req, res) => {
  const id = req.params.id
  data.timeline = data.timeline.filter(t => t.id !== id)
  saveData(data)
  res.json({ success: true })
})

// ==================== 相册动态 API ====================

app.get('/api/memories', (req, res) => {
  res.json(data.memories)
})

app.post('/api/memories', (req, res) => {
  const { emoji, bgClass, text, date, time } = req.body
  if (!text || !text.trim()) {
    return res.status(400).json({ error: '内容不能为空' })
  }
  const newMemory = {
    id: Date.now(),
    emoji: emoji || '💕',
    bgClass: bgClass || 'pink-bg',
    text: text.trim(),
    date: date || '',
    time: time || ''
  }
  data.memories.unshift(newMemory)
  saveData(data)
  res.json(newMemory)
})

app.delete('/api/memories/:id', (req, res) => {
  const id = parseInt(req.params.id)
  data.memories = data.memories.filter(m => m.id !== id)
  saveData(data)
  res.json({ success: true })
})

// ==================== 点单 API ====================

app.get('/api/orders', (req, res) => {
  res.json(data.orders)
})

// 获取新订单（用于通知）
app.get('/api/orders/new', (req, res) => {
  const since = parseInt(req.query.since) || 0
  const newOrders = data.orders.filter(o => o.createTimestamp > since && o.status === 'pending')
  res.json(newOrders)
})

app.post('/api/orders', (req, res) => {
  const { menuId, icon, name, price, note, category } = req.body
  const now = new Date()
  const time = `${now.getMonth() + 1}/${now.getDate()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

  const newOrder = {
    id: Date.now(),
    menuId: menuId || 'custom_' + Date.now(),
    icon: icon || '💫',
    name: name || '',
    price: price || '',
    time,
    status: 'pending',
    category: category || 'custom',
    note: note || '',
    createTimestamp: Date.now()
  }
  data.orders.unshift(newOrder)
  saveData(data)
  res.json(newOrder)
})

app.put('/api/orders/:id', (req, res) => {
  const id = parseInt(req.params.id)
  const order = data.orders.find(o => o.id === id)
  if (!order) {
    return res.status(404).json({ error: '订单不存在' })
  }
  if (req.body.status) {
    order.status = req.body.status
  }
  saveData(data)
  res.json(order)
})

app.delete('/api/orders/:id', (req, res) => {
  const id = parseInt(req.params.id)
  data.orders = data.orders.filter(o => o.id !== id)
  saveData(data)
  res.json({ success: true })
})

// ==================== 获取局域网IP ====================

function getLocalIPs() {
  const os = require('os')
  const ifaces = os.networkInterfaces()
  const ips = []
  for (const name of Object.keys(ifaces)) {
    for (const iface of ifaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        ips.push(iface.address)
      }
    }
  }
  // 优先 192.168.x.x，其次 10.x.x.x，最后其他
  const lanIP = ips.find(ip => ip.startsWith('192.168.'))
    || ips.find(ip => ip.startsWith('10.'))
    || ips.find(ip => !ip.startsWith('172.'))
    || ips[0]
  return { all: ips, lan: lanIP }
}

// ==================== 启动服务器 ====================

const { all: allIPs, lan: lanIP } = getLocalIPs()

app.listen(PORT, '0.0.0.0', () => {
  console.log(`💕 爱的时光机已启动！`)
  console.log(`   本机访问: http://localhost:${PORT}`)
  if (lanIP) {
    console.log(`   局域网访问: http://${lanIP}:${PORT}  （同一WiFi下手机/电脑）`)
  }
  if (allIPs.length > 1) {
    console.log(`   所有本机IP: ${allIPs.join(', ')}`)
  }
  console.log(``)
  console.log(`💡 手机访问方法：手机和电脑连同一个WiFi，然后在浏览器打开上面的 局域网访问 地址`)
})
