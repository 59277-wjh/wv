// 状态
const state = {
  daysTogether: 0,
  todayText: '',
  dailyQuote: '',
  quotes: [
    '喜欢你，是我做过最好的事情 💕',
    '愿得一心人，白首不相离 🐼',
    '每一天都想和你在一起 ✨',
    '你是我心里的小星星 🌟',
    '有你的日子，都是情人节 💝',
    '想和你一起慢慢变老 🌹',
    '你笑起来真好看，像春天的花一样 🌸',
    '遇见你，是我最大的幸运 🍀',
    '愿我们的爱情，像熊猫一样珍贵 🐼',
    '爱你，不止今天，而是每一天 💗',
    '你是我的全世界 🌍',
    '喜欢你的每一天都是甜的 🍬'
  ],
  quoteIndex: 0,
  timeline: [],
  showSurprise: false,
  showAddStory: false,
  newStoryDate: '',
  newStoryTitle: '',
  newStoryDesc: '',
  newStoryIcon: '💕',
  newStoryColor: 'pink',
  iconOptions: ['💕', '🌸', '💝', '🐼', '✨', '🌹', '🎁', '💌', '🍰', '🏖️', '🎬', '💫'],
  colorOptions: [
    { name: 'pink', hex: '#FF6B9D' },
    { name: 'orange', hex: '#FFA07A' },
    { name: 'purple', hex: '#DDA0DD' },
    { name: 'blue', hex: '#87CEEB' },
    { name: 'green', hex: '#98FB98' }
  ],
  surpriseEmojis: ['💖', '💕', '💗', '💝', '💘', '❤️', '🌹', '✨', '🎉', '🎁'],
  surpriseTexts: [
    '谢谢你选择了我，让我有机会爱你！',
    '你是我生命中最美好的意外 ✨',
    '余生很长，请多指教呀~',
    '和你在一起的每一天，都是最好的时光！',
    '你就是我的小确幸 🌈'
  ]
}

// 计算天数
function calculateDays() {
  const startDate = '2026-02-15'
  const start = new Date(startDate + 'T00:00:00')
  const now = new Date()
  const diffTime = now - start
  const days = Math.floor(diffTime / (1000 * 60 * 60 * 24))

  const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']
  const today = `${now.getFullYear()}年${monthNames[now.getMonth()]}${now.getDate()}日`

  state.daysTogether = days >= 0 ? days : 0
  state.todayText = `今天是 ${today}`
  state.dailyQuote = state.quotes[0]

  document.getElementById('daysNumber').textContent = state.daysTogether
  document.getElementById('daysToday').textContent = state.todayText
  document.getElementById('quoteText').textContent = state.dailyQuote
}

// 加载时间线
async function loadTimeline() {
  try {
    const timeline = await apiGet('/api/timeline')
    state.timeline = timeline
    renderTimeline()
  } catch (e) {
    console.error('加载时间线失败:', e)
  }
}

// 渲染时间线
function renderTimeline() {
  const container = document.getElementById('timeline')
  const emptyEl = document.getElementById('emptyTimeline')

  if (state.timeline.length === 0) {
    container.innerHTML = ''
    emptyEl.style.display = 'flex'
    return
  }

  emptyEl.style.display = 'none'
  const sorted = [...state.timeline].sort((a, b) => new Date(a.date) - new Date(b.date))

  container.innerHTML = sorted.map(item => `
    <div class="timeline-item">
      <div class="timeline-dot ${item.color}">
        <span class="dot-icon">${item.icon}</span>
      </div>
      <div class="timeline-content">
        <div class="timeline-header">
          <div class="timeline-date">${item.dateDisplay}</div>
          <div class="timeline-delete" onclick="deleteStory('${item.id}')">🗑️</div>
        </div>
        <div class="timeline-title">${item.title}</div>
        <div class="timeline-desc">${item.desc}</div>
      </div>
    </div>
  `).join('')
}

// 打开添加故事弹窗
function openAddStory() {
  const now = new Date()
  const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  state.newStoryDate = dateStr
  state.newStoryTitle = ''
  state.newStoryDesc = ''
  state.newStoryIcon = '💕'
  state.newStoryColor = 'pink'

  document.getElementById('storyDate').value = dateStr
  document.getElementById('storyTitle').value = ''
  document.getElementById('storyDesc').value = ''
  renderIconGrid()
  renderColorGrid()
  document.getElementById('storyMask').style.display = 'flex'
}

function closeAddStory() {
  document.getElementById('storyMask').style.display = 'none'
}

function onDateChange(e) {
  state.newStoryDate = e.target.value
}

function onTitleInput(e) {
  state.newStoryTitle = e.target.value
}

function onDescInput(e) {
  state.newStoryDesc = e.target.value
}

function renderIconGrid() {
  const container = document.getElementById('iconGrid')
  container.innerHTML = state.iconOptions.map(icon => `
    <div class="icon-item ${state.newStoryIcon === icon ? 'selected' : ''}" onclick="selectIcon('${icon}')">
      <span>${icon}</span>
    </div>
  `).join('')
}

function selectIcon(icon) {
  state.newStoryIcon = icon
  renderIconGrid()
}

function renderColorGrid() {
  const container = document.getElementById('colorGrid')
  container.innerHTML = state.colorOptions.map(item => `
    <div class="color-item ${state.newStoryColor === item.name ? 'selected' : ''}"
         style="background: ${item.hex};"
         onclick="selectColor('${item.name}')"></div>
  `).join('')
}

