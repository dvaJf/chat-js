import { createChannel } from './core.js'

function test(name, fn) {
  try {
    fn()
    console.log(`ОК ${name}`)
  } catch (err) {
    console.error(`ОШИБКА ${name}`)
    console.error(err)
  }
}

function expect(value) {
  return {
    toBe(expected) {
      if (value !== expected) {
        throw new Error(`Должно быть ${expected} получили ${value}`)
      }
    },
    toThrow() {
      let thrown = false
      try {
        value()
      } catch {
        thrown = true
      }
      if (!thrown) {
        throw new Error('Должна быть ошибка')
      }
    },
    toBeDefined() {
      if (value === undefined) {
        throw new Error('Значение не опредлено хотя ожидалось что будет определено')
      }
    }
  }
}


test('создание канала', () => {
  const channel = createChannel('1')
  expect(channel).toBeDefined()
  channel.destroy()
})

test('получение сообщения', () => {
  const a = createChannel('2')
  const b = createChannel('2')
  let res = null
  b.onMessage(msg => {
    res = msg
  })
  a.send('123')
  return new Promise(resolve => {
    setTimeout(() => {
      expect(res).toBe('123')
      a.destroy()
      b.destroy()
      resolve()
    }, 10)
  })
})

test('свои сообщения не приходят', () => {
  const channel = createChannel('3')
  let called = false
  channel.onMessage(() => {
    called = true
  })
  channel.send('123')
  return new Promise(resolve => {
    setTimeout(() => {
      expect(called).toBe(false)
      channel.destroy()
      resolve()
    }, 10)
  })
})

test('ошибка в обработчике не ломает остальных', () => {
  const a = createChannel('4')
  const b = createChannel('4')
  let ok = false
  b.onMessage(() => {
    throw new Error('тестовая ошибка')
  })

  b.onMessage(() => {
    ok = true
  })

  a.send('123')

  return new Promise(resolve => {
    setTimeout(() => {
      expect(ok).toBe(true)
      a.destroy()
      b.destroy()
      resolve()
    }, 10)
  })
})

test('send после destroy кидает ошибку', () => {
  const channel = createChannel('5')
  channel.destroy()
  expect(() => channel.send('fail')).toThrow()
})

test('onMessage после destroy кидает ошибку', () => {
  const channel = createChannel('6')
  channel.destroy()
  expect(() => channel.onMessage(() => {})).toThrow()
})
