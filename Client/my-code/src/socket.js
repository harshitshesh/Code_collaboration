import { io } from 'socket.io-client'

export const initsocket = async () => {
    const options = {
        'force new connection': true,
        reconnectionAttempts: Infinity,
        timeout: 10000,
        transports: ['polling', 'websocket'],
    }
    const backendUrl = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";
    return io(backendUrl, options)
}