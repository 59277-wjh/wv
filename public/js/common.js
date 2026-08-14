// rpx 适配
function setRootFontSize() {
  const width = Math.min(window.innerWidth, 480)
  document.documentElement.style.fontSize = (width / 750) + 'px'
}
setRootFontSize()
window.addEventListener('resize', setRootFontSize)

// Toast 提示
function showToast(title, duration = 2000) {
  const existing = document.querySelector('.toast')
  if (existing) existing.remove()

  const toast = document.createElement('div')
  toast.className = 'toast'
  toast.textContent = title
  document.body.appendChild(toast)

  setTimeout(() => {
    toast.style.opacity = '0'
    toast.style.transition = 'opacity 0.3s'
    setTimeout(() => toast.remove(), 300)
  }, duration)
}

// 自定义弹窗
function showModal({ title, content, confirmText = '确定', cancelText = '取消', success }) {
  const mask = document.createElement('div')
  mask.className = 'modal-mask'

  mask.innerHTML = `
    <div class="modal-box">
      <div class="modal-title">${title}</div>
      <div class="modal-content">${content}</div>
      <div class="modal-btns">
        <button class="modal-btn cancel">${cancelText}</button>
        <button class="modal-btn confirm">${confirmText}</button>
      </div>
    </div>
  `

  document.body.appendChild(mask)

  mask.querySelector('.cancel').onclick = () => {
    mask.remove()
    if (success) success({ confirm: false })
  }

  mask.querySelector('.confirm').onclick = () => {
    mask.remove()
    if (success) success({ confirm: true })
  }
}

// 震动反馈
function vibrate(type = 'light') {
  if (navigator.vibrate) {
    navigator.vibrate(type === 'medium' ? 30 : 10)
  }
}

// API 请求封装
async function apiGet(url) {
  const res = await fetch(url)
  return res.json()
}

async function apiPost(url, body) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
  return res.json()
}

async function apiDelete(url) {
  const res = await fetch(url, { method: 'DELETE' })
  return res.json()
}

async function apiPut(url, body) {
  const res = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
  return res.json()
}

// localStorage 封装
const storage = {
  get(key) {
    const val = localStorage.getItem(key)
    try { return val ? JSON.parse(val) : null } catch (e) { return null }
  },
  set(key, val) {
    localStorage.setItem(key, typeof val === 'string' ? val : JSON.stringify(val))
  }
}