function selectColor(color) {
  state.newStoryColor = color
  renderColorGrid()
}

async function saveStory() {
  if (!state.newStoryTitle.trim()) {
    showToast('请输入标题')
    return
  }
  if (!state.newStoryDate) {
    showToast('请选择日期')
    return
  }

  const dateParts = state.newStoryDate.split('-')
  const dateDisplay = `${dateParts[0]}.${dateParts[1]}.${dateParts[2]}`

  await apiPost('/api/timeline', {
    icon: state.newStoryIcon,
    color: state.newStoryColor,
    date: state.newStoryDate,
    dateDisplay,
    title: state.newStoryTitle.trim(),
    desc: state.newStoryDesc.trim() || '一个美好的故事'
  })

  closeAddStory()
  await loadTimeline()
  showToast('添加成功 💝')
}

async function deleteStory(id) {
  showModal({
    title: '删除故事',
    content: '确定要删除这个故事吗？',
    confirmText: '删除',
    cancelText: '取消',
    success: async (res) => {
      if (res.confirm) {
        await apiDelete(`/api/timeline/${id}`)
        await loadTimeline()
        showToast('已删除')
      }
    }
  })
}

function onCardTap() {
  vibrate('light')
}

// 每日一句
function onNextQuote() {
  state.quoteIndex = (state.quoteIndex + 1) % state.quotes.length
  state.dailyQuote = state.quotes[state.quoteIndex]
  document.getElementById('quoteText').textContent = state.dailyQuote
}

// 惊喜
function onSurprise() {
  const randomIndex = Math.floor(Math.random() * state.surpriseTexts.length)
  const surpriseText = state.surpriseTexts[randomIndex]
  document.getElementById('surpriseText').textContent = surpriseText
  document.getElementById('surpriseMask').style.display = 'flex'
}

function closeSurprise() {
  document.getElementById('surpriseMask').style.display = 'none'
}

// 检查新订单通知
async function checkNewOrders() {
  const lastSeenTime = storage.get('lastSeenOrderTime') || 0
  try {
    const newOrders = await apiGet(`/api/orders/new?since=${lastSeenTime}`)
    if (newOrders && newOrders.length > 0) {
      const latestOrder = newOrders[0]
      const message = newOrders.length === 1
        ? `收到新订单：${latestOrder.name}${latestOrder.note ? '（备注：' + latestOrder.note + '）' : ''}`
        : `收到 ${newOrders.length} 个新订单，快去查看吧~`

      showModal({
        title: '🔔 有新订单啦',
        content: message,
        confirmText: '去查看',
        cancelText: '知道了',
        success: (res) => {
          const maxTime = Math.max(...newOrders.map(o => o.createTimestamp || 0))
          storage.set('lastSeenOrderTime', maxTime)
          if (res.confirm) {
            window.location.href = '/wish.html'
          }
        }
      })
    }
  } catch (e) {
    console.error('检查订单失败:', e)
  }
}

// Canvas 爱心动画
function initHeartCanvas() {
  const canvas = document.getElementById('heartCanvas')
  const ctx = canvas.getContext('2d')

  function resizeCanvas() {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
  }
  resizeCanvas()
  window.addEventListener('resize', resizeCanvas)

  const hearts = []
  for (let i = 0; i < 15; i++) {
    hearts.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 20 + 10,
      speed: Math.random() * 2 + 1,
      opacity: Math.random() * 0.5 + 0.3,
      drift: Math.random() * 2 - 1
    })
  }

  function drawHeart(ctx, x, y, size, alpha, color) {
    ctx.save()
    ctx.globalAlpha = alpha
    ctx.fillStyle = color
    const s = size / 20
    ctx.translate(x, y)
    ctx.scale(s, s)
    ctx.beginPath()
    ctx.moveTo(0, 6)
    ctx.bezierCurveTo(0, 3, -5, -2, -10, -2)
    ctx.bezierCurveTo(-18, -2, -18, 8, -18, 8)
    ctx.bezierCurveTo(-18, 14, -12, 20, 0, 28)
    ctx.bezierCurveTo(12, 20, 18, 14, 18, 8)
    ctx.bezierCurveTo(18, 8, 18, -2, 10, -2)
    ctx.bezierCurveTo(5, -2, 0, 3, 0, 6)
    ctx.closePath()
    ctx.fill()
    ctx.restore()
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    hearts.forEach(heart => {
      heart.y -= heart.speed
      heart.x += heart.drift * 0.5

      if (heart.y < -30) {
        heart.y = canvas.height + 30
        heart.x = Math.random() * canvas.width
      }
      if (heart.x < -30) heart.x = canvas.width + 30
      if (heart.x > canvas.width + 30) heart.x = -30

      drawHeart(ctx, heart.x, heart.y, heart.size, heart.opacity, `rgb(255, 107, 157)`)
    })

    requestAnimationFrame(animate)
  }

  animate()

  // 点击爆发爱心
  canvas.addEventListener('click', (e) => {
    for (let i = 0; i < 8; i++) {
      const offsetX = (Math.random() - 0.5) * 100
      const offsetY = (Math.random() - 0.5) * 100
      drawHeart(ctx, e.clientX + offsetX, e.clientY + offsetY, 30, 0.8, '#FF6B9D')
    }
  })
}

// 页面初始化
function init() {
  calculateDays()
  loadTimeline()
  initHeartCanvas()
  checkNewOrders()

  // 每分钟更新天数
  setInterval(calculateDays, 60000)
}

document.addEventListener('DOMContentLoaded', init)
