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
let roomControllers = {}; // { roomid: { current: socketid, order: [socketids] } }
let publicUsers = {}; // { socket.id: { username, lat, lng, socketid } }

// Helper function for Geolocation Distance Calculation (Haversine formula) in meters
function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // metres
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // in metres
}

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
    // --- PRIVATE ROOM LOGIC ---
    socket.on('join', ({roomid, username, isHost}) => {
        allusers[socket.id] = username;
        socket.join(roomid);
        
        if (!roomControllers[roomid]) {
            roomControllers[roomid] = { current: null, order: [] };
        }
        roomControllers[roomid].order.push(socket.id);

        if (isHost || !roomControllers[roomid].current) {
            roomControllers[roomid].current = socket.id;
        }

        let allclints = allclintsconnectoneid(roomid);

        allclints.forEach(({socketid}) => {
            io.to(socketid).emit('joined', {
                allclints,
                username,
                socketid: socket.id
            });
        });

        io.to(roomid).emit('controller-changed', { controllerId: roomControllers[roomid].current });
    });

    socket.on('pass-control', ({ roomid, targetId }) => {
        let rc = roomControllers[roomid];
        if (rc && rc.current === socket.id) {
            rc.current = targetId;
            io.to(roomid).emit('controller-changed', { controllerId: rc.current });
        }
    });

    socket.on('code-change', ({roomid, code}) => {
        socket.in(roomid).emit('code-change', {code});
    });

    socket.on("sync-code", ({socketid, code}) => {
        io.to(socketid).emit("code-change", {code});
    });

    socket.on('language-change', ({roomid, language}) => {
        socket.in(roomid).emit('language-change', {language});
    });

    socket.on('terminal-output', ({roomid, output}) => {
        socket.in(roomid).emit('terminal-output', {output});
    });

    socket.on('execute-code', ({roomid, code, language}) => {
        const { exec } = require('child_process');
        const fs = require('fs');
        const path = require('path');
        
        const fileExt = {
            'javascript': 'js',
            'python': 'py',
            'cpp': 'cpp',
            'java': 'java'
        }[language] || 'txt';

        const runCmd = {
            'javascript': 'node',
            'python': 'python',
            'cpp': 'g++',
            'java': 'java' // Usually requires compiled class, keeping simple here
        }[language];

        const tempFile = path.join(__dirname, `temp_${Date.now()}.${fileExt}`);
        
        fs.writeFile(tempFile, code, (err) => {
            if (err) {
                io.to(socket.id).emit('execution-result', { out: '', err: 'Failed to create temp file on server.' });
                return;
            }

            let command = `${runCmd} ${tempFile}`;
            if (language === 'cpp') {
               command = `g++ ${tempFile} -o ${tempFile}.exe && ${tempFile}.exe`;
            }

            exec(command, { timeout: 5000 }, (error, stdout, stderr) => {
                io.to(socket.id).emit('execution-result', { out: stdout || '', err: stderr || (error ? error.message : '') });
                
                // Cleanup temp files
                fs.unlink(tempFile, () => {});
                if (language === 'cpp') fs.unlink(`${tempFile}.exe`, () => {});
            });
        });
    });

    socket.on('send-message', ({roomid, message, username}) => {
        io.in(roomid).emit('receive-message', {message, username, socketid: socket.id});
    });


    // --- PUBLIC ROOM LOGIC (<100m) ---
    socket.on('join-public', ({ username, lat, lng }) => {
        publicUsers[socket.id] = { username, lat, lng, socketid: socket.id };
        socket.join('public_global');

        const nearbyUsers = [];
        for (let id in publicUsers) {
            if (id !== socket.id) {
                let u = publicUsers[id];
                let dist = getDistance(lat, lng, u.lat, u.lng);
                if (dist <= 100) {
                    nearbyUsers.push(u);
                    // Notify them about us
                    io.to(id).emit('public-user-joined', { user: publicUsers[socket.id] });
                }
            }
        }

        socket.emit('public-joined', { nearbyUsers: nearbyUsers.concat(publicUsers[socket.id]), user: publicUsers[socket.id] });
    });

    socket.on('send-public-message', ({ message, username }) => {
        let sender = publicUsers[socket.id];
        if (!sender) return;

        for (let id in publicUsers) {
            let u = publicUsers[id];
            let dist = getDistance(sender.lat, sender.lng, u.lat, u.lng);
            if (dist <= 100) {
                io.to(id).emit('receive-public-message', { message, username, socketid: socket.id });
            }
        }
    });

    // --- DISCONNECT LOGIC ---
    socket.on('disconnecting', () => {
        // Private rooms
        const rooms = [...socket.rooms];
        rooms.forEach((roomid) => {
            if (roomid !== 'public_global') {
                let rc = roomControllers[roomid];
                if (rc) {
                    rc.order = rc.order.filter(id => id !== socket.id);
                    if (rc.current === socket.id) {
                        // Pass to oldest in order
                        rc.current = rc.order.length > 0 ? rc.order[0] : null;
                        if (rc.current) {
                            io.to(roomid).emit('controller-changed', { controllerId: rc.current });
                        } else {
                            delete roomControllers[roomid];
                        }
                    }
                }

                socket.in(roomid).emit('disconnected', {
                    socketid: socket.id,
                    username: allusers[socket.id],
                });
            }
        });

        // Public rooms
        if (publicUsers[socket.id]) {
            let leaver = publicUsers[socket.id];
            for (let id in publicUsers) {
                if (id !== socket.id) {
                    let u = publicUsers[id];
                    let dist = getDistance(leaver.lat, leaver.lng, u.lat, u.lng);
                    if (dist <= 100) {
                        io.to(id).emit('public-disconnected', { socketid: socket.id, username: leaver.username });
                    }
                }
            }
            delete publicUsers[socket.id];
        }

        delete allusers[socket.id];
        socket.leave();
    });
}); 

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
