
let users = []; // Change 'user' to 'users' to track users by socket.id
let connections = {}

import exec from 'child_process'

export const setupWebRTC = (io) => {

    io.on("connection", (socket) => {
        console.log(`New user connected: ${socket.id}`);

        let m_roomId;

        socket.on("join-room", (roomId, host) => {
            m_roomId = roomId;
            console.log(`User ${socket.id} joining room ${roomId}`, host);
            connections = { ...host, id: socket.id, roomId }
            console.log(connections)
            socket.join(roomId);
            let { name } = connections;
            let userExist = users.some(user => user.id == socket.id)


            if (!userExist) {
                users.push(connections)
            }


            console.log(socket.id)


        });

        socket.on('ready', () => {
            console.log(`User ${socket.id} is ready`);

            socket.emit("user-connected", {
                message: "You have entered in the Room",
                users: users
            });
            socket.to(m_roomId).emit('new-join', {
                users: { ...connections },
            })

        });

        socket.on('offer', ({ to, offer }) => {
            console.log(`Offer from ${socket.id} to ${to}`);
            io.to(to).emit('offer', { from: socket.id, offer });
        });

        socket.on('answer', ({ to, answer }) => {
            console.log(`Answer from ${socket.id} to ${to}`);
            io.to(to).emit('answer', { from: socket.id, answer });
        });

        socket.on("ice-candidate", ({ to, candidate }) => {
            if (to && candidate) {
                console.log(`ICE candidate from ${socket.id} to ${to}:`, {
                    type: candidate.type,
                    sdpMid: candidate.sdpMid,
                    sdpMLineIndex: candidate.sdpMLineIndex
                });
                io.to(to).emit("ice-candidate", {
                    from: socket.id,
                    candidate
                });
            } else {
                console.log(`Invalid ICE candidate data from ${socket.id}:`, { to, candidate });
            }
        });

        socket.on('candidate-received', (data) => {
            io.to(data.receiver).emit('candidate-received')
        })


        socket.on('endCall', () => {
            socket.to(m_roomId).emit('endCall');
        
            users = users.filter(user => user.roomId !== m_roomId);
        
            console.log(`Call ended in room: ${m_roomId}`);
        });

        socket.on("disconnect", () => {
            users = users.filter(user => user.id !== socket.id);
            console.log(`Disconnect: ${users.map((item) => item.id)}`)
        });
    })
}