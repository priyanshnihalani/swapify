export default function Chat(io, db, ObjectId) {
    const users = {};

    io.on('connection', (socket) => {
        console.log('User is Connected in Chat room');

        socket.on('login', (id) => {
            if (id) {
                users[id] = { socketId: socket.id, status: "online" };
                // Broadcast status change to all connected clients
                io.emit('userStatusChange', { userId: id, status: 'online' });
            }
            console.log(`${id} is online`);
            console.log('Current users:', users);
        });

        socket.on("getStatus", (targetUserId) => {
            const targetUser = users[targetUserId];
            if (targetUser) {
                io.to(socket.id).emit("status", {
                    userId: targetUserId,
                    status: targetUser.status || "offline",
                });
            } else {
                io.to(socket.id).emit("status", {
                    userId: targetUserId,
                    status: "offline",
                });
            }
        });

        socket.on('send-message', async (senderId, receiverId, message) => {
            console.log(`Message "${message}" sent to ${receiverId}`);
            if (users[receiverId]) {
                const record = await db.collection('users').find({
                    "_id": new ObjectId(receiverId),
                    "$or": [
                        { "BlockUsers": { "$eq": [] } },
                        { "BlockUsers": { "$exists": false } },
                        { "BlockUsers": { "$nin": [senderId] } }
                    ]
                }).toArray();

                console.log(record)
                if (record.length > 0) {
                    io.to(users[receiverId].socketId).emit('receive-message', message);
                }
                console.log('Message sent to socket:', users[receiverId].socketId);
            } else {
                console.log('Receiver not found or offline:', receiverId);
            }
        });

        socket.on('disconnect', () => {
            // Find and remove the disconnected user
            const userId = Object.keys(users).find(key => users[key].socketId === socket.id);
            if (userId) {
                delete users[userId];
                // Broadcast status change to all connected clients
                io.emit('userStatusChange', { userId, status: 'offline' });
            }
            console.log("User is Disconnected");
            console.log('Remaining users:', users);
        });
    });
}