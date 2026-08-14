const state = {
  letterLines: [
    '亲爱的老婆大人：',
    '',
    '当你看到这封信的时候，',
    '我已经想你想得不得了啦~',
    '',
    '还记得我们第一次见面吗？',
    '那天阳光很好，',
    '你笑起来的样子比阳光还耀眼。',
    '',
    '从那天起，',
    '我的生活就被你点亮了。',
    '吃饭想你，睡觉想你，',
    '连喝水都会想你。',
    '',
    '感谢你出现在我的生命里，',
    '让每一天都变得有意义。',
    '',
    '未来的路还很长很长，',
    '我想牵着你的手，',
    '一起走过春夏秋冬，',
    '一起看遍世间风景，',
    '一起慢慢变老。',
    '',
    '最后想说：',
    '我爱你，',
    '不止今天，',
    '而是往后的每一个明天。💕'
  ],
  displayLines: [],
  currentLine: 0,
  isTyping: true,
  isComplete: false,
  typingTimer: null,
  totalHearts: 0,
  rainHearts: [],
  nextHeartId: 0,
  loveQuotes: [
    '愿得一心人，白首不相离',
    '人生自是有情痴，此恨不关风与月',
    '只愿君心似我心，定不负相思意',
    '春风十里不如你',
    '遇见你，是我此生最美的风景',
    '愿有岁月可回首，且以深情共白头',
    '山有木兮木有枝，心悦君兮君不知',
    '愿我如星君如月，夜夜流光相皎洁',
    '用我三生烟火，换你一世迷离',
    '你若安好，便是晴天'
  ],
  currentQuote: '',
  quoteIndex: 0,
  specialDays: []
}

function startTyping() {
  state.displayLines = []
  state.currentLine = 0
  state.isTyping = true
  state.isComplete = false

  document.getElementById('typingIndicator').style.display = 'flex'
  document.getElementById('paperFooter').style.display = 'none'
  document.getElementById('replayBtn').style.display = 'none'
  document.getElementById('interactiveArea').style.display = 'none'
  document.getElementById('finalLove').style.display = 'none'
  renderLines()
  typeNextLine()
}

function renderLines() {
  const container = document.getElementById('paperLines')
  container.innerHTML = state.displayLines.map((line, index) => {
    const cursor = (index === state.currentLine - 1 && state.isTyping) ? '<span class="cursor">|</span>' : ''
    return `<div class="line"><span>${line}</span>${cursor}</div>`
  }).join('')
}

function typeNextLine() {
  const { letterLines, currentLine, displayLines } = state

  if (currentLine >= letterLines.length) {
    state.isTyping = false
    state.isComplete = true
    document.getElementById('typingIndicator').style.display = 'none'
    document.getElementById('paperFooter').style.display = 'flex'
    document.getElementById('replayBtn').style.display = 'flex'
    document.getElementById('interactiveArea').style.display = 'block'
    document.getElementById('finalLove').style.display = 'block'
    renderLines()
    initQuote()
    calculateSpecialDays()
    return
  }

  const line = letterLines[currentLine]
  state.displayLines = [...displayLines, line]
  state.currentLine = currentLine + 1
  renderLines()

  const delay = line === '' ? 100 : 300 + line.length * 50
  state.typingTimer = setTimeout(() => typeNextLine(), delay)
}

function replayLetter() {
  if (state.typingTimer) clearTimeout(state.typingTimer)
  startTyping()
}

function launchHeart(count) {
  const emojis = ['💗', '💕', '💖', '💝', '❤️', '💘', '💞', '💓']
  const newHearts = []

  for (let i = 0; i < count; i++) {
    const id = state.nextHeartId + i
    newHearts.push({
      id,
      x: Math.random() * 80 + 10,
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
      delay: Math.random() * 0.5,
      duration: 2 + Math.random() * 2
    })
  }

  state.totalHearts += count
  state.nextHeartId += count
  state.rainHearts = [...state.rainHearts, ...newHearts]

  document.getElementById('heartDisplay').textContent = `${state.totalHearts} 颗爱心已送出`
  renderRainHearts()

  vibrate('medium')

  setTimeout(() => {
    const idsToRemove = new Set(newHearts.map(h => h.id))
    state.rainHearts = state.rainHearts.filter(h => !idsToRemove.has(h.id))
    renderRainHearts()
  }, 4500)
}

function renderRainHearts() {
  const container = document.getElementById('heartRain')
  container.innerHTML = state.rainHearts.map(h => 
    `<div class="rain-heart" style="left: ${h.x}%; animation-delay: ${h.delay}s; animation-duration: ${h.duration}s;">${h.emoji}</div>`
  ).join('')
}

function initQuote() {
  const index = Math.floor(Math.random() * state.loveQuotes.length)
  state.currentQuote = state.loveQuotes[index]
  state.quoteIndex = index
  document.getElementById('currentQuote').textContent = state.currentQuote
}

function nextQuote() {
  let nextIndex
  do {
    nextIndex = Math.floor(Math.random() * state.loveQuotes.length)
  } while (nextIndex === state.quoteIndex)
  state.currentQuote = state.loveQuotes[nextIndex]
  state.quoteIndex = nextIndex
  document.getElementById('currentQuote').textContent = state.currentQuote
  vibrate('light')
}

function calculateSpecialDays() {
  const now = new Date()
  const year = now.getFullYear()

  const specialDays = [
    { name: '情人节', month: 2, day: 14 },
    { name: '520', month: 5, day: 20 },
    { name: '七夕', month: 8, day: 10 },
    { name: '圣诞节', month: 12, day: 25 }
  ].map(item => {
    let target = new Date(year, item.month - 1, item.day)
    if (target < now) {
      target = new Date(year + 1, item.month - 1, item.day)
    }
    const days = Math.ceil((target - now) / (1000 * 60 * 60 * 24))
    const month = target.getMonth() + 1
    const day = target.getDate()
    return { date: `${month}月${day}日`, name: item.name, days }
  }).sort((a, b) => a.days - b.days)

  state.specialDays = specialDays
  document.getElementById('daysList').innerHTML = specialDays.map(d => `
    <div class="day-item">
      <div class="day-date">${d.date}</div>
      <div class="day-name">${d.name}</div>
      <div class="day-count">${d.days} 天后</div>
    </div>
  `).join('')
}

document.addEventListener('DOMContentLoaded', () => {
  startTyping()
})
