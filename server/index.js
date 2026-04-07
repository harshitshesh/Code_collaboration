const express = require("express")
const app = express()
const http = require('http')

const {Server} = require('socket.io')

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*",
    }
});

let allusers = {}

function allclintsconnectoneid(roomid){
    return Array.from(io.sockets.adapter.rooms.get(roomid) || []).map(
        (socketid)=>{
            return {
               socketid,
               username: allusers[socketid], 
            }
        }
    )
}

io.on('connection', (socket) => {
    socket.on('join', ({roomid, username}) => {
        allusers[socket.id] = username;
        socket.join(roomid);
        let allclints = allclintsconnectoneid(roomid);

        allclints.forEach(({socketid}) => {
            io.to(socketid).emit('joined', {
                allclints,
                username,
                socketid: socket.id
            });
        });
    });

    socket.on('code-change', ({roomid, code}) => {
        socket.in(roomid).emit('code-change', {code});
    });

    socket.on("sync-code", ({socketid, code}) => {
        io.to(socketid).emit("code-change", {code});
    });

    socket.on('send-message', ({roomid, message, username}) => {
        io.in(roomid).emit('receive-message', {message, username, socketid: socket.id});
    });

    socket.on('disconnecting', () => {
        const rooms = [...socket.rooms];
        rooms.forEach((roomid) => {
            socket.in(roomid).emit('disconnected', {
                socketid: socket.id,
                username: allusers[socket.id],
            });
        });
        delete allusers[socket.id];
        socket.leave();
    });
}); 

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

