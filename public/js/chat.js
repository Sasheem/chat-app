const socket = io()

socket.on('message', (message) => {
    console.log(message)
})

// listen for when the user submtis form
document.querySelector('#message-form').addEventListener('submit', (e) => {
    e.preventDefault()

    // send message from form to server
    const message = e.target.elements.message.value
    socket.emit('sendMessage', message)
})