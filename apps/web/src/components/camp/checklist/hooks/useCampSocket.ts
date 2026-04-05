'use client';

import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import type { Socket } from 'socket.io-client';
import { SocketEvents } from '@campus/shared';
import { getSocket, disconnectSocket } from '@/lib/socket';

interface UseCampSocketResult {
  socket: Socket | null;
  socketId: string | null;
}

export function useCampSocket(campId: string): UseCampSocketResult {
  const { getToken } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [socketId, setSocketId] = useState<string | null>(null);
  const campIdRef = useRef(campId);
  campIdRef.current = campId;

  useEffect(() => {
    let mounted = true;

    async function connect() {
      const token = await getToken();
      if (!token || !mounted) return;

      const sock = getSocket(token);

      sock.on('connect', () => {
        if (!mounted) return;
        setSocketId(sock.id ?? null);
        sock.emit(SocketEvents.JOIN_CAMP, { campId: campIdRef.current });
      });

      sock.on('reconnect', async () => {
        // 재연결 시 새 토큰으로 갱신 후 다시 join
        const freshToken = await getToken();
        if (freshToken) {
          sock.auth = { token: freshToken };
        }
        sock.emit(SocketEvents.JOIN_CAMP, { campId: campIdRef.current });
      });

      sock.on('connect_error', async (err) => {
        if (err.message?.includes('auth') || err.message?.includes('unauthorized')) {
          const freshToken = await getToken();
          if (freshToken) {
            sock.auth = { token: freshToken };
            sock.connect();
          }
        }
      });

      if (sock.connected) {
        setSocketId(sock.id ?? null);
        sock.emit(SocketEvents.JOIN_CAMP, { campId });
      }

      setSocket(sock);
    }

    connect();

    return () => {
      mounted = false;
      if (socket) {
        socket.emit(SocketEvents.LEAVE_CAMP, { campId });
      }
      disconnectSocket();
      setSocket(null);
      setSocketId(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campId]);

  return { socket, socketId };
}
