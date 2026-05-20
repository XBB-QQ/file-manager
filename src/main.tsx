import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

// 确保在 Capacitor 环境中正确加载
const initializeApp = () => {
  const container = document.getElementById('root')
  if (container) {
    createRoot(container).render(
      <StrictMode>
        <App />
      </StrictMode>,
    )
  }
}

// 检查是否在 Capacitor 环境中
if (typeof (window as any).Capacitor !== 'undefined') {
  // Capacitor 环境，等待 DOM 准备好
  document.addEventListener('DOMContentLoaded', initializeApp)
} else {
  // Web 环境，直接初始化
  initializeApp()
}
