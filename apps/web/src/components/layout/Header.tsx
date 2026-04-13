'use client';

import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';
import { SignInButton, UserButton } from '@clerk/nextjs';

export default function Header() {
  const { isSignedIn } = useAuth();

  return (
    <header className="site-header sticky top-0 z-50 overflow-hidden border-b border-earth-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-screen-lg items-center justify-between px-4">
        <Link href="/" className="site-logo flex items-center gap-2">
          <svg
            width="22" height="20" viewBox="0 0 22 20" fill="none"
            className="site-logo-icon text-primary-600"
            aria-hidden="true"
          >
            <path
              d="M11 1.5L20.5 17H1.5L11 1.5Z"
              stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"
            />
            <path
              d="M9 17v-3.2a2 2 0 014 0V17"
              stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"
            />
            <line
              x1="1" y1="17" x2="21" y2="17"
              stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"
            />
          </svg>
          <span className="site-logo-wordmark text-[19px] font-black tracking-tight">
            <span className="site-logo-camp text-primary-700">Camp</span>
            <span className="site-logo-us text-warm-500">Us</span>
          </span>
        </Link>

        <nav>
          {!isSignedIn ? (
            <SignInButton mode="modal">
              <button className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700">
                로그인
              </button>
            </SignInButton>
          ) : (
            <div className="flex items-center gap-3">
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
