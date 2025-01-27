
export default function Chat(io) {

    const users = {}

    io.on('connection', (socket) => {
        console.log('User is Connected in Chat room')

        socket.on('login', (id) => {
            if(id){
                users[id] = {socketId: socket.id, status: "online"}
            }
            console.log(`${id} is online`)
            console.log(users)
        })

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

          socket.on('send-message', (receiverId, message) => {
            console.log(`${message} sent to ${receiverId}`)
            if (users[receiverId]) {
                io.to(users[receiverId].socketId).emit('receive-message', message);
                io.to('6794f948273877543780ef48').emit('message')
                console.log('Message sent to:', users[receiverId].socketId);
            }
        });

        socket.on('disconnect', () => {
            console.log("User is Disconnected")
        })
    })
} 