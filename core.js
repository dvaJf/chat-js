export function createChannel(name) {
    return new BroadcastChannelCore(name)
}

class BroadcastChannelCore {
  constructor(name) {
    this.channel = new BroadcastChannel(name)
    this.listeners = new Set()
  }

  init() {
    this.channel.onmessage = event => {
      this.listeners.forEach(cb => cb(event.data))
    }
  }

  send(message) {
    this.channel.postMessage(message)
  }

  onMessage(handler) {
    this.listeners.add(handler)
    return () => this.listeners.delete(handler)
  }

  destroy() {
    this.channel.close()
    this.listeners.clear()
  }
}
