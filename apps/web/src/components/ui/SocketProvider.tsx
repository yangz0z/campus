'use client';

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import type { Socket } from 'socket.io-client';
import { getSocket, disconnectSocket } from '@/lib/socket';

const SocketContext = createContext<Socket | null>(null);

export function useSocket(): Socket | null {
  return useContext(SocketContext);
}

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { getToken, isSignedIn } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const getTokenRef = useRef(getToken);
  getTokenRef.current = getToken;

  useEffect(() => {
    if (!isSignedIn) {
      disconnectSocket();
      setSocket(null);
      return;
    }

    let mounted = true;

    async function connect() {
      const token = await getTokenRef.current();
      if (!token || !mounted) return;

      const sock = getSocket(token);
      if (mounted) setSocket(sock);
    }

    connect();

    return () => {
      mounted = false;
    };
  }, [isSignedIn]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
}
