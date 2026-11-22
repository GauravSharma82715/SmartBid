import { io } from 'socket.io-client';

const SOCKET_SERVER_URL =
  process.env.NODE_ENV === 'production'
    ? window.location.origin
    : 'http://localhost:5000';

export const socket = io(SOCKET_SERVER_URL, {
  autoConnect: true,
  transports: ['websocket', 'polling']
});

export default socket;
