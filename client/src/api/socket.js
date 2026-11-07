import { io } from 'socket.io-client';

let socket = null;

export const connectSocket = (token) => {
  if (!token) {
    return null;
  }

  if (socket?.connected) {
    return socket;
  }

  if (!socket) {
    const apiEndpoint = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const socketEndpoint = import.meta.env.VITE_SOCKET_URL || apiEndpoint.replace(/\/api\/?$/, '');
    socket = io(socketEndpoint, {
      autoConnect: false,
      auth: {
        token,
      },
    });
  }

  socket.auth = { token };
  socket.connect();
  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};