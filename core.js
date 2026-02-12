export function createChannel(name) {
  return new BroadcastChannelCore(name)
}

class BroadcastChannelCore {
  constructor(name) {
    if (typeof BroadcastChannel === 'undefined') {
      throw new Error('BroadcastChannel не поддерживается')
    }
    if (
      typeof crypto === 'undefined' || typeof crypto.randomUUID !== 'function') {
      throw new Error('crypto.randomUUID не поддерживается')
    }
    this.channel = new BroadcastChannel(name)
    this.listeners = [] 
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

    this.listeners.push(handler) 

    return handler
  }

  offMessage(handler) {
    this._assertAlive()

    if (typeof handler !== 'function') {
      throw new Error('Ошибка в данных сообщении')
    }

    this.listeners = this.listeners.filter(cb => cb !== handler)
  }

  destroy() {
    if (this.destroyed) return
    this.destroyed = true
    this.listeners = []
    this.channel.close()
  }
}
