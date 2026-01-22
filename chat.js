import { createChannel } from './core.js'

const messagesEl = document.getElementById('messages')
const form = document.getElementById('form')
const input = document.getElementById('input')
const channel = createChannel('c')
channel.init()

channel.on(text => {
  addMessage(text)
})

form.addEventListener('submit', e => {
  e.preventDefault()

  const text = input.value.trim()
  if (!text) return

  channel.send(text)
  addMessage(text)

  input.value = ''
})

function addMessage(text) {
  const div = document.createElement('div')
  div.className = 'message'
  div.textContent = text
  messagesEl.appendChild(div)
  messagesEl.scrollTop = messagesEl.scrollHeight
}
