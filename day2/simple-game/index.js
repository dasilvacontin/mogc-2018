// Setup basic express server
var express = require('express')
var app = express()
var path = require('path')
var server = require('http').createServer(app)
var io = require('socket.io')(server)
var port = process.env.PORT || 3000

server.listen(port, () => {
  console.log('Server listening at port %d', port)
})

// Routing
app.use(express.static(path.join(__dirname, 'public')))

const state = {
  players: [],
  enemies: [],
  coins: []
}

const WORLD_WIDTH = 400
const WORLD_HEIGHT = 400

function reset () {
  const { players, enemies, coins } = state
  // const players = state.players

  players.forEach(player => {
    player.x = Math.random() * WORLD_WIDTH
    player.y = Math.random() * WORLD_HEIGHT
    player.score = 0
  })

  enemies.forEach(enemy => {
    enemy.x = Math.random() * WORLD_WIDTH
    enemy.y = Math.random() * WORLD_HEIGHT
  })

  while (coins.length) coins.pop()
  while (coins.length < 10) {
    coins.push({
      x: Math.random() * WORLD_WIDTH,
      y: Math.random() * WORLD_HEIGHT,
      size: Math.random() * 15 + 5
    })
  }
}
reset()

function collides (obj1, obj2) {
  return !(obj1.x + obj1.size / 2 < obj2.x - obj2.size / 2 ||
    obj2.x + obj2.size / 2 < obj1.x - obj1.size / 2 ||
    obj1.y + obj1.size / 2 < obj2.y - obj2.size / 2 ||
    obj2.y + obj2.size / 2 < obj1.y - obj1.size / 2)
}

function logic () {
  setTimeout(logic, 16)

  const { players, enemies, coins } = state

  // player movement
  players.forEach(player => {
    if (player.dead) return

    const { keyboard } = player
    if (keyboard.left) player.x--
    if (keyboard.right) player.x++
    if (keyboard.up) player.y--
    if (keyboard.down) player.y++
  })

  // enemy logic + render
  enemies.forEach(enemy => {
    enemy.x += enemy.vx
    enemy.y += enemy.vy

    if (enemy.x < 0 || enemy.x > WORLD_WIDTH) enemy.vx *= -1
    if (enemy.y < 0 || enemy.y > WORLD_HEIGHT) enemy.vy *= -1

    players.forEach(player => {
      if (collides(player, enemy)) {
        player.dead = true
      }
    })
  })

  // coins logic
  coins.forEach((coin, i) => {
    players.forEach(player => {
      if (collides(player, coin)) {
        player.score += Math.ceil(coin.size)
        coins.splice(i, 1)
      }
    })
  })

  io.sockets.emit('state', state)
}
logic()

io.on('connection', (socket) => {
  console.log('player connected')

  const player = {
    x: Math.random() * WORLD_WIDTH,
    y: Math.random() * WORLD_HEIGHT,
    size: 20,
    id: socket.id,
    keyboard: {},
    score: 0
  }

  state.players.push(player)

  socket.on('input', function (keyboard) {
    console.log('got player input', keyboard)
    player.keyboard = keyboard
  })
})
