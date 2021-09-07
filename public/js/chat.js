const socket = io()

// elements
const $messageForm = document.querySelector('#message-form')
const $messageInput = $messageForm.querySelector('input')
const $messageButton = $messageForm.querySelector('button')
const $locationButton = document.querySelector('#share-location')
const $messages = document.querySelector('#messages')

// templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#location-template').innerHTML

// listen for message from server
// add message template to the screen
socket.on('message', (message) => {
    const html = Mustache.render(messageTemplate, { message })
    $messages.insertAdjacentHTML('beforeend', html)
})

// listen for locationMessage from server
// add location template to the screen
socket.on('locationMessage', (url) => {
    console.log(url)
    const html = Mustache.render(locationMessageTemplate, { url })
    $messages.insertAdjacentHTML('beforeend', html)
})

// listen for when the user submtis form
$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()

    // disable button
    $messageButton.setAttribute('disabled', 'disabled')

    // send message from form to server
    const message = e.target.elements.message.value
    socket.emit('sendMessage', message, (error) => {
        // reset form
        $messageButton.removeAttribute('disabled')
        $messageInput.value = ''
        $messageInput.focus()

        // error message handling
        error ? console.log(error) : console.log('Message delivered')
    })
})

// listen for when user clicks submit button
$locationButton.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser')
    }

    // disable button
    $locationButton.setAttribute('disabled', 'disabled')

    // async method - get location via mdn geolocation
    navigator.geolocation.getCurrentPosition((position) => {
        const { longitude, latitude } = position.coords
        socket.emit('sendLocation', { longitude, latitude }, () => {

            // enable button
            $locationButton.removeAttribute('disabled')
            console.log('Location shared')
        })
    })
})