import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      // Initialize socket connection
      const newSocket = io('http://localhost:5000', {
        auth: {
          token: localStorage.getItem('token')
        }
      });

      // Socket event listeners
      newSocket.on('connect', () => {
        console.log('Connected to WebSocket');
      });

      newSocket.on('connect_error', (error) => {
        console.error('WebSocket connection error:', error);
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from WebSocket');
      });

      setSocket(newSocket);

      // Cleanup on unmount
      return () => {
        newSocket.close();
      };
    } else {
      // Close socket when user logs out
      if (socket) {
        socket.close();
        setSocket(null);
      }
    }
  }, [user]);

  const subscribeToEvent = (event, callback) => {
    if (socket) {
      socket.on(event, callback);
      return () => socket.off(event, callback);
    }
    return () => {};
  };

  const emitEvent = (event, data) => {
    if (socket) {
      socket.emit(event, data);
    }
  };

  const value = {
    socket,
    subscribeToEvent,
    emitEvent
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export default SocketContext;
