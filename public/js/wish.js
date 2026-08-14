const state = {
  activeCategory: 'food',
  customText: '',
  categories: [
    { key: 'food', name: '美食', icon: '🍜' },
    { key: 'play', name: '玩耍', icon: '🎮' },
    { key: 'care', name: '关心', icon: '🤗' },
    { key: 'gift', name: '礼物', icon: '🎁' },
    { key: 'date', name: '约会', icon: '💑' }
  ],
  allMenu: {
    food: [
      { id: 'f1', icon: '🧋', name: '一杯奶茶', desc: '甜甜的，像你一样', price: '需要一杯奶茶' },
      { id: 'f2', icon: '🍲', name: '一顿火锅', desc: '一起吃得热热的', price: '需要一顿火锅' },
      { id: 'f3', icon: '🍰', name: '小蛋糕', desc: '甜甜的小蛋糕', price: '需要一个小蛋糕' },
      { id: 'f4', icon: '🍟', name: '炸鸡可乐', desc: '快乐套餐', price: '需要炸鸡可乐' },
      { id: 'f5', icon: '🍓', name: '水果拼盘', desc: '健康又好吃', price: '需要水果拼盘' },
      { id: 'f6', icon: '🍦', name: '冰淇淋', desc: '甜甜的冰淇淋', price: '需要冰淇淋' }
    ],
    play: [
      { id: 'p1', icon: '🎮', name: '一起打游戏', desc: '陪你玩到开心', price: '需要一起打游戏' },
      { id: 'p2', icon: '🎬', name: '看一部电影', desc: '窝在沙发上看', price: '需要一起看电影' },
      { id: 'p3', icon: '🎵', name: '一起听歌', desc: '分享喜欢的歌', price: '需要一起听歌' },
      { id: 'p4', icon: '🧩', name: '拼图游戏', desc: '一起拼拼图', price: '需要一起拼图' },
      { id: 'p5', icon: '🎲', name: '桌游时光', desc: '玩一局桌游', price: '需要一起玩桌游' }
    ],
    care: [
      { id: 'c1', icon: '🤗', name: '一个大大的拥抱', desc: '紧紧抱住不放开', price: '需要一个拥抱' },
      { id: 'c2', icon: '💋', name: '一个亲亲', desc: '甜甜的亲亲', price: '需要一个亲亲' },
      { id: 'c3', icon: '💆', name: '帮你按摩', desc: '帮你按按肩膀', price: '需要按摩服务' },
      { id: 'c4', icon: '🌙', name: '陪你入睡', desc: '哄你睡觉觉', price: '需要陪睡服务' },
      { id: 'c5', icon: '📞', name: '陪你聊天', desc: '聊到天亮也行', price: '需要陪聊服务' }
    ],
    gift: [
      { id: 'g1', icon: '🌹', name: '一束玫瑰', desc: '浪漫的玫瑰花', price: '需要一束玫瑰' },
      { id: 'g2', icon: '🐼', name: '熊猫公仔', desc: '可爱的熊猫抱枕', price: '需要一个熊猫公仔' },
      { id: 'g3', icon: '💌', name: '一封手写信', desc: '手写的情书', price: '需要一封手写信' },
      { id: 'g4', icon: '🍫', name: '巧克力礼盒', desc: '甜甜的巧克力', price: '需要巧克力' },
      { id: 'g5', icon: '🎁', name: '神秘惊喜', desc: '意想不到的礼物', price: '需要一个惊喜' }
    ],
    date: [
      { id: 'd1', icon: '🎡', name: '游乐园约会', desc: '一起坐摩天轮', price: '需要游乐园约会' },
      { id: 'd2', icon: '🏖️', name: '海边漫步', desc: '一起看日落', price: '需要海边约会' },
      { id: 'd3', icon: '🌸', name: '公园野餐', desc: '一起野餐赏花', price: '需要公园野餐' },
      { id: 'd4', icon: '🌃', name: '夜市逛街', desc: '一起逛吃逛吃', price: '需要夜市约会' },
      { id: 'd5', icon: '♨️', name: '温泉约会', desc: '一起泡温泉', price: '需要温泉约会' }
    ]
  },
  currentMenu: [],
  orders: [],
  showNoteModal: false,
  pendingOrder: null,
  orderNote: ''
}

async function loadOrders() {
  try {
    state.orders = await apiGet('/api/orders')
    renderOrders()
    updateMenuStatus()
  } catch (e) { console.error(e) }
}

function switchCategory(key) {
  state.activeCategory = key
  renderCategories()
  updateMenuStatus()
}

function renderCategories() {
  const container = document.getElementById('categories')
  container.innerHTML = state.categories.map(cat => `
    <div class="cat-item ${state.activeCategory === cat.key ? 'active' : ''}" onclick="switchCategory('${cat.key}')">
      <span class="cat-icon">${cat.icon}</span>
      <span class="cat-name">${cat.name}</span>
    </div>
  `).join('')
}

function updateMenuStatus() {
  const cat = state.activeCategory
  const menu = JSON.parse(JSON.stringify(state.allMenu[cat]))
  menu.forEach(item => {
    const order = state.orders.find(o => o.menuId === item.id && o.status === 'pending')
    item.ordered = !!order
  })
  state.currentMenu = menu
  renderMenu()
}

