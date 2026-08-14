const express = require('express')
const fs = require('fs')
const path = require('path')

const app = express()

app.use(express.json())
app.use(express.static(path.join(__dirname, 'public')))

// 数据存储路径：Vercel 用 /tmp，本地用项目目录
const DATA_DIR = process.env.VERCEL ? '/tmp' : __dirname
const DATA_FILE = path.join(DATA_DIR, 'data.json')

// 初始化数据
function loadData() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8')
    return JSON.parse(raw)
  } catch (e) {
    const initial = {
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
    saveData(initial)
    return initial
  }
}

function saveData(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8')
  } catch (e) {
    console.error('保存数据失败:', e)
  }
}

function getData() {
  return loadData()
}

function updateData(updater) {
  const data = getData()
  updater(data)
  saveData(data)
  return data
}

// ==================== 时间线 API ====================

app.get('/api/timeline', (req, res) => {
  const data = getData()
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
  updateData(data => data.timeline.push(newItem))
  res.json(newItem)
})

app.delete('/api/timeline/:id', (req, res) => {
  const id = req.params.id
  updateData(data => {
    data.timeline = data.timeline.filter(t => t.id !== id)
  })
  res.json({ success: true })
})

// ==================== 相册动态 API ====================

app.get('/api/memories', (req, res) => {
  const data = getData()
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
  updateData(data => data.memories.unshift(newMemory))
  res.json(newMemory)
})

app.delete('/api/memories/:id', (req, res) => {
  const id = parseInt(req.params.id)
  updateData(data => {
    data.memories = data.memories.filter(m => m.id !== id)
  })
  res.json({ success: true })
})

// ==================== 点单 API ====================

app.get('/api/orders', (req, res) => {
  const data = getData()
  res.json(data.orders)
})

app.get('/api/orders/new', (req, res) => {
  const since = parseInt(req.query.since) || 0
  const data = getData()
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
  updateData(data => data.orders.unshift(newOrder))
  res.json(newOrder)
})

app.put('/api/orders/:id', (req, res) => {
  const id = parseInt(req.params.id)
  const data = updateData(d => {
    const order = d.orders.find(o => o.id === id)
    if (order && req.body.status) {
      order.status = req.body.status
    }
  })
  const order = data.orders.find(o => o.id === id)
  if (!order) {
    return res.status(404).json({ error: '订单不存在' })
  }
  res.json(order)
})

app.delete('/api/orders/:id', (req, res) => {
  const id = parseInt(req.params.id)
  updateData(data => {
    data.orders = data.orders.filter(o => o.id !== id)
  })
  res.json({ success: true })
})

// 导出 Express app（Vercel 会自动处理）
module.exports = app

// 本地运行时启动服务器
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 3000
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`💕 爱的时光机已启动！`)
    console.log(`   本机访问: http://localhost:${PORT}`)
    console.log(`   按 Ctrl+C 停止`)
  })
}
