const users = []

// addUser - start tracking user when they enter room
const addUser = ({ id, username, room }) => {
    // clean the data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    // validate the data
    if(!username || !room) {
        return {
            error: 'Username and room are required.'
        }
    }

    // check for existing user
    const existingUser = users.find((user) => {
        return user.room === room && user.username === username
    })

    // validate username
    if (existingUser) {
        return {
            error: 'Username is in use.'
        }
    }

    // store user
    const user = { id, username, room }
    users.push(user)
    return { user }
}

// removeUser - stop tracking user when they leave room
const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id)

    // -1 if no match, 0 or more if found match
    if (index !== -1) {
        return users.splice(index, 1)[0]
    }
}

// getUser - fetch an existing user's data
// accept id and return user object (or undefined)
const getUser = (id) => {
    return users.find((user) => user.id === id)
}

// getUsersInRoom - fetch all users in a room
// accept room name and return array of users (or empty array)
const getUsersInRoom = (room) => {
    if (users.length !== 0) {
        const usersInRoom = users.filter((user) => user.room === room)
        return usersInRoom.length === 0 ? [] : usersInRoom
    }
    return []
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}