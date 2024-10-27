const express = require('express');
const app = express();
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const ACTIONS = require('./src/Action');

const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('build'));
app.use((req, res, next) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const userSocketMap = {};

function getAllConnectedClients(roomId) {
    return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map((socketId) => {
        return {
            socketId,
            username: Object.keys(userSocketMap).find((key) => userSocketMap[key].includes(socketId)),
        };
    });
}

io.on('connection', (socket) => {
    console.log('socket connected', socket.id);

    socket.on(ACTIONS.JOIN, ({ roomId, username }) => {
        // Check if the user is already connected in the room
        const existingClient = getAllConnectedClients(roomId).find(
            (client) => client.username === username
        );

        // If found, disconnect the existing connection for the same username
        if (existingClient) {
            io.sockets.sockets.get(existingClient.socketId)?.disconnect();
            console.log(`Disconnected previous connection for ${username} in room ${roomId}`);
        }

        // Register the new connection
        if (!userSocketMap[username]) {
            userSocketMap[username] = [];
        }
        userSocketMap[username].push(socket.id);
        socket.join(roomId);

        const clients = getAllConnectedClients(roomId);
        console.log(clients);

        // Notify all clients in the room
        clients.forEach(({ socketId }) => {
            io.to(socketId).emit(ACTIONS.JOINED, {
                clients,
                username,
                socketId: socket.id,
            });
        });
    });

    socket.on(ACTIONS.CODE_CHANGE, ({ roomId, code }) => {
        socket.in(roomId).emit(ACTIONS.CODE_CHANGE, { code });
    });

    socket.on(ACTIONS.SYNC_CODE, ({ socketId, code }) => {
        io.to(socketId).emit(ACTIONS.CODE_CHANGE, { code });
    });

    socket.on('disconnecting', () => {
        const rooms = [...socket.rooms];
        rooms.forEach((roomId) => {
            socket.in(roomId).emit(ACTIONS.DISCONNECTED, {
                socketId: socket.id,
                username: Object.keys(userSocketMap).find((key) => userSocketMap[key].includes(socket.id)),
            });
        });

        // Remove socket ID from userSocketMap
        for (const [username, socketIds] of Object.entries(userSocketMap)) {
            const index = socketIds.indexOf(socket.id);
            if (index !== -1) {
                socketIds.splice(index, 1);
                // Delete the username entry if no sockets remain
                if (socketIds.length === 0) {
                    delete userSocketMap[username];
                }
                break;
            }
        }
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Listening on port ${PORT}`));
