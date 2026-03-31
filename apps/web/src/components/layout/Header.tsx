'use client';

import { useAuth } from '@clerk/nextjs';
import { SignInButton, UserButton } from '@clerk/nextjs';

export default function Header() {
  const { isSignedIn } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-earth-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-screen-lg items-center justify-between px-4">
        <a href="/" className="text-lg font-bold tracking-tight text-primary-700">
          Campus
        </a>

        <nav>
          {!isSignedIn ? (
            <SignInButton mode="modal">
              <button className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700">
                로그인
              </button>
            </SignInButton>
          ) : (
            <div className="flex items-center gap-3">
              <a
                href="/dashboard"
                className="text-sm font-medium text-gray-600 transition-colors hover:text-primary-700"
              >
                대시보드
              </a>
              <UserButton
                appearance={{
                  elements: { avatarBox: 'h-8 w-8' },
                }}
              />
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
