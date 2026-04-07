'use client';

import { useEffect, useState } from 'react';
import type { Socket } from 'socket.io-client';
import { SocketEvents } from '@campus/shared';
import { useSocket } from '@/components/ui/SocketProvider';

interface UseCampSocketResult {
  socket: Socket | null;
  socketId: string | null;
}

export function useCampSocket(campId: string): UseCampSocketResult {
  const socket = useSocket();
  const [socketId, setSocketId] = useState<string | null>(null);

  useEffect(() => {
    if (!socket) return;

    function joinRoom() {
      socket!.emit(SocketEvents.JOIN_CAMP, { campId });
      setSocketId(socket!.id ?? null);
    }

    if (socket.connected) joinRoom();
    socket.on('connect', joinRoom);

    return () => {
      socket.off('connect', joinRoom);
      if (socket.connected) {
        socket.emit(SocketEvents.LEAVE_CAMP, { campId });
      }
      setSocketId(null);
    };
  }, [socket, campId]);

  return { socket, socketId };
}
