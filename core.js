export function createChannel(name) {
  return new BroadcastChannelCore(name)
}

class BroadcastChannelCore {
  constructor(name) {
    if (typeof BroadcastChannel === 'undefined') {
      throw new Error('BroadcastChannel не поддерживается')
    }

    this.channel = new BroadcastChannel(name)
    this.listeners = new Set()
    this.destroyed = false
    this.senderId = crypto.randomUUID()

    this.channel.onmessage = event => {
      if (this.destroyed) return

      const { senderId, payload } = event.data
      if (senderId === this.senderId) return

      this.listeners.forEach(cb => {
        try {
          cb(payload)
        } catch (err) {
          console.error('Ошибка принимающего:', err)
        }
      })
    }
  }

  _assertAlive() {
    if (this.destroyed) {
      throw new Error('Канал удален')
    }
  }

  send(message) {
    this._assertAlive()
    this.channel.postMessage({
      senderId: this.senderId,
      payload: message,
    })
  }

  onMessage(handler) {
    this._assertAlive()

    if (typeof handler !== 'function') {
      throw new Error('Ошибка в данных сообщении')
    }
    
    this.listeners.add(handler)

    return handler
  }

  offMessage(handler) {
    this._assertAlive()

    if (typeof handler !== 'function') {
      throw new Error('Ошибка в данных сообщении')
    }

    this.listeners.delete(handler)

  }

  destroy() {
    if (this.destroyed) return
    this.destroyed = true
    this.listeners.clear()
    this.channel.close()
  }
}
