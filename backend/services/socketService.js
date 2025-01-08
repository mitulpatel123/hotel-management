const jwt = require('jsonwebtoken');

class SocketService {
  constructor() {
    this.io = null;
    this.connectedUsers = new Map();
  }

  initialize(server) {
    this.io = require('socket.io')(server, {
      cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
      }
    });

    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        if (!token) {
          return next(new Error('Authentication error'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.userId = decoded.id;
        socket.userRole = decoded.role;
        next();
      } catch (err) {
        next(new Error('Authentication error'));
      }
    });

    this.io.on('connection', (socket) => {
      console.log(`User connected: ${socket.userId}`);
      this.connectedUsers.set(socket.userId, socket.id);

      // Join rooms based on user role
      if (socket.userRole === 'admin') {
        socket.join('admin');
      }
      socket.join('general');

      socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.userId}`);
        this.connectedUsers.delete(socket.userId);
      });
    });
  }

  // Emit events to all clients
  emitToAll(event, data) {
    if (this.io) {
      this.io.to('general').emit(event, data);
    }
  }

  // Emit events to admin users only
  emitToAdmins(event, data) {
    if (this.io) {
      this.io.to('admin').emit(event, data);
    }
  }

  // Emit events to specific users
  emitToUser(userId, event, data) {
    if (this.io) {
      const socketId = this.connectedUsers.get(userId);
      if (socketId) {
        this.io.to(socketId).emit(event, data);
      }
    }
  }
}

module.exports = new SocketService();
