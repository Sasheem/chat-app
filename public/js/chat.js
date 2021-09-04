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

// listen for when user clicks submit button
document.querySelector('#share-location').addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser')
    }

    navigator.geolocation.getCurrentPosition((position) => {
        const { longitude, latitude } = position.coords
        socket.emit('sendLocation', { longitude, latitude })
    })
})