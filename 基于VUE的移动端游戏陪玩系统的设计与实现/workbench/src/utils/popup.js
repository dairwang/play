import { createVNode, render } from 'vue'
import ToastComponent from '../components/Toast.vue'
import ConfirmComponent from '../components/Confirm.vue'

// Toast function
export const Toast = (message, type = 'info', duration = 2000) => {
  const container = document.createElement('div')
  document.body.appendChild(container)

  const vnode = createVNode(ToastComponent, {
    message,
    type,
    duration,
    onVnodeUnmounted: () => {
      document.body.removeChild(container)
    }
  })

  render(vnode, container)

  // Auto cleanup after duration + animation time
  if (duration > 0) {
    setTimeout(() => {
      render(null, container)
    }, duration + 500)
  }
}

Toast.success = (msg) => Toast(msg, 'success')
Toast.error = (msg) => Toast(msg, 'error')
Toast.info = (msg) => Toast(msg, 'info')

// Confirm function
export const Confirm = (message, title = '确认') => {
  return new Promise((resolve, reject) => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    const cleanup = () => {
      render(null, container)
      document.body.removeChild(container)
    }

    const vnode = createVNode(ConfirmComponent, {
      message,
      title,
      onConfirm: () => {
        cleanup()
        resolve(true)
      },
      onCancel: () => {
        cleanup()
        reject(false)
      }
    })

    render(vnode, container)
  })
}

export default {
  Toast,
  Confirm
}
