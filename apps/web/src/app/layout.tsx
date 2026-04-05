import type { Metadata, Viewport } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { koKR } from '@clerk/localizations';
import Providers from '@/components/ui/Providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'Campus - 캠핑준비 체크리스트',
  description: '캠핑에 필요한 모든 준비물을 체크하세요',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider localization={koKR}>
      <html lang="ko">
        <head>
          <link
            rel="stylesheet"
            as="style"
            crossOrigin="anonymous"
            href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
          />
        </head>
        <body className="font-sans">
          <Providers>{children}</Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
