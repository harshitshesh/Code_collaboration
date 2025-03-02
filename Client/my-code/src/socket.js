import { io } from 'socket.io-client'

export const initsocket = async ()=>{
  
    const option = {
        'force new connection': true,
        reconnectionAttempt: 'infinity',
        timeout: 10000,
        transports: ['websocket'],
    }
    return io("http://localhost:5000", option)
}