function renderMenu() {
  const container = document.getElementById('menuList')
  container.innerHTML = state.currentMenu.map(item => `
    <div class="menu-item ${item.ordered ? 'ordered' : ''}" onclick="toggleOrder('${item.id}')">
      <div class="menu-icon-wrap ${item.ordered ? 'checked' : ''}">
        <span class="menu-icon">${item.icon}</span>
        ${item.ordered ? '<div class="check-mark">✓</div>' : ''}
      </div>
      <div class="menu-info">
        <div class="menu-name">${item.name}</div>
        <div class="menu-desc">${item.desc}</div>
        <div class="menu-price">${item.price}</div>
      </div>
      <div class="menu-action">
        <div class="action-btn ${item.ordered ? 'cancel' : 'order'}">
          <span>${item.ordered ? '取消' : '点单'}</span>
        </div>
      </div>
    </div>
  `).join('')
}

function toggleOrder(id) {
  const item = state.currentMenu.find(m => m.id === id)
  if (!item) return

  if (item.ordered) {
    const order = state.orders.find(o => o.menuId === id && o.status === 'pending')
    if (order) {
      removeOrder(order.id)
    }
  } else {
    state.pendingOrder = item
    state.orderNote = ''
    document.getElementById('orderNote').value = ''
    document.getElementById('noteCharCount').textContent = '0/50'
    document.getElementById('noteItemIcon').textContent = item.icon
    document.getElementById('noteItemName').textContent = item.name
    document.getElementById('noteMask').style.display = 'flex'
  }
}

function onNoteInput(e) {
  state.orderNote = e.target.value
  document.getElementById('noteCharCount').textContent = `${e.target.value.length}/50`
}

function closeNoteModal() {
  document.getElementById('noteMask').style.display = 'none'
  state.pendingOrder = null
  state.orderNote = ''
}

function confirmOrderWithoutNote() {
  confirmOrder('')
}

function confirmOrderWithNote() {
  confirmOrder(state.orderNote.trim())
}

async function confirmOrder(note) {
  const item = state.pendingOrder
  if (!item) return

  await apiPost('/api/orders', {
    menuId: item.id,
    icon: item.icon,
    name: item.name,
    price: item.price,
    note: note || '',
    category: state.activeCategory
  })

  closeNoteModal()
  await loadOrders()
  showToast('点单成功! 💕')
  vibrate('medium')
}

function onCustomInput(e) {
  state.customText = e.target.value
}

async function addCustomOrder() {
  const text = state.customText.trim()
  if (!text) {
    showToast('写点什么吧~')
    return
  }

  await apiPost('/api/orders', {
    menuId: 'custom_' + Date.now(),
    icon: '💫',
    name: text,
    price: '需要 ' + text,
    note: '',
    category: 'custom'
  })

  state.customText = ''
  document.getElementById('customInput').value = ''
  await loadOrders()
  showToast('已添加! 💕')
}

function renderOrders() {
  const container = document.getElementById('orderList')
  const emptyEl = document.getElementById('emptyOrders')
  const countEl = document.getElementById('orderCount')

  countEl.textContent = state.orders.length

  if (state.orders.length === 0) {
    container.innerHTML = ''
    emptyEl.style.display = 'flex'
    return
  }

  emptyEl.style.display = 'none'
  const statusMap = { pending: '⏳', completed: '✅' }
  const statusText = { pending: '等待接单', completed: '已完成' }

  container.innerHTML = state.orders.map(order => `
    <div class="order-item">
      <div class="order-status ${order.status}">
        <span class="status-icon">${statusMap[order.status]}</span>
        <span class="status-text">${statusText[order.status]}</span>
      </div>
      <div class="order-content">
        <span class="order-icon">${order.icon}</span>
        <div class="order-info">
          <div class="order-name">${order.name}</div>
          <div class="order-time">${order.time}</div>
          ${order.note ? `<div class="order-note">📝 ${order.note}</div>` : ''}
        </div>
      </div>
      <div class="order-actions">
        ${order.status === 'pending' ? `<button class="order-btn complete" onclick="completeOrder(${order.id})">完成</button>` : ''}
        <button class="order-btn remove" onclick="removeOrder(${order.id})">删除</button>
      </div>
    </div>
  `).join('')
}

async function completeOrder(id) {
  await apiPut(`/api/orders/${id}`, { status: 'completed' })
  await loadOrders()
  showToast('已完成! 完美~ 🎉')
  vibrate('light')
}

function removeOrder(id) {
  showModal({
    title: '删除订单',
    content: '确定要删除这个订单吗？',
    confirmText: '删除',
    cancelText: '取消',
    success: async (res) => {
      if (res.confirm) {
        await apiDelete(`/api/orders/${id}`)
        await loadOrders()
        showToast('已删除')
      }
    }
  })
}

function stopPropagation(e) { e.stopPropagation() }

document.addEventListener('DOMContentLoaded', () => {
  renderCategories()
  loadOrders()
})
