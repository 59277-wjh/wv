const state = {
  memories: [],
  showPublish: false,
  publishText: '',
  selectedCover: 0,
  covers: [
    { emoji: '🌹', bgClass: 'pink-bg', name: '浪漫玫瑰' },
    { emoji: '🍰', bgClass: 'orange-bg', name: '甜蜜蛋糕' },
    { emoji: '🏖️', bgClass: 'blue-bg', name: '海边时光' },
    { emoji: '🌸', bgClass: 'pink-bg', name: '春暖花开' },
    { emoji: '🎬', bgClass: 'purple-bg', name: '电影约会' },
    { emoji: '🍜', bgClass: 'green-bg', name: '美食时刻' },
    { emoji: '🐼', bgClass: 'pink-bg', name: '可爱熊猫' },
    { emoji: '✨', bgClass: 'orange-bg', name: '闪亮时刻' },
    { emoji: '🌙', bgClass: 'blue-bg', name: '月夜浪漫' },
    { emoji: '🎁', bgClass: 'purple-bg', name: '惊喜礼物' }
  ]
}

async function loadMemories() {
  try {
    state.memories = await apiGet('/api/memories')
    renderMemories()
  } catch (e) { console.error(e) }
}

function renderMemories() {
  const container = document.getElementById('memoryList')
  const emptyEl = document.getElementById('emptyState')

  if (state.memories.length === 0) {
    container.innerHTML = ''
    emptyEl.style.display = 'flex'
    return
  }

  emptyEl.style.display = 'none'
  container.innerHTML = state.memories.map(m => `
    <div class="memory-card">
      <div class="card-cover ${m.bgClass}">
        <span class="cover-emoji">${m.emoji}</span>
      </div>
      <div class="card-body">
        <div class="card-time">📅 ${m.date} ${m.time}</div>
        <div class="card-text">${m.text}</div>
        <div class="card-actions">
          <div class="delete-btn" onclick="deleteMemory(${m.id})">🗑️ 删除</div>
        </div>
      </div>
    </div>
  `).join('')
}

function openPublish() {
  state.publishText = ''
  state.selectedCover = 0
  document.getElementById('publishText').value = ''
  document.getElementById('charCount').textContent = '0/200'
  renderCoverGrid()
  updatePreview()
  document.getElementById('publishMask').style.display = 'flex'
}

function closePublish() {
  document.getElementById('publishMask').style.display = 'none'
}

function onTextInput(e) {
  state.publishText = e.target.value
  document.getElementById('charCount').textContent = `${e.target.value.length}/200`
  updatePreview()
}

function renderCoverGrid() {
  const container = document.getElementById('coverGrid')
  container.innerHTML = state.covers.map((cover, index) => `
    <div class="cover-item ${state.selectedCover === index ? 'selected' : ''} ${cover.bgClass}" onclick="selectCover(${index})">
      <span class="cover-item-emoji">${cover.emoji}</span>
      <span class="cover-item-name">${cover.name}</span>
      ${state.selectedCover === index ? '<div class="cover-check">✓</div>' : ''}
    </div>
  `).join('')
}

function selectCover(index) {
  state.selectedCover = index
  renderCoverGrid()
  updatePreview()
}

function updatePreview() {
  const cover = state.covers[state.selectedCover]
  document.getElementById('previewCover').className = `preview-cover ${cover.bgClass}`
  document.getElementById('previewCoverEmoji').textContent = cover.emoji
  document.getElementById('previewText').textContent = state.publishText || '预览效果...'
}

async function publishMemory() {
  const text = state.publishText.trim()
  if (!text) {
    showToast('写点什么吧~')
    return
  }

  const cover = state.covers[state.selectedCover]
  const now = new Date()
  const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

  await apiPost('/api/memories', {
    emoji: cover.emoji,
    bgClass: cover.bgClass,
    text, date, time
  })

  closePublish()
  await loadMemories()
  showToast('发布成功 💕')
}

function deleteMemory(id) {
  showModal({
    title: '删除动态',
    content: '确定要删除这条动态吗？',
    confirmText: '删除',
    cancelText: '取消',
    success: async (res) => {
      if (res.confirm) {
        await apiDelete(`/api/memories/${id}`)
        await loadMemories()
        showToast('已删除')
      }
    }
  })
}

function stopPropagation(e) { e.stopPropagation() }

document.addEventListener('DOMContentLoaded', () => {
  loadMemories()
})
