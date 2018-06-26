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

// app.get('/socket.io/socket.io.js', func)

// Routing
app.use(express.static(path.join(__dirname, 'public')))

// let connectionsSoFar = 0

const sockets = []

io.on('connection', (socket) => {
//   console.log('there was connection')
//   connectionsSoFar++

//   socket.emit('hello', connectionsSoFar)

//   socket.on('ok', function () {
//     console.log('client sent ok')
//   })

  sockets.push(socket)
  let username

  socket.on('im', function (_username) {
    username = _username
  })

  socket.on('msg', function (msg) {
    sockets.forEach(socket => {
      socket.emit(
        'msg',
        `${username}: ${msg}`
      )
    })
    // io.sockets.broadcast.emit()
  })

  socket.on('disconnect', function () {
    sockets.splice(sockets.find(socket), 1)
  })

})
