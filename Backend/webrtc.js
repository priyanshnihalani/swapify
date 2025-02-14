let rooms = {}; // Store active rooms and users

export const setupWebRTC = (io) => {
    io.on("connection", (socket) => {
        console.log(`New user connected: ${socket.id}`);

        let m_roomId = null; // Store room ID for this socket

        // 🟢 User joins a room
        socket.on("join-room", (roomId, host) => {
            console.log(host)
            m_roomId = roomId; // Save roomId for this connection
            console.log(`User ${socket.id} joining room ${roomId}`, host);

            // Ensure room exists
            if (!rooms[roomId]) {
                rooms[roomId] = [];
            }

            // Remove old entry if it exists
            rooms[roomId] = rooms[roomId].filter(user => user.id !== socket.id);

            // Add user
            const user = { ...host, id: socket.id, roomId };
            rooms[roomId].push(user);

            socket.join(roomId);
            console.log(`Users in room ${roomId}:`, rooms[roomId]);

        });

        // 🟢 User is ready
        socket.on("ready", () => {
            if (!m_roomId || !rooms[m_roomId]) return;
            console.log(`User ${socket.id} is ready`);

            socket.emit("user-connected", {
                message: "You have entered the Room",
                users: rooms[m_roomId] || [],
                oneuser: rooms[m_roomId].find(u => u.id === socket.id) || {}

            });

            socket.to(m_roomId).emit("new-join", {
                users: rooms[m_roomId].find(u => u.id === socket.id) || {}
            });
        });

        // 🟢 Handle WebRTC signaling
        socket.on("offer", ({ to, offer }) => {
            io.to(to).emit("offer", { from: socket.id, offer });
        });

        socket.on("answer", ({ to, answer }) => {
            io.to(to).emit("answer", { from: socket.id, answer });
        });

        socket.on("ice-candidate", ({ to, candidate }) => {
            if (to && candidate) {
                io.to(to).emit("ice-candidate", { from: socket.id, candidate });
            }
        });

        socket.on("candidate-received", (data) => {
            io.to(data.receiver).emit("candidate-received");
        });

        // 🔴 End Call and Clean Up
        socket.on("endCall", () => {
            if (!m_roomId) return;

            console.log(`Call ended in room: ${m_roomId}`);
            socket.to(m_roomId).emit("endCall");

            // Remove user from the room
            rooms[m_roomId] = rooms[m_roomId].filter(user => user.id !== socket.id);

            // If room is empty, delete it
            if (rooms[m_roomId].length === 0) {
                delete rooms[m_roomId];
            }

            // Reset room ID for this socket
            m_roomId = null;
        });

        socket.on("screen-share-started", ({ to }) => {
            socket.to(to).emit("receive-screen-share");
        });
        
        socket.on("screen-share-stopped", ({ to }) => {
            socket.to(to).emit("stop-receiving-screen-share");
        });
        
        // 🔴 Handle Disconnection Properly
        socket.on("disconnect", () => {
            console.log(`User disconnected: ${socket.id}`);

            // Remove user from all rooms
            for (const room in rooms) {
                rooms[room] = rooms[room].filter(user => user.id !== socket.id);

                // Delete room if empty
                if (rooms[room].length === 0) {
                    delete rooms[room];
                }
            }

            socket.removeAllListeners();

            console.log("Updated active rooms:", rooms);
        });
    });
};