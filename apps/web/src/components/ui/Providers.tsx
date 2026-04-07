'use client';

import { ToastProvider } from './Toast';
import { ConfirmProvider } from './Confirm';
import { SocketProvider } from './SocketProvider';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <ConfirmProvider>
        <SocketProvider>
          {children}
        </SocketProvider>
      </ConfirmProvider>
    </ToastProvider>
  );
}
