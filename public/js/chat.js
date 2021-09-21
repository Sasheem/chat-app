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
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

// perform auto scroll to newest message if user isn't looking at old messages
const autoscroll = () => {
    // new messages element
    const $newMessage = $messages.lastElementChild

    // height of new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin
    console.log(newMessageMargin)

    // visible height
    const visibleHeight = $messages.offsetHeight

    // height of messages container
    // scrollHeight attr gives us the height we are able to scroll through
    const contentHeight = $messages.scrollHeight

    // calculate how far down we have scrolled
    // how far have I scrolled?
    // scrollTop attr gives us the amount of distance user has scroll from away from the top of interface
    // ie the top of the screen to the top of the scroll bar
    // then add visibleHeight to get the remaining distance to the bottom of the screen
    const scrollOffset = $messages.scrollTop + visibleHeight

    // perform conditional logic to figure out if we should auto scroll or not
    // take total container height (not just what is visible) and subtract the last message from that
    if (contentHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }

}

// listen for message from server
// add message template to the screen
socket.on('message', (message) => {
    const html = Mustache.render(messageTemplate, { 
        username: message.username,
        message: message.text, 
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

// listen for locationMessage from server
// add location template to the screen
socket.on('locationMessage', (message) => {
    
    const html = Mustache.render(locationMessageTemplate, {
        username: message.username, 
        url: message.url,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

// listen for roomData event from server
socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })

    // select div to load room data into and load template into it
    document.querySelector('#sidebar').innerHTML = html
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

// emit event for server to listen for
// join user to a room
// needs validation
// 3rd arg = acknowledgement callback, server runs this as callback()
socket.emit('join', { username, room }, (error) => {
    // CONTINUE HERE
    if (error) {
        alert(error)
        location.href = ''
    }
})