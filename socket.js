const socketIo = require('socket.io');

// In-memory store for user ID to socket ID mappings
const userSocketMap = new Map();

let io;

const initializeSocket = (server) => {
    io = new socketIo.Server(server, {
        cors: {
            origin: "http://localhost:5173",
            methods: ["GET", "POST"]
        }
    });

    io.on('connection', (socket) => {
        console.log('A user connected', socket.id);
        socket.on('authenticated', (userId) => {
            userSocketMap.set(userId, socket.id);
            console.log(`User ${userId} registered with socket ID ${socket.id}`);
        });
        socket.on('disconnect', () => {
            console.log('A user disconnected', socket.id);
            // Remove the user ID to socket ID mapping from the in-memory store
            for (const [userId, socketId] of userSocketMap.entries()) {
                if (socketId === socket.id) {
                    userSocketMap.delete(userId);
                    break;
                }
            }
        });
    });

};

module.exports = { initializeSocket, userSocketMap, getIo: () => io };
