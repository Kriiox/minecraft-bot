const mineflayer = require('mineflayer')
const pvp = require('mineflayer-pvp').plugin
const { pathfinder, goals, Movements } = require('mineflayer-pathfinder')
const armorManager = require('mineflayer-armor-manager')
const GoalFollow = goals.GoalFollow
var config = require('./config.json')[1]

const bot = mineflayer.createBot({
    host: config.server,
    port: config.port,
    username: config.username,
    version: "1.20.1",
    auth: "microsoft"
})

// Variable
const isFight = false
let mcData

// Load plugins
bot.loadPlugin(pvp)
bot.loadPlugin(armorManager)
bot.loadPlugin(pathfinder)

bot.on('inject_allowed', () => {
    mcData = require('minecraft-data')(bot.version)
})

bot.on('physicTick', lookAtNearestPlayer)

bot.on('playerCollect', (collector, itemDrop) => {
    if (collector !== bot.entity) return

    setTimeout(() => {
        const sword = bot.inventory.items().find(item => item.name.includes('sword'))
        if (sword) bot.equip(sword, 'hand')
    }, 150)
})

bot.on('playerJoined', (player) => {
    if (player.username === bot.username) {
        console.log(`${bot.username} est connecté au serveur !`)
        return
    } else {
        bot.chat(getJoinMessage(player.username))
    }
})

bot.on('playerLeft', (player) => {
    if (player.username === bot.username) return
    const randomNum = Math.floor(Math.random() * 3)
    if (randomNum === 1) {
        bot.chat("J'ai cru qu'il ne partirait jamais.")
    }
})

bot.on('whisper', (username, message) => {
    if (username === bot.username) return
    if (username === config.owner) {
        bot.chat(message)
    } else {
        bot.chat(`${username} a essayé de communiquer avec moi en privé. Je cite:`)
        bot.chat(`${username}: "${message}"`)
    }
})

bot.on('chat', function (username, message) {

    if (username === bot.username) return

    if (message.includes('suce')) {
        bot.chat("Il a dit suce lol")
    }

    if (message.includes('pol') || message.includes('paul')) {
        bot.chat("ahahah il a dit paul")
    }

    var msgSplit = message.split(" ")
    if (msgSplit[0] != bot.username) return

    switch (msgSplit[1]) {
        case 'come':
            followPlayer(true, username)
            break;
        case 'stay':
            followPlayer(false, username)
            break;
        case 'stop':
            stopFight(username)
            break;
        case 'sleep':
            goToSleep()
            break
        case 'wakeup':
            wakeUp()
            break

        default:
            break;
    }

    if (message.includes(`${bot.username} fight`)) {
        if (!verifIfYouAreOwner(username)) return
        fightWith(message)
    }
})

// bot.on('entitySleep', (entity) => {
//     if (entity.username === bot.username) return
//     goToSleep()
// })

function getJoinMessage(username) {
    const randomNum = Math.floor(Math.random() * 8)
    switch (randomNum) {
        case 0:
            return `Allo ${username} !`
            break;
        case 1:
            return `Ah t'es là toi ${username} !`
            break;
        case 2:
            return `Ca serait pas un wati bg ${username} !`
            break;
        case 3:
            return `Tiens, voilà la grosse ${username} !`
            break;
        case 4:
            return `Yo, en forme ${username} ?`
            break;
        case 5:
            return `Vla ti pas ${username}, quel crack !`
            break;
        case 6:
            return `Bonsoir Pariiiis, ça va ${username} ?`
            break;
        case 7:
            return `J'ai chié dans mon ben, oh salut ${username} ?`
            break;

        default:
            break;
    }
}

function goToSleep() {
    const worldTime = bot.time.timeOfDay;
    console.log(worldTime)
    const isNight = worldTime >= 13000 && worldTime <= 23000;

    if (!isNight) {
        bot.chat("Ce n'est pas l'heure de dormir.");
        return;
    }

    const bed = bot.findBlock({
        matching: mcData.blocksByName.brown_bed.id
    })

    if (bed) {
        bot.sleep(bed, (err) => {
            if (err) {
                bot.chat(`Je ne peut pas dormir: ${err.message}`)
            } else {
                bot.chat("ZzZZz")
            }
        })
    } else {
        bot.chat("il n'y a pas de lit.")
        return
    }
}

function wakeUp() {
    bot.wake((err) => {
        if (err) {
            bot.chat(`I can't wake up: ${err.message}`)
        } else {
            bot.chat('Je suis sorti du lit.')
        }
    })
}

function lookAtNearestPlayer() {
    const playerFilter = (entity) => entity.type === 'player'
    const playerEntity = bot.nearestEntity(playerFilter)

    if (!playerEntity) return

    const pos = playerEntity.position.offset(0, playerEntity.height, 0)
    bot.lookAt(pos)
}

function followPlayer(isFollow, username) {
    const target = bot.players[username] ? bot.players[username].entity : null

    if (!target) {
        bot.chat(`Je ne te vois pas !`)
        return
    }

    if (!verifIfYouAreOwner(username)) return

    const movements = new Movements(bot, mcData)
    movements.scafoldingBlocks = []
    movements.allow1by1towers = false
    movements.canDig = false
    movements.allowSprinting = true

    bot.pathfinder.setMovements(movements)
    bot.pathfinder.setGoal(new GoalFollow(target, 1), isFollow)
    if (isFollow) {
        bot.chat(`J'arrive grand maître !`)
    } else {
        bot.chat(`Je reste ici.`)
    }
}

function verifIfYouAreOwner(username) {
    if (username != 'Kriiox') {
        bot.chat(`Désolé ${username}, je ne répond qu'à mon maître, le grand Kriiox.`)
        return false
    } else {
        return true
    }
}

function fightWith(message) {
    var msgSplit = message.split(" ")
    const target = msgSplit[msgSplit.length - 1]
    const player = bot.players[target]

    bot.pvp.movements.scafoldingBlocks = []
    bot.pvp.movements.allow1by1towers = false
    bot.pvp.movements.canDig = false
    bot.pvp.movements.allowSprinting = true

    if (!player) {
        bot.chat('Elle est où la tapette ?')
        return
    }

    bot.chat('Je suis prêt pour le fight !')
    this.isFight = true
    bot.pvp.attack(player.entity)
}

function stopFight(username) {
    if (!verifIfYouAreOwner(username)) return

    if (this.isFight) {
        bot.chat("J'arrete chef !")
        bot.pvp.attack(null)
    } else {
        bot.chat("Je n'ai attaqué personne !")
    }
}