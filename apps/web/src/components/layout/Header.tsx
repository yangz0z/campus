'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@clerk/nextjs';
import { SignInButton, UserButton } from '@clerk/nextjs';

export default function Header() {
  const { isSignedIn } = useAuth();

  return (
    <header className="site-header sticky top-0 z-50 overflow-hidden border-b border-earth-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-screen-lg items-center justify-between px-4">
        <Link href="/" className="site-logo flex items-center gap-2">
          <Image
            src="/campus_logo_horizontal.png"
            alt="CampUs 로고"
            width={120}
            height={32}
            className="h-8 w-auto"
            priority
          />
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
