import { io, Socket } from 'socket.io-client';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? 'http://localhost:4100';

let socket: Socket | null = null;

export function getSocket(getToken: () => Promise<string | null>): Socket {
  if (socket) return socket;

  socket = io(WS_URL, {
    auth: (cb: (data: { token: string }) => void) => {
      getToken().then((token) => cb({ token: token ?? '' }));
    },
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
  });

  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
