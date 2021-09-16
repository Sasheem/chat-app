// set up express server
const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage, generateLocation } = require('./utils/messages')
const { addUser, removeUser, getUsersInRoom, getUser } = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))

// listen for user connecting to server
io.on('connection', (socket) => {
    console.log(`New WebSocket connection`)
    

    // LISTENER: listen for join evnt from client
    socket.on('join', (userInfo, callback) => {
        // add user to the room
        const { error, user } = addUser({ id: socket.id, ...userInfo })

        // check if the destructured error exists
        // fire callback function supplied from client
        if (error) {
            return callback(error)
        }

        // if no error then user was successfully added
        socket.join(user.room)
        socket.emit('message', generateMessage('Welcome!'))

        // emit message to all users except the one joining
        socket.broadcast.to(user.room).emit('message', generateMessage(`${user.username} has joined!`))
        callback()
    })

    // LISTENER: listen for sendMessage event and emit that message to all connected users
    socket.on('sendMessage', (message, callback) => {
        const trim = message.trim()
        const filter = new Filter()

        // check if message exists
        if (message === "") {
            return callback('Enter a message')
        }
 
        // check message for profanity
        if (filter.isProfane(trim)) {
            // deliver error message as acknowledgement to client
            return callback('Profanity is not allowed')
        }
        // send out message to all client users connected to server
        io.to('anime').emit('message', generateMessage(trim))
        // deliver empty param so callback knows acknowledgement is successful
        callback()
    })

    // LISTENER: listen for sendLocation event and emit that message to all connected users
    socket.on('sendLocation', (coords, callback) => {
        const {latitude, longitude } = coords

        io.emit('locationMessage', generateLocation(`https://google.com/maps?q=${latitude},${longitude}`))
        callback()
    })
    

    // LISTENER: use on() within a on('connection') to run code upon a user disconnecting
    socket.on('disconnect', () => {
        const user = removeUser(socket.id)

        if (user) {
            io.to(user.room).emit('message', generateMessage(`${user.username} has left.`))
        }
    })
})

server.listen(port, () => {
    console.log(`Server is up on port ${port}!`)
})