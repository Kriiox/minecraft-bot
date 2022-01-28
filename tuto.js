const mineflayer = require('mineflayer')
const pvp = require('mineflayer-pvp').plugin
const { pathfinder, goals, Movements } = require('mineflayer-pathfinder')
const armorManager = require('mineflayer-armor-manager')

const bot = mineflayer.createBot({
  host: 'localhost',
  port: 50910,
  username: 'PatrickS12',
  // password: 'Atrixxi1212!'
})

let mcData
bot.on('inject_allowed', () => {
  mcData = require('minecraft-data')(bot.version)
})

bot.on('entitySleep', (entity) => {
  goToSleep()
})

bot.on('chat', (username, message) => {
  if (username === bot.username) return
  switch (message) {
    case 'sleep':
      goToSleep()
      break
    case 'wakeup':
      wakeUp()
      break
  }
})

bot.on('sleep', () => {
  bot.chat('Good night!')
})
bot.on('wake', () => {
  bot.chat('Good morning!')
})

function goToSleep() {
  const bed = bot.findBlock({
    matching: mcData.blocksByName.white_bed.id
  })

  if (bed) {
    bot.sleep(bed, (err) => {
      if (err) {
        bot.chat(`I can't sleep: ${err.message}`)
      } else {
        bot.chat("ZzZZz")
      }
    })
  } else {
    bot.chat('No nearby bed')
  }
}

function wakeUp() {
  bot.wake((err) => {
    if (err) {
      bot.chat(`I can't wake up: ${err.message}`)
    } else {
      bot.chat('I woke up')
    }
  })
}