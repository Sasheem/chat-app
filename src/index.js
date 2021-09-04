// set up express server
const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))

// listen for user connecting to server
io.on('connection', (socket) => {
    console.log(`New WebSocket connection`)
    socket.emit('message', 'Welcome!')

    // emit message to all users except the one joining
    socket.broadcast.emit('message', 'A new user has joined!')

    // listen for sendMessage event and emit that message to all connected users
    socket.on('sendMessage', (message) => {
        io.emit('message', message)
    })
    

    // use on() within a on('connection') to run code upon a user disconnecting
    socket.on('disconnect', () => {
        io.emit('message', 'A user has left!')
    })
})

server.listen(port, () => {
    console.log(`Server is up on port ${port}!`)
})